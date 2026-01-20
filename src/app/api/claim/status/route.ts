import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Claim from "@/models/Claim";

export async function GET(req: NextRequest) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get("itemId");
        const email = searchParams.get("email");

        if (!itemId || !email) {
            return NextResponse.json({ message: "Missing parameters" }, { status: 400 });
        }

        const claim = await Claim.findOne({
            itemId,
            $or: [
                { claimantEmail: email },
                { finderEmail: email }
            ]
        });

        if (claim) {
            return NextResponse.json({
                submitted: true,
                claimId: claim._id,
                status: claim.status,
                approved: claim.status === "approved"
            });
        }

        return NextResponse.json({ submitted: false });
    } catch (error: any) {
        return NextResponse.json({ message: "Error fetching claim status", error: error.message }, { status: 500 });
    }
}
