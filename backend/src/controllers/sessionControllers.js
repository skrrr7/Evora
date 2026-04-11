export const getAllSession = (req,res) => {
    res.status(200).send("Session fetched successfully");
}

export const createSession = (req,res) => {
    res.status(201).json({ message: "Session created successfully"});
}

export const deleteSession = (req,res) => {
    res.status(200).json({ message: "Session deleted successfully"});
}

export const updateSession = (req,res) => {
    res.status(200).json({ message: "Session updated successfully"});
}