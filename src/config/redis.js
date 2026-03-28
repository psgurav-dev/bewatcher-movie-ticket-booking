import Redis from "ioredis";
import { REDIS_URL } from "../utils/const";

const redis = new Redis(REDIS_URL); // Connect to Redis

export default redis;