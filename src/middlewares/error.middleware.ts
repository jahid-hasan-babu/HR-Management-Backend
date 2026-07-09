import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { IApiResponse } from '../types/common.types';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const response: IApiResponse<null> = {
      success: false,
      statusCode: err.statusCode,
      message: err.message,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Multer errors
  if (err.message && err.message.includes('Only image files')) {
    const response: IApiResponse<null> = {
      success: false,
      statusCode: 400,
      message: err.message,
    };
    res.status(400).json(response);
    return;
  }

  // Handle unexpected errors
  // eslint-disable-next-line no-console
  console.error('Unexpected error:', err);

  const response: IApiResponse<null> = {
    success: false,
    statusCode: 500,
    message: 'Internal Server Error',
  };
  res.status(500).json(response);
}
