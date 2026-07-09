import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";
import { AuthControllers } from "./auth.controller";
import { checkOTP } from "../../middlewares/auth";


const router = express.Router();

router.post(
  "/register",
  validateRequest(authValidation.registerUser),
  AuthControllers.registerUser,
);

router.post(
  "/login",
  validateRequest(authValidation.loginUser),
  AuthControllers.loginUser,
);

router.post(
  "/resend-otp",
  validateRequest(authValidation.resendOtp),
  AuthControllers.resendOtp,
);

router.post(
  "/forgot-password",
  validateRequest(authValidation.forgotPassword),
  AuthControllers.forgotPassword,
);
router.post(
  "/verify-otp",
  validateRequest(authValidation.verifyOtp),
  AuthControllers.verifyOtp,
);
router.post(
  "/reset-password",
  validateRequest(authValidation.resetPassword),
  checkOTP,
  AuthControllers.resetPassword,
);

export const AuthRouters = router;
