import { Prisma } from "@prisma/client";
import { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";

import config from "../../config";
import ApiError from "../errors/ApiError";
import handleZodError from "../errors/handleZodError";
import handleClientError from "../errors/handleClientError";
import handleValidationError from "../errors/handleValidationError";
import { IGenericErrorMessage } from "../interface/error";

const GlobalErrorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next
) => {

  let statusCode = httpStatus.INTERNAL_SERVER_ERROR as number;
  let message = "Something went wrong";
  let errorMessages: IGenericErrorMessage[] = [];

  if (error instanceof ZodError) {
    const simplified = handleZodError(error);
    statusCode = simplified.statusCode;
    message = simplified.message;
    errorMessages = simplified.errorMessages;
  }

  else if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errorMessages = [{ path: "", message: error.message }];
  }

  else if (error instanceof Prisma.PrismaClientValidationError) {
    const simplified = handleValidationError(error);
    statusCode = simplified.statusCode;
    message = simplified.message;
    errorMessages = simplified.errorMessages;
  }

  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const simplified = handleClientError(error);
    statusCode = simplified.statusCode;
    message = simplified.message;
    errorMessages = simplified.errorMessages;
  }

  else if (error instanceof Error) {
    message = error.message;
    errorMessages = [{ path: "", message: error.message }];
  }

  // ✅ SAFE LOGGING
  if (config.env !== "production") {
    console.error({
      name: error instanceof Error ? error.name : "UnknownError",
      message,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
  });
};



export default GlobalErrorHandler;
