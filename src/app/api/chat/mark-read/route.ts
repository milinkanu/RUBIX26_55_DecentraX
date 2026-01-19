import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";

export async function PATCH(req: NextRequest) {
    await connectDB();
    try {
        const { claimId, userEmail } = await req.json();

        if (!claimId || !userEmail) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // Mark all messages in this claim that were NOT sent by the current user as read
        await Message.updateMany(
            { claimId, senderEmail: { $ne: userEmail }, isRead: false },
            { $set: { isRead: true } }
        );

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
