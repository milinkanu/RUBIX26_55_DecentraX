import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";

export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const { claimId, senderEmail, content } = await req.json();

        if (!claimId || !senderEmail || !content) {
            return NextResponse.json({ message: "Missing fields" }, { status: 400 });
        }

        const newMessage = new Message({
            claimId,
            senderEmail,
            content,
        });

        await newMessage.save();
        return NextResponse.json(newMessage, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error sending message", error: error.message }, { status: 500 });
    }
}
