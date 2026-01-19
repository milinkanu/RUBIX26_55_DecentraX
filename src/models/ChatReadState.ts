import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatReadState extends Document {
    userEmail: string;
    claimId: mongoose.Types.ObjectId;
    lastReadAt: Date;
}

const ChatReadStateSchema: Schema<IChatReadState> = new Schema({
    userEmail: { type: String, required: true },
    claimId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Claim",
        required: true
    },
    lastReadAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Compound index for fast lookups
ChatReadStateSchema.index({ userEmail: 1, claimId: 1 }, { unique: true });

const ChatReadState: Model<IChatReadState> = mongoose.models.ChatReadState || mongoose.model<IChatReadState>("ChatReadState", ChatReadStateSchema);

export default ChatReadState;
