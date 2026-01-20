import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReport extends Document {
    itemId: mongoose.Types.ObjectId;
    reportedBy: mongoose.Types.ObjectId;
    reason: string;
    description?: string;
    evidenceImage?: string;
    createdAt: Date;
}

const ReportSchema: Schema<IReport> = new Schema(
    {
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true,
        },
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        evidenceImage: {
            type: String, // URL from Cloudinary
        },
    },
    { timestamps: true }
);

const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);

export default Report;
