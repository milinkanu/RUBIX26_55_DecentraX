import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Item from "@/models/Item";

export async function GET(req: NextRequest) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const city = searchParams.get("city");
        const area = searchParams.get("area");

        let query: any = {};

        if (category) {
            query.category = category;
        }

        if (city) {
            query["location.city"] = new RegExp(`^${city}$`, "i");
        }

        if (area) {
            query["location.area"] = new RegExp(area, "i");
        }

        const items = await Item.find(query).sort({ createdAt: -1 });
        return NextResponse.json(items);
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const body = await req.json();
        const newItem = new Item(body);
        await newItem.save();
        return NextResponse.json({ success: true, item: newItem }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
