import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const { name, email, password } = await req.json();

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });

        return NextResponse.json({ message: "User created", user }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ message: "Error creating user", error: err.message }, { status: 500 });
    }
}
