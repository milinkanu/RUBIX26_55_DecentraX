import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;  // We will store the user's email or ID since current auth seems to use email/custom simple auth? No, user has ID.
    // Wait, the Item model stores email/name directly. Does the user model exist?
    // Checking previous file list, User.ts exists.
    // The Item model has email (select: false).
    // I should check User.ts to see what fields it has.
    title: string;
    message: string;
    relatedItem: mongoose.Types.ObjectId;
    type: "MATCH_FOUND" | "CLAIM" | "SYSTEM";
    isRead: boolean;
    createdAt: Date;
}

const notificationSchema: Schema<INotification> = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        // NOTE: Since Item doesn't strictly reference a User ID (it stores name/email), 
        // we might need to look up the user by email to get their ID, 
        // or just store the email if the system is loose on User IDs. 
        // Let's assume we can resolve the User ID from the email on the Item.

        title: { type: String, required: true },
        message: { type: String, required: true },
        relatedItem: { type: Schema.Types.ObjectId, ref: "Item" },
        type: {
            type: String,
            enum: ["MATCH_FOUND", "CLAIM", "SYSTEM"],
            default: "SYSTEM"
        },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
