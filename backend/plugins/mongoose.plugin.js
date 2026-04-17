import fp from "fastify-plugin";
import mongoose from "mongoose";

const mongoosePlugin = fp(async (fastify, options) => {
  const { uri } = options;

  try {
    mongoose.connection.on('connected', () => fastify.log.info('mongoose connected'));
    mongoose.connection.on('open', () => fastify.log.info('mongoose open'));
    mongoose.connection.on('disconnected', () => fastify.log.info('mongoose disconnected'));
    mongoose.connection.on('reconnected', () => fastify.log.info('mongoose reconnected'));
    mongoose.connection.on('disconnecting', () => fastify.log.info('mongoose disconnecting'));
    mongoose.connection.on('close', () => fastify.log.info('close'));
    await mongoose.connect(uri, {
      autoIndex: false,
      maxPoolSize: 10,
    });

    fastify.log.info("MongoDB connected");

    fastify.decorate("mongoose", mongoose);

    fastify.addHook("onClose", async () => {
      await mongoose.connection.close();
    });
  } catch (err) {
    fastify.log.error(err);
    fastify.close();
  }
});

export default mongoosePlugin;