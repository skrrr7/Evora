import express from "express"
import dotenv from "dotenv"
import cors from "cors";

import sessionRoutes from "./routes/sessionRoutes.js"
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";


dotenv.config();

console.log(process.env.MONGO_URI);

const app = express()
const PORT = process.env.PORT || 5001 


//middleware
app.use(
    cors({
        origin: "http://localhost:5173",
    })
);
app.use(express.json());
app.use(rateLimiter);



app.use("/api/session", sessionRoutes);


connectDB().then (() => {
    app.listen(PORT, () => {
       console.log("Server started on port:", PORT);
    });
})




