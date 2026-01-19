import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Claim from "@/models/Claim";

// Need to handle params correctly in Next.js 14 Route handlers
// export async function GET(req: NextRequest, { params }: { params: { id: string } })

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    try {
        // Populate without sensitive info
        const claim = await Claim.findById(params.id).populate({
            path: "itemId",
            select: "title description file name verify",
        });

        if (!claim) {
            return NextResponse.json({ message: "Claim not found" }, { status: 404 });
        }

        return NextResponse.json(claim);
    } catch (error: any) {
        return NextResponse.json({ message: "Error fetching claim", error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    try {
        const { status } = await req.json();
        const claim = await Claim.findByIdAndUpdate(
            params.id,
            { status },
            { new: true }
        );
        return NextResponse.json(claim);
    } catch (error: any) {
        return NextResponse.json({ message: "Error updating claim", error: error.message }, { status: 500 });
    }
}
