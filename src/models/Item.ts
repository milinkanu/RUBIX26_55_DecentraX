import mongoose, { Schema, Document, Model } from "mongoose";

export interface IItem extends Document {
    name: string;
    phone: string;
    email: string;
    title: string;
    description: string;
    verify: string;
    category: string;
    type?: string;
    location: {
        city: string;
        area: string;
        landmark?: string;
    };
    keywords?: string[];
    file: string;
    questions?: { question: string; answer: string }[];
    status: "pending" | "approved" | "rejected";
    reportedCount: number;
    createdAt: Date;
}

const itemSchema: Schema<IItem> = new Schema(
    {
        name: String,
        phone: { type: String, select: false },
        email: { type: String, select: false },
        title: String,
        description: String,
        verify: String,
        type: { type: String, default: "Found" },
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
        keywords: [String],
        // Verification Questions (truth set by finder)
        questions: [{
            question: String,
            answer: String
        }],
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "approved", // Moderation enabled by default
        },
        reportedCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

itemSchema.index({ category: 1 });
itemSchema.index({ "location.city": 1 });
itemSchema.index({ createdAt: -1 });

const Item: Model<IItem> = mongoose.models.Item || mongoose.model<IItem>("Item", itemSchema);

export default Item;
