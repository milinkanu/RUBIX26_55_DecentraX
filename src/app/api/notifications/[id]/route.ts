import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    await connectDB();
    try {
        const { id } = params;

        await Notification.findByIdAndUpdate(id, { isRead: true });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
