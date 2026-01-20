import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Item from "@/models/Item";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
    if (!await isAdmin(req)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    try {
        const status = req.nextUrl.searchParams.get("status");
        const query: any = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        const items = await Item.find(query).sort({ createdAt: -1 });
        return NextResponse.json(items);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
