import express from "express"
import dotenv from "dotenv"
import cors from "cors";
import path from "path";

import sessionRoutes from "./routes/sessionRoutes.js"
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";


dotenv.config();

console.log(process.env.MONGO_URI);

const app = express()
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve(); 


//middleware
if(process.env.NODE_ENV !== "production"){
    app.use(
        cors({
            origin: "http://localhost:5173",
        })
    );
}

app.use(express.json());
app.use(rateLimiter);


app.use("/api/session", sessionRoutes);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend", "dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname,"../frontend", "dist", "index.html"));
    });
} 


connectDB().then (() => {
    app.listen(PORT, () => {
       console.log("Server started on port:", PORT);
    });
})




