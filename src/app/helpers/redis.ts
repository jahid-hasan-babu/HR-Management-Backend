import { Queue } from "bullmq";
import Redis, { RedisOptions } from "ioredis";

// ===============================
// 🔧 Redis Configuration
// ===============================
const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  retryStrategy: (times: number) => {
    if (times > 5) return undefined;
    return Math.min(times * 100, 3000);
  },
  connectTimeout: 10000,
  keepAlive: 30000,
  maxRetriesPerRequest: null,
};

// Create a Redis connection instance
const redis = new Redis(redisOptions);

redis.on("connect", () => console.log("✅ Redis connected successfully"));
redis.on("error", (err: any) => console.error("❌ Redis error:", err));

// ===============================
// 📦 Queues
// ===============================
const otpQueuePhone = new Queue("otp-queue-phone", { connection: redis });
const otpQueueEmail = new Queue("otp-queue-email", { connection: redis });
const messagePersistenceQueue = new Queue("messagePersistenceQueue", {
  connection: redis,
});
const matchCreateQueue = new Queue("match-create-queue", { connection: redis });

const completedMatchQueue = new Queue("completed-match-queue", { connection: redis });

// ===============================
// 🧹 Clean Queues Function
// ===============================
export async function cleanQueues() {
  try {
    await Promise.all([
      otpQueueEmail.clean(0, 1000, "completed"),
      otpQueueEmail.clean(0, 1000, "failed"),
      otpQueueEmail.clean(0, 1000, "delayed"),
      otpQueueEmail.clean(0, 1000, "wait"),

      otpQueuePhone.clean(0, 1000, "completed"),
      otpQueuePhone.clean(0, 1000, "failed"),
      otpQueuePhone.clean(0, 1000, "delayed"),
      otpQueuePhone.clean(0, 1000, "wait"),

      matchCreateQueue.clean(0, 1000, "completed"),
      matchCreateQueue.clean(0, 1000, "failed"),
      // matchCreateQueue.clean(0, 1000, "delayed"),
      matchCreateQueue.clean(0, 1000, "wait"),

      completedMatchQueue.clean(0, 1000, "completed"),
      completedMatchQueue.clean(0, 1000, "failed"),
      // completedMatchQueue.clean(0, 1000, "delayed"),
      completedMatchQueue.clean(0, 1000, "wait"),

      messagePersistenceQueue.clean(0, 1000, "completed"),
      messagePersistenceQueue.clean(0, 1000, "failed"),
      messagePersistenceQueue.clean(0, 1000, "delayed"),
      messagePersistenceQueue.clean(0, 1000, "wait"),
    ]);

    console.log("🧹 All queues cleaned successfully");
  } catch (err) {
    console.error("❌ Error cleaning queues:", err);
  }
}

// Run cleanup on startup
cleanQueues().catch((err) => console.error("❌ Error cleaning queues:", err));

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🚨 Gracefully shutting down...");
  await Promise.all([
    otpQueuePhone.close(),
    otpQueueEmail.close(),
    matchCreateQueue.close(),
    messagePersistenceQueue.close(),
  ]);
  console.log("✅ Queues closed gracefully");
  process.exit(0);
});

// ===============================
// ⏳ Schedule Match Check
// ===============================
export async function scheduleMatchCheck(matchId: string, matchTime: Date) {
  try {
    const now = new Date();
    const matchDate = new Date(matchTime);

    // Calculate delay (milliseconds)
    const delay = matchDate.getTime() - now.getTime() - 2 * 60 * 60 * 1000;
    // const delay = matchDate.getTime() - now.getTime() - 2 * 60 * 1000; 

    // 🎯 1 hour after match start
    const afterStartDelay =
      matchDate.getTime() - now.getTime() + 1 * 60 * 60 * 1000;

    if (delay <= 0) {
      await matchCreateQueue.add("match-create-queue", { matchId });
    } else {
      await matchCreateQueue.add("match-create-queue", { matchId }, { delay });
    }

    await completedMatchQueue.add(
      "completed-match-queue",
      { matchId },
      { delay: afterStartDelay }
    );

  } catch (error) {
    console.error("❌ Error scheduling match check:", error);
  }
}
 

// ===============================
// 📤 Export
// ===============================
export {
  redis,
  otpQueuePhone,
  otpQueueEmail,
  messagePersistenceQueue,
  matchCreateQueue,
  completedMatchQueue,
};
