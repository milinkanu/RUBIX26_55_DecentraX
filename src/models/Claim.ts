import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClaim extends Document {
    itemId: mongoose.Types.ObjectId;
    finderName?: string;
    finderEmail: string;
    claimantName: string;
    claimantEmail: string;
    answers: { question: string; answer: string; isCorrect: boolean }[];
    confidenceScore: number;
    proofImage?: string;
    status: "pending" | "approved" | "rejected" | "solved";
    isBlocked: boolean;
    blockedBy?: string;
}

const claimSchema: Schema<IClaim> = new Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
    },
    finderName: String,
    finderEmail: String,
    claimantName: String,
    claimantEmail: String,
    answers: [{
        question: String,
        answer: String,
        isCorrect: Boolean
    }],
    confidenceScore: Number,
    proofImage: String,
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "solved"],
        default: "pending",
    },
    isBlocked: { type: Boolean, default: false },
    blockedBy: { type: String }, // Email of the user who blocked
}, { timestamps: true });

const Claim: Model<IClaim> = mongoose.models.Claim || mongoose.model<IClaim>("Claim", claimSchema);

export default Claim;
