import express from "express"
import sessionRoutes from ".routes/sessionRoutes.js"

const app = express()

app.use("/api/session", sessionRoutes);


app.listen(5001, () => {
    console.log("Server started on port 5001");
});