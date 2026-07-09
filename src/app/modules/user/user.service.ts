import * as bcrypt from "bcrypt";
import httpStatus from "http-status";
import {
  PlanType,
  RevenueStatus,
  UserRoleEnum,
  UserStatus,
} from "@prisma/client";
import prisma from "../../lib/prisma";
import { IPaginationOptions } from "../../interface/pagination.type";
import { paginationHelper } from "../../helpers/paginationHelper";
import ApiError from "../../errors/ApiError";
import { deleteFromS3ByUrl } from "../../lib/deleteFromS3ByUrl";
import { fileUploader } from "../../middlewares/fileUploader";
import config from "../../../config";
import cache from "../../helpers/cache";

const buildMonthlyTrend = (current: number, previous: number) => {
  const change = current - previous;
  const percentageChange =
    previous === 0
      ? current === 0
        ? 0
        : 100
      : Number(((Math.abs(change) / previous) * 100).toFixed(2));

  return {
    current,
    previous,
    change,
    percentageChange,
    trend: change > 0 ? "increase" : change < 0 ? "decrease" : "stable",
  };
};

const stats = async () => {
  return cache.getOrSet(
    "dashboard:stats",
    async () => {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const [
        totalUsers,
        totalSubscriptionUsers,
        totalFreeUsers,
        currentMonthUsers,
        previousMonthUsers,
        currentMonthSubscriptionUsers,
        previousMonthSubscriptionUsers,
        currentMonthFreeUsers,
        previousMonthFreeUsers,
        totalRevenueResult,
        currentMonthRevenueResult,
        previousMonthRevenueResult,
      ] = await Promise.all([
        prisma.user.count({
          where: { role: UserRoleEnum.USER },
        }),
        prisma.user.count({
          where: {
            role: UserRoleEnum.USER,
            isSubscribed: true,
          },
        }),
        prisma.user.count({
          where: {
            role: UserRoleEnum.USER,
            isSubscribed: false,
          },
        }),
        prisma.user.count({
          where: {
            role: UserRoleEnum.USER,
            createdAt: {
              gte: currentMonthStart,
              lt: nextMonthStart,
            },
          },
        }),
        prisma.user.count({
          where: {
            role: UserRoleEnum.USER,
            createdAt: {
              gte: previousMonthStart,
              lt: currentMonthStart,
            },
          },
        }),
        prisma.user.count({
          where: {
            role: UserRoleEnum.USER,
            isSubscribed: true,
            createdAt: {
              gte: currentMonthStart,
              lt: nextMonthStart,
            },
          },
        }),
        prisma.user.count({
          where: {
            role: UserRoleEnum.USER,
            isSubscribed: true,
            createdAt: {
              gte: previousMonthStart,
              lt: currentMonthStart,
            },
          },
        }),
        prisma.user.count({
          where: {
            role: UserRoleEnum.USER,
            isSubscribed: false,
            createdAt: {
              gte: currentMonthStart,
              lt: nextMonthStart,
            },
          },
        }),
        prisma.user.count({
          where: {
            role: UserRoleEnum.USER,
            isSubscribed: false,
            createdAt: {
              gte: previousMonthStart,
              lt: currentMonthStart,
            },
          },
        }),
        prisma.revenue.aggregate({
          where: { status: RevenueStatus.COMPLETED },
          _sum: { amount: true },
        }),
        prisma.revenue.aggregate({
          where: {
            status: RevenueStatus.COMPLETED,
            createdAt: {
              gte: currentMonthStart,
              lt: nextMonthStart,
            },
          },
          _sum: { amount: true },
        }),
        prisma.revenue.aggregate({
          where: {
            status: RevenueStatus.COMPLETED,
            createdAt: {
              gte: previousMonthStart,
              lt: currentMonthStart,
            },
          },
          _sum: { amount: true },
        }),
      ]);

      const totalRevenue = totalRevenueResult._sum.amount ?? 0;
      const currentMonthRevenue = currentMonthRevenueResult._sum.amount ?? 0;
      const previousMonthRevenue = previousMonthRevenueResult._sum.amount ?? 0;

      return {
        totalUsers,
        totalSubscriptionUsers,
        totalFreeUsers,
        totalRevenue,
        trends: {
          totalUsers: buildMonthlyTrend(currentMonthUsers, previousMonthUsers),
          totalSubscriptionUsers: buildMonthlyTrend(
            currentMonthSubscriptionUsers,
            previousMonthSubscriptionUsers,
          ),
          totalFreeUsers: buildMonthlyTrend(
            currentMonthFreeUsers,
            previousMonthFreeUsers,
          ),
          revenue: buildMonthlyTrend(currentMonthRevenue, previousMonthRevenue),
        },
      };
    },
    30,
  );
};

const revenueSummary = async (year?: string | number) => {
  const selectedYear =
    typeof year === "string"
      ? Number.parseInt(year, 10)
      : typeof year === "number"
        ? year
        : new Date().getFullYear();

  const safeYear = Number.isFinite(selectedYear)
    ? selectedYear
    : new Date().getFullYear();

  return cache.getOrSet(
    `dashboard:revenue-summary:${safeYear}`,
    async () => {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const yearStart = new Date(safeYear, 0, 1);
      const nextYearStart = new Date(safeYear + 1, 0, 1);

      const monthlyRevenuePromises = monthNames.map((_, monthIndex) => {
        const monthStart = new Date(safeYear, monthIndex, 1);
        const nextMonthStart = new Date(safeYear, monthIndex + 1, 1);

        return prisma.revenue.aggregate({
          where: {
            status: RevenueStatus.COMPLETED,
            createdAt: {
              gte: monthStart,
              lt: nextMonthStart,
            },
          },
          _sum: { amount: true },
        });
      });

      const [yearRevenueResult, monthlyRevenueResults] = await Promise.all([
        prisma.revenue.aggregate({
          where: {
            status: RevenueStatus.COMPLETED,
            createdAt: {
              gte: yearStart,
              lt: nextYearStart,
            },
          },
          _sum: { amount: true },
        }),
        Promise.all(monthlyRevenuePromises),
      ]);

      const monthlyRevenue = monthlyRevenueResults.map((result, index) => ({
        month: index + 1,
        monthName: monthNames[index],
        amount: result._sum.amount ?? 0,
      }));

      return {
        year: safeYear,
        totalRevenue: yearRevenueResult._sum.amount ?? 0,
        monthlyRevenue,
      };
    },
    30,
  );
};

const getAllUsers = async (
  options: IPaginationOptions & {
    search?: string;
    filter?: string;
  },
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { search, filter } = options;

  const whereCondition: any = {};

  if (filter) {
    whereCondition.planType = filter.trim() as PlanType;
  }

  if (search) {
    whereCondition.OR = [
      {
        fullName: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: { not: UserRoleEnum.SUPERADMIN },
        ...whereCondition,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        profileImage: true,
        isSubscribed: true,
        planType: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.user.count({
      where: {
        role: { not: UserRoleEnum.SUPERADMIN },
        ...whereCondition,
      },
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    },
    data: users,
  };
};

const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      profileImage: true,
      createdAt: true,
    },
  });

  return user;
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      profileImage: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

const updateUser = async (id: string, payload: any, file: any) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  let profileImage = existingUser.profileImage;

  if (file) {
    if (profileImage) {
      await deleteFromS3ByUrl(existingUser.profileImage as string);
    }
    const uploadResult = await fileUploader.uploadToDigitalOcean(file);
    profileImage = uploadResult.Location;
  }

  const result = await prisma.user.update({
    where: { id },
    data: {
      fullName: payload.fullName,
      profileImage: profileImage,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      profileImage: true,
      createdAt: true,
    },
  });
  return result;
};

const changePassword = async (
  id: string,
  payload: { currentPassword: string; newPassword: string },
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { password: true },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const bcryptPassword = existingUser.password;
  const isMatch = await bcrypt.compare(
    payload.currentPassword,
    bcryptPassword as string,
  );

  if (!isMatch) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Current password is incorrect");
  }

  const saltRounds = parseInt(config.bcrypt_salt_rounds as string, 10);

  const hashedPassword = await bcrypt.hash(payload.newPassword, saltRounds);

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

  return;
};

const deleteUser = async (id: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  await prisma.user.delete({
    where: { id },
  });
  return;
};

const updateUserStatus = async (userId: string, status: UserStatus) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  const result = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      profileImage: true,
      status: true,
      createdAt: true,
    },
  });
  return result;
};

const deleteUserByAdmin = async (userId: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  await prisma.user.delete({
    where: { id: userId },
  });
  return;
};

const notificationToggle = async (userId: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  // Toggle the isNotified field
  const result = prisma.user.update({
    where: { id: userId },
    data: { isNotified: !existingUser.isNotified },
    select: {
      id: true,
      isNotified: true,
    },
  });
  return result;
};

const deleteProfile = async (userId: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  await prisma.user.delete({
    where: { id: userId },
  });
  return;
};

export const UserServices = {
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
