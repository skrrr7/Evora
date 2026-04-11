import express from "express"
import { createSession, deleteSession, getAllSession, updateSession } from "../controllers/sessionControllers.js";

const router = express.Router();

router.get("/", getAllSession);
router.post("/", createSession);
router.delete("/:id", deleteSession);
router.put("/id", updateSession);

export default router;


 