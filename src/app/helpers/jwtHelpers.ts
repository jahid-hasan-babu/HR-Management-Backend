import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import prisma from "../lib/prisma";


const generateToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expiresIn: any
): string => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn,
  });
  return token;
};

const generateOTPToken = async (
  payload: Record<string, unknown>,
  secret: Secret,
  expiresIn: any
) => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn,
  });

  await prisma.otpVerificationToken.upsert({
    where: {
      userId: payload.userId as string,
    },
    update: {
      token: token,
    },
    create: {
      userId: payload.userId as string,
      token: token,
    },
  });
  console.log(token)
  return token;
}

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const jwtHelpers = {
  generateToken,
  verifyToken,
  generateOTPToken,
};
