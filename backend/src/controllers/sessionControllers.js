import Session from "../models/Session.js";

// GET ALL
export const getAllSession = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error in getAllSession controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET BY ID
export const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    res.status(200).json(session);
  } catch (error) {
    console.error("Error in getSessionById controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// CREATE SESSION (UPDATED)
export const createSession = async (req, res) => {
  try {
    const { title, game, startMoney, endMoney, notes } = req.body;

    const session = new Session({
      title,
      game,
      startMoney,
      endMoney,
      notes,
    });

    const savedSession = await session.save();
    res.status(201).json(savedSession);
  } catch (error) {
    console.error("Error in createSession controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE
export const deleteSession = async (req, res) => {
  try {
    const deletedSession = await Session.findByIdAndDelete(req.params.id);

    if (!deletedSession)
      return res.status(404).json({ message: "Session not found" });

    res.status(200).json({ message: "Session deleted" });
  } catch (error) {
    console.error("Error in deleteSession controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE SESSION — use save() so `pre('save')` recalculates profit + result
export const updateSession = async (req, res) => {
  try {
    const { title, game, startMoney, endMoney, notes } = req.body;

    const doc = await Session.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Session not found" });

    doc.set({ title, game, startMoney, endMoney, notes });
    const updatedSession = await doc.save();

    res.status(200).json(updatedSession);
  } catch (error) {
    console.error("Error in updateSession controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};