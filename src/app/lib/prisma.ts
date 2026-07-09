import { PrismaClient } from "@prisma/client";

// Singleton pattern for Prisma Client with optimized settings
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    // Disable query logging in production for better performance
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Pre-warm the connection AND run a warm-up query
prisma.$connect().then(async () => {
  console.log("✅ Prisma connected to MongoDB");
  // Warm-up query to initialize connection pool
  await prisma.user.findFirst({ select: { id: true } });
  console.log("✅ Connection pool warmed up");
}).catch((err) => {
  console.error("❌ Prisma connection error:", err);
});

export default prisma;

