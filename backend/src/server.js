import express from "express"
import dotenv from "dotenv"
import cors from "cors";

import sessionRoutes from "./routes/sessionRoutes.js"
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express()

// Vercel rewrites may route `/api/*` to this single handler file and pass the
// original path via `?path=...`. Reconstruct `/api/...` so Express routes
// (like `/api/session`) continue to match.
app.use((req, res, next) => {
  const forwardedPath = req.query?.path;
  if (typeof forwardedPath === "string" && forwardedPath.length > 0) {
    req.url = `/api/${forwardedPath}`;
  }
  next();
});

// middleware
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            process.env.FRONTEND_URL  // will set this in Vercel env vars
        ],
        credentials: true
    })
);

app.use(express.json());
app.use(rateLimiter);

app.use("/api/session", sessionRoutes);

connectDB();

export default app; // ← KEY CHANGE: Vercel needs this instead of app.listen