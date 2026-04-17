import fp from "fastify-plugin";
import Redis from "ioredis";

const redisPlugin = fp(async (fastify) => {
    const redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
    });

    redis.ping();

    fastify.decorate("redis", redis);
})

export default redisPlugin;