import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Claim from "@/models/Claim";
import "@/models/Item";

export async function GET(req: NextRequest, props: { params: Promise<{ email: string }> }) {
    const params = await props.params;
    await connectDB();
    try {
        const { email } = params;
        // Wait, params are promisified in latest Next.js? 
        // But usually { params } argument works.

        // Note: in Next.js 15 params promise, in 14 it's object. Assuming 14/15 compat.

        const claims = await Claim.find({
            $or: [
                { finderEmail: { $regex: new RegExp(`^${email}$`, 'i') } },
                { claimantEmail: { $regex: new RegExp(`^${email}$`, 'i') } }
            ],
            status: { $in: ['pending', 'approved', 'rejected'] }
        })
            .populate({
                path: "itemId",
                select: "title type file"
            })
            .sort({ updatedAt: -1 });

        const filteredClaims = claims.filter(claim => {
            if (!claim.itemId) return false; // Sanity check
            if (claim.status === 'approved') return true;

            const type = (claim.itemId as any).type;
            const isLostItem = type && type.toLowerCase() === 'lost';
            // Determine my role in this specific claim
            // Note: DB emails might be mixed case, assuming normalized or checking both
            const amIFinder = claim.finderEmail.toLowerCase() === email.toLowerCase();
            const amIClaimant = claim.claimantEmail.toLowerCase() === email.toLowerCase();

            // LOGIC:
            // 1. Found Item (Type != Lost):
            //    - Finder (Poster) needs to see it (Incoming Claim). -> SHOW
            //    - Claimant (Requester) should NOT see it as a "Notification" (Outgoing). -> HIDE
            if (!isLostItem) {
                return amIFinder;
            }

            // 2. Lost Item (Type == Lost):
            //    - Finder (Reporter) should NOT see it (Outgoing Report). -> HIDE
            //    - Claimant (Owner/Poster) needs to see it (Incoming Report). -> SHOW
            if (isLostItem) {
                return amIClaimant;
            }

            return false;
        });

        return NextResponse.json(filteredClaims);
    } catch (error: any) {
        return NextResponse.json({ message: "Error fetching notifications", error: error.message }, { status: 500 });
    }
}
