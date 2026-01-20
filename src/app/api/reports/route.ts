import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Report from "@/models/Report";
import Item from "@/models/Item";
import User from "@/models/User";

export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const { itemId, reportedByEmail, reason } = await req.json();

        if (!itemId || !reportedByEmail || !reason) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const user = await User.findOne({ email: reportedByEmail });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Check if item exists
        const item = await Item.findById(itemId);
        if (!item) {
            return NextResponse.json({ message: "Item not found" }, { status: 404 });
        }

        const report = await Report.create({
            itemId,
            reportedBy: user._id,
            reason
        });

        // Increment reported count on item
        item.reportedCount = (item.reportedCount || 0) + 1;
        await item.save();

        return NextResponse.json({ message: "Report submitted successfully", report }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
