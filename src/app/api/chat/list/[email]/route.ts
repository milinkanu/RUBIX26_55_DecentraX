import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Claim from "@/models/Claim";
import "@/models/Item";
import Message from "@/models/Message";

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
            .sort({ updatedAt: -1 })
            .lean();

        // Enrich with last message and unread count
        const enrichedChats = await Promise.all(chats.map(async (chat: any) => {
            const lastMessage = await Message.findOne({ claimId: chat._id })
                .sort({ createdAt: -1 })
                .lean();

            const unreadCount = await Message.countDocuments({
                claimId: chat._id,
                senderEmail: { $ne: email },
                isRead: false
            });

            return {
                ...chat,
                lastMessage: lastMessage ? {
                    content: lastMessage.content,
                    imageUrl: lastMessage.imageUrl,
                    createdAt: lastMessage.createdAt
                } : null,
                unreadCount
            };
        }));

        // Sort by last message time if available, otherwise by claim update time
        enrichedChats.sort((a, b) => {
            const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : new Date(a.updatedAt).getTime();
            const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : new Date(b.updatedAt).getTime();
            return timeB - timeA;
        });

        return NextResponse.json(enrichedChats);
    } catch (error: any) {
        return NextResponse.json({ message: "Error fetching chats", error: error.message }, { status: 500 });
    }
}
