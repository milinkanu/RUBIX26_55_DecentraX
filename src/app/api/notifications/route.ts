import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import User from "@/models/User";
import Item from "@/models/Item"; // Ensure Item is registered

export async function GET(req: NextRequest) {
    await connectDB();
    try {
        const searchParams = req.nextUrl.searchParams;
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // User not found? Maybe return empty
            return NextResponse.json([]);
        }

        // Fetch unread notifications
        const notifications = await Notification.find({ userId: user._id, isRead: false })
            .populate("relatedItem") // Populate item details
            .sort({ createdAt: -1 });

        return NextResponse.json(notifications);
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
