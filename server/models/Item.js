import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: String,
    phone: { type: String, select: false },
    email: { type: String, select: false },
    title: String,
    description: String,
    verify: String,
    category: {
      type: String,
      enum: ["Mobile", "Wallet", "Documents", "Bag", "Keys", "Electronics", "Other"],
    },
    location: {
      city: String,
      area: String,
      landmark: String,
    },
    file: String,
  },
  { timestamps: true }
);

itemSchema.index({ category: 1 });
itemSchema.index({ "location.city": 1 });
itemSchema.index({ createdAt: -1 });

export default mongoose.model("Item", itemSchema);
