import { NextRequest } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function isAdmin(req: NextRequest): Promise<boolean> {
    try {
        await connectDB();
        // Check for custom header first, fallback to search params (not recommended for security but good for testing)
        const email = req.headers.get("x-user-email") || req.nextUrl.searchParams.get("adminEmail");

        if (!email) return false;

        const user = await User.findOne({ email });
        return user?.role === "admin";
    } catch (error) {
        console.error("Auth check failed:", error);
        return false;
    }
}
