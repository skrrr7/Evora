import express from "express"
import dotenv from "dotenv"
import cors from "cors";

import sessionRoutes from "./routes/sessionRoutes.js"
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express()

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