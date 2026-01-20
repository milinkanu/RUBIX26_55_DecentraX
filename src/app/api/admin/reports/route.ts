import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Report from "@/models/Report";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
    if (!await isAdmin(req)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    try {
        const reports = await Report.find({})
            .populate('itemId', 'title type status file')
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json(reports);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
