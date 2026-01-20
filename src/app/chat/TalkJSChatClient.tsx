"use client";

import { Session, Inbox, Chatbox } from "@talkjs/react";
import Talk from "talkjs";
import { useMemo } from "react";

export default function TalkJSChatClient({
    userId,
    userName,
}: {
    userId: string;
    userName: string;
}) {
    // Debug Import
    console.log("DEBUG: Talk Module Import:", Talk);

    const validUserId = useMemo(() => {
        if (!userId) return null;
        return String(userId).trim();
    }, [userId]);

    const me = useMemo(() => {
        if (!validUserId) return null;

        let UserConstructor = (Talk as any).User;

        if (!UserConstructor && (Talk as any).default) {
            UserConstructor = (Talk as any).default.User;
        }

        if (!UserConstructor) {
            console.error("DEBUG: Talk.User is NOT found. The 'talkjs' import is weird.", Talk);
            return null;
        }

        console.log("DEBUG: Creating Talk.User instance for:", validUserId);
        try {
            return new UserConstructor({
                id: validUserId,
                name: userName || "User",
                email: `${validUserId}@example.com`,
                role: "default"
            });
        } catch (e) {
            console.error("DEBUG: Failed to construct User", e);
            return null;
        }
    }, [validUserId, userName]);

    if (!validUserId || !me) return <div className="p-10 text-white">Loading User...</div>;

    return (
        <div className="h-screen w-full bg-neutral-900 flex flex-col items-center justify-center">
            {/* 
               Restored Inbox View.
               This will show the 'Ultimate Debug Chat' and any future 'Claim' chats.
            */}
            <Session appId="tfSKayUQ" syncUser={me}>
                <div className="w-full h-full max-w-6xl border border-white/10 bg-white overflow-hidden shadow-2xl rounded-lg">
                    <Inbox
                        className="w-full h-full"
                    />
                </div>
            </Session>
        </div>
    );
}
