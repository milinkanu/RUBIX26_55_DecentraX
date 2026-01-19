import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const { email, password } = await req.json();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 400 });
        }

        const validPassword = await bcrypt.compare(password, user.password as string);
        if (!validPassword) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
        }

        // In a real app, generate JWT here. For now, returning user object as per legacy.
        return NextResponse.json({ message: "Login successful", user });
    } catch (err: any) {
        return NextResponse.json({ message: "Error logging in", error: err.message }, { status: 500 });
    }
}
