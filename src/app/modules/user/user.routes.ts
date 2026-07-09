import express from "express";
import { UserControllers } from "./user.controller";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../middlewares/fileUploader";
import parseBodyData from "../../middlewares/parseBodyData";
import { UserRoleEnum } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidations } from "./user.validation";

const router = express.Router();

router.get(
  "/all-users",
  auth(),
  UserControllers.getAllUsers,
);

router.get(
  "/dashboard-overview-stats",
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
  UserControllers.stats,
);

router.get(
  "/dashboard-revenue-summary",
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
  UserControllers.revenueSummary,
);

router.get("/me", auth(), UserControllers.getMyProfile);

router.get("/:id", auth(), UserControllers.getUserById);

router.patch(
  "/change-password",
  auth(),
  validateRequest(UserValidations.changePassword),
  UserControllers.changePassword,
);

router.patch(
  "/update-profile",
  auth(),
  fileUploader.uploadProfileImage,
  parseBodyData,
  UserControllers.updateUser,
);

router.patch(
  "/update-status/:userId",
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
  UserControllers.updateUserStatus,
);

router.delete(
  "/delete-user-by-admin/:userId",
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
  UserControllers.deleteUserByAdmin,
);

router.patch(
  "/notification-toggle",
  auth(),
  UserControllers.notificationToggle,
);

router.delete("/delete-profile", auth(), UserControllers.deleteProfile);

export const UserRouters = router;
