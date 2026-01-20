import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import ChatReadState from "@/models/ChatReadState";

export async function GET(req: NextRequest, props: { params: Promise<{ claimId: string }> }) {
    const params = await props.params;
    await connectDB();
    try {
        const { claimId } = params;
        const url = new URL(req.url);
        const email = url.searchParams.get("email");

        const messages = await Message.find({ claimId }).sort({ createdAt: 1 });

        if (email) {
            // New logic: Return metadata for smart frontend handling
            const readState = await ChatReadState.findOne({
                userEmail: email,
                claimId: claimId
            }).lean();

            return NextResponse.json({
                messages,
                lastReadAt: readState ? readState.lastReadAt : null
            });
        }

        // Legacy support: Return just array
        return NextResponse.json(messages);
    } catch (error: any) {
        return NextResponse.json({ message: "Error fetching messages", error: error.message }, { status: 500 });
    }
}
