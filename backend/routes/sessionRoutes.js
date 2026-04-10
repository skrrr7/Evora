import express from "express"

const router = express.Router();

router.get("/", (req,res) => {
    res.status(200).send("you just fetched the sessions");
});

router.post("/", (req,res) => {
    res.status(201).json({message:"Session added successfully"})
});

router.delete("/:id", (req,res) => {
    res.status(200).json({message:"session added successfully"})
});

export default router;


