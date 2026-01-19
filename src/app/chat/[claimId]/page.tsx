"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Send, User as UserIcon, MapPin, ArrowLeft } from "lucide-react";
import Image from "next/image";

interface Message {
    _id: string;
    senderEmail: string;
    content: string;
    createdAt: string;
}

interface Item {
    _id: string;
    title: string;
    description: string;
    file?: string;
    location?: { city: string; area: string };
    verify: string;
}

interface Claim {
    _id: string;
    itemId: Item;
    claimantName: string;
    claimantEmail: string;
    finderEmail: string;
    status: string;
}

export default function ChatPage() {
    const { claimId } = useParams();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [claim, setClaim] = useState<Claim | null>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Get user from local storage
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }
        const user = JSON.parse(storedUser);
        setCurrentUserEmail(user.email);

        if (claimId) {
            fetchClaimDetails();
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
            return () => clearInterval(interval);
        }
    }, [claimId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchClaimDetails = async () => {
        try {
            const res = await axios.get(`/api/claim/${claimId}`);
            setClaim(res.data);
        } catch (err) {
            console.error("Error fetching claim:", err);
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`/api/chat/${claimId}`);
            // Only update if length changed to avoid flickering if we were doing more complex sync
            // But for simple replacement it's fine
            setMessages(res.data);
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUserEmail) return;

        try {
            await axios.post("/api/chat/send", {
                claimId,
                senderEmail: currentUserEmail,
                content: newMessage,
            });
            setNewMessage("");
            fetchMessages();
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    if (!claim || !currentUserEmail) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
        );
    }

    const isFinder = currentUserEmail === claim.finderEmail;
    const otherPartyName = isFinder ? claim.claimantName : "Finder";
    const itemTitle = claim.itemId?.title || "Unknown Item";

    return (
        <div className="min-h-screen bg-black text-white flex flex-col pt-20">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col md:flex-row gap-6 p-4">

                {/* Sidebar / Item Info */}
                <div className="w-full md:w-1/3 bg-neutral-900 border border-white/10 rounded-xl p-4 h-fit">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>

                    <h2 className="text-xl font-bold text-yellow-400 mb-4">Item Details</h2>

                    {claim.itemId?.file && (
                        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden border border-white/10">
                            <Image
                                src={claim.itemId.file}
                                alt={claim.itemId.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}

                    <h3 className="text-lg font-semibold">{claim.itemId?.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{claim.itemId?.description}</p>

                    {claim.itemId?.location && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                            <MapPin size={14} className="text-yellow-400" />
                            {claim.itemId.location.city}, {claim.itemId.location.area}
                        </div>
                    )}

                    <div className="border-t border-white/10 pt-4 mt-4">
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Claim Status</h4>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${claim.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                            {claim.status.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-neutral-900 border border-white/10 rounded-xl flex flex-col h-[600px]">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 bg-neutral-800/50 rounded-t-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-yellow-400/20 p-2 rounded-full">
                                <UserIcon className="text-yellow-400 h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold">{otherPartyName}</h3>
                                <p className="text-xs text-green-400">Online</p>
                            </div>
                        </div>
                        {claim.status !== 'approved' && (
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                                Claim not active
                            </span>
                        )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm">
                                <p>Start the conversation to coordinate return.</p>
                                <p>Do not share sensitive financial info.</p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.senderEmail === currentUserEmail;
                                return (
                                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-4 py-2 rounded-lg text-sm ${isMe
                                                ? 'bg-yellow-400 text-black rounded-tr-none font-medium'
                                                : 'bg-white/10 text-white rounded-tl-none'
                                            }`}>
                                            <p>{msg.content}</p>
                                            <span className={`text-[10px] block mt-1 ${isMe ? 'text-black/60' : 'text-gray-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-neutral-800/30 rounded-b-xl flex gap-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-400 transition"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-yellow-400 text-black p-2 rounded-lg hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
