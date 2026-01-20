import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import Claim from "@/models/Claim";

// POST /api/native-chat/send
export async function POST(request: Request) {
    try {
        await connectDB();
        const body = await request.json();
        const { claimId, senderEmail, content } = body;

        if (!claimId || !senderEmail || !content) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const newMessage = await Message.create({
            claimId,
            senderEmail,
            content,
            isRead: false
        });

        // Update Claim's updatedAt if needed for sorting, but sorting usually relies on latest message.
        // Good check: ensure Claim exists? Not strictly necessary for speed.

        return NextResponse.json(newMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
