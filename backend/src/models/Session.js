import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    game: {
      type: String,
      required: true,
      trim: true,
    },

    startMoney: {
      type: Number,
      required: true,
    },

    endMoney: {
      type: Number,
      required: true,
    },

    profit: {
      type: Number,
      default: 0,
    },

    result: {
      type: String,
      enum: ["WIN", "LOSS", "DRAW"],
    },

    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Auto-calculate everything before saving
sessionSchema.pre("save", function (next) {
  this.profit = this.endMoney - this.startMoney;

  if (this.endMoney > this.startMoney) {
    this.result = "WIN";
  } else if (this.endMoney < this.startMoney) {
    this.result = "LOSS";
  } else {
    this.result = "DRAW";
  }

  next();
});

const Session = mongoose.model("Session", sessionSchema);

export default Session;