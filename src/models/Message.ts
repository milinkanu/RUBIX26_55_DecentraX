import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
    claimId: mongoose.Types.ObjectId;
    senderEmail: string;
    content: string;
    imageUrl?: string;
    isRead: boolean;
    createdAt: Date;
}

const MessageSchema: Schema<IMessage> = new Schema({
    claimId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Claim",
        required: true,
    },
    senderEmail: { type: String, required: true },
    content: { type: String, required: false },
    imageUrl: { type: String },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

// Prevent Mongoose OverwriteModelError in development
if (process.env.NODE_ENV === "development") {
    delete mongoose.models.Message;
}

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
