
import * as bcrypt from "bcrypt";
import config from "../../config";
import prisma from "../lib/prisma";
import { UserRoleEnum } from "@prisma/client";

const superAdminData = {
  fullName: "Super Admin",
  email: config.super_admin_email as string,
  role: UserRoleEnum.SUPERADMIN,
  password: config.super_admin_password || "12345678",
  isEmailVerified: true,
};

const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExists = await prisma.user.findFirst({
      where: {
        role: UserRoleEnum.SUPERADMIN,
      },
    });

    if (!isSuperAdminExists) {
      superAdminData.password = await bcrypt.hash(
        config.super_admin_password as string,
        Number(config.bcrypt_salt_rounds) || 12
      );
      await prisma.user.create({
        data: superAdminData,
      });
      console.log("Super Admin created successfully");
      return;
    }
    if (isSuperAdminExists) {
      // return;
      console.log("Super Admin already exists.");
      return;
    }
  } catch (error) {
    console.error("Error seeding Super Admin:", error);
  }
};

export default seedSuperAdmin;
