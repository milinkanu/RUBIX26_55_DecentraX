import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Report from "@/models/Report";
import Item from "@/models/Item";
import User from "@/models/User";

export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const { itemId, reportedByEmail, reason, description, evidenceImage } = await req.json();

        if (!itemId || !reportedByEmail || !reason) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const reporter = await User.findOne({ email: reportedByEmail });
        if (!reporter) {
            return NextResponse.json({ message: "Invalid user" }, { status: 401 });
        }

        const report = await Report.create({
            itemId,
            reportedBy: reporter._id,
            reason,
            description,
            evidenceImage
        });

        // Increment reported count on the item for sorting/flags
        await Item.findByIdAndUpdate(itemId, { $inc: { reportedCount: 1 } });

        return NextResponse.json({ success: true, report });

    } catch (error: any) {
        return NextResponse.json({ message: "Error submitting report", error: error.message }, { status: 500 });
    }
}
