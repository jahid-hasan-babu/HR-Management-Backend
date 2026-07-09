import * as bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma";
import { IUserLogin, IUserRegister } from "./auth.interface ";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import { sendOtpToGmail } from "../../helpers/sendOtpToEmail";

const registerUser = async (payload: IUserRegister) => {
  const email = payload.email.trim().toLowerCase();

  return await prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({
      where: { email },
    });

    if (existingUser && !existingUser.isDeleted) {
      throw new ApiError(httpStatus.CONFLICT, "User already exists");
    }

    if (existingUser && existingUser.status === "BLOCKED") {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Your account has been blocked, please contact support",
      );
    }

    const saltRounds = parseInt(config.bcrypt_salt_rounds as string, 10);
    const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

    const user = await tx.user.create({
      data: {
        password: hashedPassword,
        fullName: payload.fullName,
        email: email,
        fcmToken: payload.fcmToken,
      },
    });

    await sendOtpToGmail({ email: user.email as string, id: user.id });

    return {
      id: user.id,
    };
  });
};

const loginUserFromDB = async (payload: IUserLogin) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
    select: {
      id: true,
      email: true,
      password: true,
      fullName: true,
      role: true,
      status: true,
      isEmailVerified: true,
      profileImage: true,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }

  if (userData.status === "BLOCKED" || userData.status === "INACTIVE") {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Your account has been blocked, please contact support",
    );
  }

  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    userData.password as string,
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect");
  }

  if (userData.isEmailVerified === false) {
    sendOtpToGmail({ email: userData.email as string, id: userData.id });
    return {
      id: userData.id,
      message: "We have sent a OTP to your email for verification",
      isEmailVerified: userData.isEmailVerified,
    };
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email as string,
      role: userData.role,
    },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string,
  );

  if (payload.fcmToken) {
    prisma.user
      .update({
        where: {
          id: userData.id,
        },
        data: {
          fcmToken: payload.fcmToken,
        },
      })
      .catch((err) => console.error("FCM token update error:", err));
  }

  return {
    id: userData.id,
    fullName: userData.fullName,
    email: userData.email,
    role: userData.role,
    profileImage: userData.profileImage,
    accessToken,
  };
};

const resendOtp = async (email: string) => {
  const userData = await prisma.user.findUnique({
    where: { email: email, isDeleted: false },
  });

  if (!userData) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }
  sendOtpToGmail({ email: email, id: userData.id });
  return {
    userId: userData.id,
  };
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUnique({
    where: { email: payload.email, isDeleted: false },
  });

  if (!userData) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }
  sendOtpToGmail({ email: payload.email, id: userData.id });

  return {
    userId: userData.id,
  };
};

const verifyOtp = async (payload: {
  userId: string;
  otpCode: number;
  type: string;
}) => {
  const otpData = await prisma.otp.findUnique({
    where: {
      userId: payload.userId,
    },
  });
  if (!otpData) {
    throw new ApiError(httpStatus.NOT_FOUND, "OTP not found");
  }

  if (otpData.otpCode !== payload.otpCode) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  if (otpData.expiresAt < new Date()) {
    throw new ApiError(httpStatus.REQUEST_TIMEOUT, "OTP expired");
  }

  await prisma.otp.delete({
    where: {
      id: otpData.id,
    },
  });

  if (payload.type === "PASSWORD_RESET") {
    const accessToken = await jwtHelpers.generateOTPToken(
      {
        userId: payload.userId,
        hexCode: payload.otpCode as any,
      },
      config.jwt.reset_pass_secret as Secret,
      config.jwt.reset_pass_token_expires_in as string,
    );
    return { accessToken };
  } else if (payload.type === "EMAIL_VERIFICATION") {
    const userData = await prisma.user.update({
      where: {
        id: payload.userId,
      },
      data: {
        isEmailVerified: true,
      },
    });
    const accessToken = jwtHelpers.generateToken(
      {
        id: userData.id,
        email: userData.email as string,
        role: userData.role,
      },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in as string,
    );
    return { accessToken };
  }
};

const resetPassword = async (userId: string, newPassword: string) => {
  const otpToken = await prisma.otpVerificationToken.findUnique({
    where: {
      userId: userId,
    },
  });
  if (!otpToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
  }
  const hashedPassword: string = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });

  await prisma.otpVerificationToken.delete({
    where: {
      userId: userId,
    },
  });

  return {
    message: "please login",
  };
};

export const AuthServices = {
  registerUser,
  loginUserFromDB,
  forgotPassword,
  resendOtp,
  verifyOtp,
  resetPassword,
};
