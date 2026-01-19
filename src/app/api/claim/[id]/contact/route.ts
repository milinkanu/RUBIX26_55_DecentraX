import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Claim from "@/models/Claim";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    await connectDB();
    try {
        const claim = await Claim.findById(params.id).populate({
            path: "itemId",
            select: "+phone +email",
        });

        if (!claim) {
            return NextResponse.json({ message: "Claim not found" }, { status: 404 });
        }

        // Manual type check or cast to any to access populated fields safely if typing is strict
        // Assuming populated itemId has phone/email
        const item: any = claim.itemId;

        if (claim.status !== "approved") {
            return NextResponse.json({ message: "Claim not approved yet" }, { status: 403 });
        }

        return NextResponse.json({
            phone: item.phone,
            email: item.email,
        });
    } catch (error: any) {
        return NextResponse.json({ message: "Error fetching contact details", error: error.message }, { status: 500 });
    }
}
