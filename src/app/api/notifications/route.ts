import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import User from "@/models/User";
import Item from "@/models/Item"; // Ensure Item is registered

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const searchParams = req.nextUrl.searchParams;
        const email = searchParams.get("email");
        const filter = searchParams.get("filter"); // 'unread' (default) or 'all'

        if (!email) {
            return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json([]);
        }

        // Build query
        const query: any = { userId: user._id };
        if (filter !== 'all') {
            query.isRead = false;
        }

        // Fetch notifications
        const notifications = await Notification.find(query)
            .populate("relatedItem") // Populate item details
            .sort({ createdAt: -1 })
            .limit(filter === 'all' ? 50 : 0); // Limit history to 50

        // Filter out notifications where the related item has been deleted
        const validNotifications = notifications.filter(n => {
            // If it's a MATCH_FOUND typ notification, relatedItem IS required.
            // For other types (like system alerts), relatedItem might be optional.
            if (n.type === 'MATCH_FOUND' || n.type === 'CLAIM') {
                return n.relatedItem !== null;
            }
            return true;
        });

        return NextResponse.json(validNotifications);
    } catch (err: any) {
        console.error("Error in api/notifications:", err);
        return NextResponse.json({ success: false, message: "Internal Server Error", error: err.message }, { status: 500 });
    }
}
