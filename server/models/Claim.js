import mongoose from "mongoose";

const claimSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  finderEmail: String,
  claimantName: String,
  claimantEmail: String,
  answer: String,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});

export default mongoose.model("Claim", claimSchema);
