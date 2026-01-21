import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Claim from "@/models/Claim";
import Item from "@/models/Item";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { calculateVerificationScore } from "@/lib/verificationService";

export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const { itemId, claimantName, claimantEmail, answers, proofImage } = await req.json();

        // Check if item exists and get finder email
        const item = await Item.findById(itemId).select("+email +phone questions title name type");
        if (!item) {
            return NextResponse.json({ message: "Item not found" }, { status: 404 });
        }

        // Check for existing claim (as either claimant or finder)
        const existingClaim = await Claim.findOne({
            itemId,
            $or: [{ claimantEmail }, { finderEmail: claimantEmail }]
        });

        if (existingClaim) {
            return NextResponse.json({ message: "You have already submitted a request for this item." }, { status: 400 });
        }

        if (item.email === claimantEmail) {
            return NextResponse.json({ message: "You cannot claim or report your own item." }, { status: 400 });
        }

        let finderEmail = item.email;
        let finderName = item.name;
        let finalClaimantName = claimantName;
        let finalClaimantEmail = claimantEmail;
        let score = 0;
        let details: any[] = [];
        let notificationTitle = "";
        let notificationMessage = "";

        if (item.type?.toLowerCase() === "lost") {
            // If item was Lost, the person reporting (currentUser) is the FINDER
            // The person who posted (item.email) is the CLAIMANT (Owner)
            finderEmail = claimantEmail;
            finderName = claimantName;
            finalClaimantEmail = item.email;
            finalClaimantName = item.name; // Owner's name

            score = 100; // No verification needed, they found it
            notificationTitle = "Item Found!";
            notificationMessage = `${claimantName} has reported finding your lost item "${item.title}". Check your dashboard to connect.`;
        } else {
            // Standard flow: Item was Found, currentUser is claiming it
            const verifyResult = calculateVerificationScore(item, answers || []);
            score = verifyResult.score;
            details = verifyResult.details;

            notificationTitle = `New Claim Request (${score}% Confidence)`;
            notificationMessage = `${claimantName} has claimed your item "${item.title || "Unknown Item"}". Verification Score: ${score}%`;
        }

        const newClaim = new Claim({
            itemId,
            finderEmail,
            finderName,
            claimantName: finalClaimantName,
            claimantEmail: finalClaimantEmail,
            answers: details,
            confidenceScore: score,
            proofImage, // Optional proof
            status: "pending",
        });

        await newClaim.save();

        // Create Notification for the Poster (Item Owner/Finder)
        try {
            const recipientUser = await User.findOne({ email: item.email });
            if (recipientUser) {
                await Notification.create({
                    userId: recipientUser._id,
                    title: notificationTitle,
                    message: notificationMessage,
                    relatedItem: itemId,
                    type: "CLAIM",
                });
            }
        } catch (notifError) {
            console.error("Error creating notification:", notifError);
            // Don't fail the request if notification fails, just log it
        }

        return NextResponse.json(newClaim, { status: 201 });
    } catch (error: any) {
        console.error("Claim Error:", error);
        return NextResponse.json({ message: "Error creating claim", error: error.message }, { status: 500 });
    }
}
