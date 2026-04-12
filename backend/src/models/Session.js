import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
  }, 
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema)

export default Session