import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClaim extends Document {
    itemId: mongoose.Types.ObjectId;
    finderEmail: string;
    claimantName: string;
    claimantEmail: string;
    answers: { question: string; answer: string; isCorrect: boolean }[];
    confidenceScore: number;
    proofImage?: string;
    status: "pending" | "approved" | "rejected";
}

const claimSchema: Schema<IClaim> = new Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
    },
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
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
});

const Claim: Model<IClaim> = mongoose.models.Claim || mongoose.model<IClaim>("Claim", claimSchema);

export default Claim;
