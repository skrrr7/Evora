import express from "express"

const app = express()

app.get("/api/notes", (req,res) => {
    res.status(200).send("you got sessions");
});

app.listen(5001, () => {
    console.log("Server started on port 5001");
});