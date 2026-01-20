import { NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';

const serverClient = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    process.env.STREAM_SECRET!
);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { users } = body;

        if (!Array.isArray(users) || users.length === 0) {
            return NextResponse.json(
                { error: 'Users array is required' },
                { status: 400 }
            );
        }

        // Upsert users to Stream
        await serverClient.upsertUsers(users);

        return NextResponse.json({ success: true, count: users.length });
    } catch (error) {
        console.error('Error upserting users:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
