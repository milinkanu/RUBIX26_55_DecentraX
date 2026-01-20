import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Claim from "@/models/Claim";

export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const { claimId, email, action } = await req.json();
        // action: 'block' or 'unblock'

        if (!email || !claimId) {
            return NextResponse.json({ message: "Missing info" }, { status: 400 });
        }

        const claim = await Claim.findById(claimId);
        if (!claim) {
            return NextResponse.json({ message: "Chat not found" }, { status: 404 });
        }

        // Verify user participates in this chat
        const isParticipant =
            claim.finderEmail.toLowerCase() === email.toLowerCase() ||
            claim.claimantEmail.toLowerCase() === email.toLowerCase();

        if (!isParticipant) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        if (action === 'block') {
            claim.isBlocked = true;
            claim.blockedBy = email;
        } else if (action === 'unblock') {
            // Only the person who blocked can unblock
            if (claim.blockedBy && claim.blockedBy.toLowerCase() !== email.toLowerCase()) {
                return NextResponse.json({ message: "You cannot unblock this chat." }, { status: 403 });
            }
            claim.isBlocked = false;
            claim.blockedBy = undefined;
        }

        await claim.save();

        return NextResponse.json({ success: true, isBlocked: claim.isBlocked });

    } catch (error: any) {
        console.error("Block Error:", error);
        return NextResponse.json({ message: "Error updating block status", error: error.message }, { status: 500 });
    }
}
