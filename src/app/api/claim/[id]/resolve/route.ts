import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Claim from "@/models/Claim";
import Item from "@/models/Item";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    await connectDB();
    try {
        const { id } = params;
        const { userId, email } = await req.json(); // Authenticated user's identifier

        if (!email) {
            return NextResponse.json({ message: "Unauthorized. Email required." }, { status: 401 });
        }

        const claim = await Claim.findById(id).populate({
            path: 'itemId',
            select: '+email' // Force select the hidden email field
        });
        if (!claim) {
            return NextResponse.json({ message: "Claim not found" }, { status: 404 });
        }

        const item: any = claim.itemId;
        if (!item) {
            return NextResponse.json({ message: "Associated Item not found" }, { status: 404 });
        }

        // Authorization Check:
        // Who can mark as solved? ONLY the person who POSTED the item.
        // If Lost Item -> Poster is Owner (item.email)
        // If Found Item -> Poster is Finder (item.email)
        // So in both cases, it's the Item.email.

        // Wait, let's verify logic.
        // Lost Item: Poster (Owner) lost it. Finder finds it.
        //            Finder reports. Owner Approves. Conversation starts.
        //            Item Returned.
        //            Who marks solved? The OWNER (Poster). Correct.

        // Found Item: Poster (Finder) found it. Claimant claims it.
        //             Poster Approves. Conversation starts.
        //             Item Returned to Claimant.
        //             Who marks solved? The FINDER (Poster). Correct.

        if (item.email?.toLowerCase() !== email.toLowerCase()) {
            return NextResponse.json({ message: "Only the item poster can mark this as solved." }, { status: 403 });
        }

        // Update Claim Status
        claim.status = "solved";
        await claim.save();

        // Update Item Status
        // We need to resolve the ITEM status too so it disappears from the feed.
        // Assuming Item has a status field? Let's check Item model.
        // Yes, Item has status: "pending" | "approved" | "rejected".
        // We might need to add "resolved" to Item status or delete it?
        // Let's add "resolved" to Item model logic if not strictly enforced by enum, 
        // or just rely on 'status' if it supports it.
        // The Plan says Update Item.status -> resolved.

        // We might need to update Item model enum if it strictly checks. 
        // Mongoose generic string enum does check.
        // Let's assume we update Item model later or it accepts it.
        // Actually, let's check Item.ts again.

        // Item.ts: status: ["pending", "approved", "rejected"]
        // We will need to update Item enum.
        // For now, let's try to update it and catch error if enum fails.
        // OR better, let's update Item.ts first in next step.

        // For now, let's proceed with logic.

        await Item.findByIdAndUpdate(item._id, { status: "resolved" });

        return NextResponse.json({ success: true, message: "Chat resolved and item marked as solved." });

    } catch (error: any) {
        return NextResponse.json({ message: "Error resolving chat", error: error.message }, { status: 500 });
    }
}
