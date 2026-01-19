import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Claim from "@/models/Claim";

export async function GET(req: NextRequest, props: { params: Promise<{ email: string }> }) {
    const params = await props.params;
    await connectDB();
    try {
        const { email } = params;

        // Find all claims where the user is either the finder or the claimant
        // AND the status is approved (meaning a chat exists)
        const chats = await Claim.find({
            $or: [
                { finderEmail: email, status: "approved" },
                { claimantEmail: email, status: "approved" }
            ]
        })
            .populate("itemId")
            .sort({ updatedAt: -1 });

        return NextResponse.json(chats);
    } catch (error: any) {
        return NextResponse.json({ message: "Error fetching chats", error: error.message }, { status: 500 });
    }
}
