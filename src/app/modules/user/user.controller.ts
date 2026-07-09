import httpStatus from "http-status";
import { UserServices } from "./user.service";
import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";

const stats = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.stats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stats fetched successfully",
    data: result,
  });
});

const revenueSummary = catchAsync(async (req: Request, res: Response) => {
  const { year } = req.query;
  const result = await UserServices.revenueSummary(year as string | number);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Revenue summary fetched successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const options = req.query;
  const result = await UserServices.getAllUsers(options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await UserServices.getUserById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id;
  const result = await UserServices.getMyProfile(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My profile fetched successfully",
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id;
  const payload = req.body;
  const file = req.file;
  const result = await UserServices.updateUser(id, payload, file);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id;
  const payload = req.body;
  const result = await UserServices.changePassword(id, payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id;
  const result = await UserServices.deleteUser(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User deleted successfully",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const status = req.body.status;
  const result = await UserServices.updateUserStatus(userId, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User status updated successfully",
    data: result,
  });
});

const deleteUserByAdmin = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const result = await UserServices.deleteUserByAdmin(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User deleted successfully",
    data: result,
  });
});

const notificationToggle = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await UserServices.notificationToggle(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User status updated successfully",
    data: result,
  });
});

const deleteProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await UserServices.deleteProfile(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User deleted successfully",
    data: result,
  });
});

export const UserControllers = {
  stats,
  revenueSummary,
  performance,
  getAllUsers,
  getUserById,
  getMyProfile,
  updateUser,
  changePassword,
  deleteUser,
  updateUserStatus,
  deleteUserByAdmin,
  notificationToggle,
  deleteProfile,
};
