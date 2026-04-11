import express from "express"
import sessionRoutes from "./routes/sessionRoutes.js"
import { connectDB } from "./config/db.js";
import dotenv from "dotenv"

dotenv.config();

console.log(process.env.MONGO_URI);

const app = express()
const PORT = process.env.PORT || 5001 

connectDB();

app.use("/api/session", sessionRoutes);


app.listen(PORT, () => {
    console.log("Server started on port:", PORT);
});



