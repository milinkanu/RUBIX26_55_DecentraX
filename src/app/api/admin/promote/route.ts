import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const { email, secret } = await req.json();

        // Simple protection
        if (secret !== "rubix2026") {
            return NextResponse.json({ message: "Invalid secret" }, { status: 403 });
        }

        const user = await User.findOneAndUpdate(
            { email },
            { role: "admin" },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: `User ${email} is now an ADMIN`, user });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
