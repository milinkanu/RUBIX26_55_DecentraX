import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Claim from "@/models/Claim";
import Item from "@/models/Item";
import Notification from "@/models/Notification";
import { calculateVerificationScore } from "@/lib/verificationService";

export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const { itemId, claimantName, claimantEmail, answers, proofImage } = await req.json();

        // Check if item exists and get finder email
        const item = await Item.findById(itemId).select("+email +phone questions");
        if (!item) {
            return NextResponse.json({ message: "Item not found" }, { status: 404 });
        }

        const existingClaim = await Claim.findOne({ itemId, claimantEmail });
        if (existingClaim) {
            return NextResponse.json({ message: "You have already claimed this item." }, { status: 400 });
        }

        if (item.email === claimantEmail) {
            return NextResponse.json({ message: "You cannot claim your own item." }, { status: 400 });
        }

        // Calculate Confidence Score
        const { score, details } = calculateVerificationScore(item, answers || []);

        const newClaim = new Claim({
            itemId,
            finderEmail: item.email,
            claimantName,
            claimantEmail,
            answers: details,
            confidenceScore: score,
            proofImage, // Optional proof
            status: "pending",
        });

        await newClaim.save();

        // Create Notification for the Finder
        // Create Notification for the Finder
        // Lookup user by email to get their ID
        const User = (await import("@/models/User")).default;
        const finderUser = await User.findOne({ email: item.email });

        if (finderUser) {
            await Notification.create({
                userId: finderUser._id,
                title: `New Claim Request (${score}% Confidence)`,
                message: `${claimantName} has claimed your item "${item.title}". Verification Score: ${score}%`,
                relatedItem: itemId, // Linking to Item, but could store claim ID if schema allowed.
                type: "CLAIM",
            });
        }

        return NextResponse.json(newClaim, { status: 201 });
    } catch (error: any) {
        console.error("Claim Error:", error);
        return NextResponse.json({ message: "Error creating claim", error: error.message }, { status: 500 });
    }
}
