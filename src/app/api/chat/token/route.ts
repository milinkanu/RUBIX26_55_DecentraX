import { StreamChat } from "stream-chat";
import { NextResponse } from "next/server";
import { streamUserIdFromEmail } from "@/lib/streamUser";

// Ensure keys are present or fallback to empty string to prevent build crashes
const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || "";
const apiSecret = process.env.STREAM_SECRET || "";

const serverClient = StreamChat.getInstance(apiKey, apiSecret);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId: email } = body; // Expecting 'userId' to be email from frontend

        if (!email) {
            return NextResponse.json(
                { error: 'Email/User ID is required' },
                { status: 400 }
            );
        }

        // Use the CENTRALIZED sanitation logic
        const sanitizedUserId = streamUserIdFromEmail(email);

        const token = serverClient.createToken(sanitizedUserId);

        // Return BOTH the token AND the sanitized ID to the client
        // This ensures the client uses the exact ID the token was signed for.
        return NextResponse.json({
            token,
            userId: sanitizedUserId,
            name: email.split('@')[0]
        });
    } catch (error) {
        console.error("Error generating token:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
