import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Item from "@/models/Item";
import { isAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    if (!await isAdmin(req)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    try {
        const { status } = await req.json();

        if (!["approved", "rejected"].includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 });
        }

        const item = await Item.findByIdAndUpdate(
            params.id,
            { status },
            { new: true }
        );

        if (!item) {
            return NextResponse.json({ message: "Item not found" }, { status: 404 });
        }

        return NextResponse.json({ message: `Item ${status} successfully`, item });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    if (!await isAdmin(req)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    try {
        const item = await Item.findByIdAndDelete(params.id);

        if (!item) {
            return NextResponse.json({ message: "Item not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Item deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
