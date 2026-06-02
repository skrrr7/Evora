import {Ratelimit} from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

import dotenv from "dotenv";
dotenv.config();

const hasUpstashConfig =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

// On deployments where Upstash env vars are missing, skip rate-limiting
// instead of crashing all API routes with a 500.
const ratelimit = hasUpstashConfig
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "20 s"),
    })
  : null;

export default ratelimit;