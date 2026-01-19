import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Claim from "@/models/Claim";

export async function GET(req: NextRequest, props: { params: Promise<{ email: string }> }) {
    const params = await props.params;
    await connectDB();
    try {
        const { email } = params;
        // Wait, params are promisified in latest Next.js? 
        // But usually { params } argument works.

        // Note: in Next.js 15 params promise, in 14 it's object. Assuming 14/15 compat.

        const claims = await Claim.find({
            finderEmail: email,
            status: "pending",
        }).populate("itemId");

        return NextResponse.json(claims);
    } catch (error: any) {
        return NextResponse.json({ message: "Error fetching notifications", error: error.message }, { status: 500 });
    }
}
