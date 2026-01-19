import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Item from "@/models/Item";
import Notification from "@/models/Notification";
import Claim from "@/models/Claim";

// GET a single item
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();
    try {
        const { id } = await params;
        const logMsg = `[${new Date().toISOString()}] Fetching item: ${id}\n`;
        require('fs').appendFileSync('api_debug.log', logMsg);
        console.log(`[API] Fetching item with ID: ${id}`);

        const item = await Item.findById(id).select("+email +phone");
        if (!item) {
            return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
        }
        return NextResponse.json(item);
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

// UPDATE an item
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();
    try {
        const { id } = await params;
        const body = await req.json();
        const { email, ...updateData } = body;

        if (!email) {
            return NextResponse.json({ success: false, message: "Email required for verification" }, { status: 400 });
        }

        const item = await Item.findById(id).select("+email");
        if (!item) {
            return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
        }

        if (item.email !== email) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        // Handle nested location update if present
        if (updateData.location) {
            updateData.location = {
                ...item.location,
                ...updateData.location
            };
        }

        const updatedItem = await Item.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        return NextResponse.json({ success: true, item: updatedItem });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

// DELETE an item
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();
    try {
        const { id } = await params;
        // Some clients don't send body with DELETE, so we'll check query or headers if needed
        // But for now we stick to body as per our previous implementation
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });
        }

        const item = await Item.findById(id).select("+email");
        if (!item) {
            return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
        }

        if (item.email !== email) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        await Item.findByIdAndDelete(id);

        // Clean up related notifications and claims
        await Promise.all([
            Notification.deleteMany({
                $or: [
                    { relatedItem: id },
                    { sourceItem: id }
                ]
            }),
            Claim.deleteMany({ itemId: id })
        ]);

        return NextResponse.json({ success: true, message: "Deleted successfully" });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
