import { UserRecord } from "firebase-admin/lib/auth/user-record";
import prisma from "./prisma";
import { UserRoleEnum } from "@prisma/client";

// You need to implement a function that checks if the user is an admin or super admin
const checkIfUserIsAdminOrSuperAdmin = async (userId: string) => {
  // Fetch the user role from the database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user && (user.role === UserRoleEnum.ADMIN || user.role === UserRoleEnum.SUPERADMIN)) {
    return true;
  }
  return false;
};

export default checkIfUserIsAdminOrSuperAdmin;