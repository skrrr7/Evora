import Session from "../models/session.js";

export const getAllSession = async (req,res) => {
    try {
        const sessions = await Session.find().sort({createdAt: -1 });
        res.status(200).json(sessions)

    } catch (error) {
        console.error("Error in getAllSession controller", error);
        res.status(500).json({message:"Internal server error"});
    }
}

export const getSessionById = async(req, res) =>{
    try {
        const session = await Session.findById(req.params.id)
        if(!session) return res.status(404).json({message:"session not found"});
        res.json(session);
    } catch (error) {
        console.error("Error in getSessionById controller", error);
        res.status(500).json({message:"Internal server error"});
    }
}

export const createSession = async (req,res) => {
    try {
        const {title, content} = req.body
        console.log(title, content)
        const session = new Session({title, content})

        const savedSession = await session.save();
        res.status(201).json(savedSession);

    } catch (error) {
        console.error("Error in createSession controller", error);
        res.status(500).json({message:"Internal server error"});
    }
    
}

export const deleteSession = async (req,res) => {
    try {
        const deletedSession = await Session.findByIdAndDelete(req.params.id);
        if (!deletedSession) return res.status(404).json({message:"session not found"});
        res.stauts(200).json({message:"Note deleted"});

    } catch (error) {
        console.error("Error in deleteSession controller", error);
        res.status(500).json({message:"Internal server error"});
    }
}

export const updateSession = async (req,res) => {
    try {
        const {title,content} = req.body
        const updatedSession = await Session.findByIdAndUpdate(
            req.params.id,
            {title,content},
            {
                new: true,
            }
        );
        if (!updatedSession) return res.status(404).json({message:"session not found"});
        res.status(200).json(updatedSession);
        
    } catch (error) {
        console.error("Error in updateSession controller", error);
        res.status(500).json({message:"Internal server error"});
    }
}