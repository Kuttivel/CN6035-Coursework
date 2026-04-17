// plugins/cleanup.plugin.ts
import fp from "fastify-plugin";
import { Queue, Worker } from "bullmq";
import Product from "../models/product.js";
import Transaction from "../models/transaction.js";

// sync offchain and onchain data
export default fp(async (fastify) => {
  const queueName = "cleanup-queue";

  const queue = new Queue(queueName, {
    connection: fastify.redis,
  });

  const worker = new Worker(
    queueName,
    async () => {
      const now = Date.now();

      const cutOff = new Date(now - 60 * 60 * 1000); // 1hr

      await Promise.all([
        Product.deleteMany({
          active: false,
          createdAt: { $lte: cutOff },
        }),
        Transaction.deleteMany({
          success: false,
          createdAt: { $lte: cutOff },
        }),
      ]);
    },
    {
      connection: fastify.redis,
      concurrency: 1,
    }
  );

  // Ensure repeatable job is registered only once
  fastify.addHook("onReady", async () => {
    const existing = await queue.getJobSchedulers();

    if (!existing.find((j) => j.name === "daily-cleanup")) {
      await queue.add(
        "daily-cleanup",
        {},
        {
          repeat: { pattern: "0 0 * * *" }, // every 24h
          removeOnComplete: true,
          removeOnFail: true,
        }
      );
    }
  });

  fastify.addHook("onClose", async () => {
    await Promise.all([queue.close(), worker.close()]);
  });

  fastify.decorate("cleanupQueue", queue);
});
