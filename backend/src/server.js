import express from "express"
import dotenv from "dotenv"
import cors from "cors";

import sessionRoutes from "./routes/sessionRoutes.js"
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express()

app.use(cors({
    origin: [
        "http://localhost:5173",
        process.env.FRONTEND_URL
    ],
    credentials: true
}));

app.use(express.json());
app.use(rateLimiter);

app.get("/api/health", (req, res) => {
    res.status(200).json({ ok: true });
});

app.use("/api/session", sessionRoutes);

connectDB();

app.use((err, req, res, next) => {
    console.error("Unhandled server error:", err);
    res.status(500).json({ message: "Internal server error" });
});

export default app;