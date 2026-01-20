import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import ChatReadState from "@/models/ChatReadState";
import mongoose from "mongoose";

export async function PATCH(req: NextRequest) {
    await connectDB();
    try {
        const { claimId, userEmail } = await req.json();

        if (!claimId || !userEmail) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        console.log(`[MarkRead] Attempting to mark read for Claim: ${claimId}, User: ${userEmail}`);

        // 1. Update the robust ChatReadState (Single Source of Truth for "Unread Count")
        await ChatReadState.findOneAndUpdate(
            { claimId: new mongoose.Types.ObjectId(claimId), userEmail },
            { lastReadAt: new Date() },
            { upsert: true, new: true }
        );

        // 2. Update legacy isRead flags (for Frontend Divider support)
        // We remove 'senderEmail' constraint effectively to strictly force EVERYTHING to read.
        // It's safer. If I am in the chat, everything IS read.
        const updateResult = await Message.updateMany(
            { claimId: new mongoose.Types.ObjectId(claimId), isRead: { $ne: true } },
            { $set: { isRead: true } }
        );

        console.log(`[MarkRead] Result: Match ${updateResult.matchedCount}, Modified ${updateResult.modifiedCount}`);

        // Dispatch navbar event from client-side is handled by the caller, but we return success here
        return NextResponse.json({ success: true, ...updateResult });
    } catch (err: any) {
        console.error(`[MarkRead] Error:`, err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
