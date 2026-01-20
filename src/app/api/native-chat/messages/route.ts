import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import Claim from "@/models/Claim";

// GET /api/native-chat/messages?claimId=...
export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const claimId = searchParams.get("claimId");

        if (!claimId) {
            return NextResponse.json({ error: "Missing claimId" }, { status: 400 });
        }

        // Fetch messages sorted by createdAt ascending (oldest first)
        const messages = await Message.find({ claimId }).sort({ createdAt: 1 });

        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
