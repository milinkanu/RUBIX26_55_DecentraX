import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";

export async function GET(req: NextRequest, props: { params: Promise<{ claimId: string }> }) {
    const params = await props.params;
    await connectDB();
    try {
        const { claimId } = params;
        const messages = await Message.find({ claimId }).sort({ createdAt: 1 });
        return NextResponse.json(messages);
    } catch (error: any) {
        return NextResponse.json({ message: "Error fetching messages", error: error.message }, { status: 500 });
    }
}
