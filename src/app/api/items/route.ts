import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Item from "@/models/Item";

export async function GET(req: NextRequest) {
    await connectDB();
    try {
        const searchParams = req.nextUrl.searchParams;
        const category = searchParams.get("category");
        const city = searchParams.get("city");
        const area = searchParams.get("area");
        const type = searchParams.get("type");

        console.log("Filters received:", { category, city, area, type });

        let query: any = {};

        if (type) {
            const trimmedType = type.trim();
            // Handle case where type might be missing (defaults to "Found" in UI)
            if (trimmedType.toLowerCase() === 'found') {
                query.$or = [
                    { type: new RegExp(trimmedType, "i") },
                    { type: { $exists: false } }, // Legacy data support
                    { type: null }
                ];
            } else {
                query.type = new RegExp(trimmedType, "i");
            }
        }

        if (category) {
            query.category = new RegExp(category.trim(), "i");
        }

        if (city) {
            query["location.city"] = new RegExp(city.trim(), "i");
        }

        if (area) {
            query["location.area"] = new RegExp(area.trim(), "i");
        }

        console.log("Query built:", query);
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
