import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Claim from "@/models/Claim";
import Item from "@/models/Item";

export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const { itemId, claimantName, claimantEmail, answer } = await req.json();

        // Check if item exists and get finder email
        const item = await Item.findById(itemId).select("+email +phone");
        if (!item) {
            return NextResponse.json({ message: "Item not found" }, { status: 404 });
        }

        const existingClaim = await Claim.findOne({ itemId, claimantEmail });
        if (existingClaim) {
            return NextResponse.json({ message: "You have already claimed this item." }, { status: 400 });
        }


        const newClaim = new Claim({
            itemId,
            finderEmail: item.email,
            claimantName,
            claimantEmail,
            answer,
            status: "pending",
        });

        await newClaim.save();
        return NextResponse.json(newClaim, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error creating claim", error: error.message }, { status: 500 });
    }
}
