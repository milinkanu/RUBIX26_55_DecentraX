import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import User from "@/models/User";

export async function GET(req: NextRequest) {
    await connectDB();
    try {
        const email = req.nextUrl.searchParams.get("email");
        if (!email) {
            return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json([]);
        }

        // Fetch notifications of type MATCH_FOUND
        // We include populated relatedItem
        const matches = await Notification.find({
            userId: user._id,
            type: "MATCH_FOUND"
        })
            .populate("relatedItem")
            .sort({ createdAt: -1 });

        console.log(`[API] Found ${matches.length} match notifications for user ${email}`);
        return NextResponse.json(matches);
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
