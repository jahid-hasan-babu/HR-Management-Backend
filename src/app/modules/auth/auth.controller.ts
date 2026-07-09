import httpStatus from "http-status";
import sendResponse from "../../helpers/sendResponse";
import { AuthServices } from "./auth.service";
import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.registerUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User registered successfully please verify your email",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUserFromDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
    message: result.message ? result.message : "User logged in successfully",
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.forgotPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP sent successfully",
    data: result,
  });
});

const verifyOtp = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthServices.verifyOtp(payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP verified successfully",
    data: result,
  });
});

const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthServices.resendOtp(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP resent successfully",
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const newPassword = req.body.newPassword;
  const result = await AuthServices.resetPassword(userId, newPassword);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password Reset successfully please login",
    data: result,
  });
});

export const AuthControllers = {
  loginUser,
  forgotPassword,
  verifyOtp,
  resendOtp,
  resetPassword,
  registerUser,
};
