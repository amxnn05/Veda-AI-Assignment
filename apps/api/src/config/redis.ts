import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();
export const redis = new IORedis(
    process.env.REDIS_URL!,
    {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,

        tls: {}
    }
);