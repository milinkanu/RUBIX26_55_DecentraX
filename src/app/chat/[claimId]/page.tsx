"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Send, User as UserIcon, MapPin, ArrowLeft, Search, Paperclip, MoreVertical, Phone, AlertTriangle } from "lucide-react";
import Image from "next/image";

interface Message {
    _id: string;
    senderEmail: string;
    content: string;
    createdAt: string;
    isRead: boolean;
}

interface ChatListItem {
    _id: string;
    itemId: {
        _id: string;
        title: string;
        file?: string;
    };
    finderEmail: string;
    claimantName: string;
    claimantEmail: string;
    lastMessage?: {
        content: string;
        createdAt: string;
    };
    unreadCount: number;
}

// Global cache to persist state across navigations (simulating a store/context)
let globalChatsCache: ChatListItem[] = [];
let globalReadClaims = new Set<string>();

export default function ChatPage() {
    const { claimId } = useParams();
    const router = useRouter();
    const [unreadDividerId, setUnreadDividerId] = useState<string | null>(null);
    const [unreadSessionCount, setUnreadSessionCount] = useState<number>(0);
    const initialFetchDone = useRef<boolean>(false);

    // Initialize with global cache to prevent sidebar flicker/lag on navigation
    const [messages, setMessages] = useState<Message[]>([]);
    const [chats, setChats] = useState<ChatListItem[]>(globalChatsCache);
    const [newMessage, setNewMessage] = useState("");
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const [currentChat, setCurrentChat] = useState<ChatListItem | null>(null);
    const [searchChat, setSearchChat] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const claimIdRef = useRef(claimId);
    claimIdRef.current = claimId; // Update synchronously on every render

    useEffect(() => {
        // Reset state when switch chatsimId;

        // Mark current chat as read globally
        if (typeof claimId === 'string') {
            globalReadClaims.add(claimId);
        }

        // Reset message-specific state
        setUnreadDividerId(null);
        setUnreadSessionCount(0);
        initialFetchDone.current = false;

        // Clear messages to prevent ghosting
        setMessages([]);

        // Optimistically update local state AND global cache
        if (claimId && chats.length > 0) {
            const updatedChats = chats.map(c =>
                c._id === claimId ? { ...c, unreadCount: 0 } : c
            );
            setChats(updatedChats);
            globalChatsCache = updatedChats; // Update cache
        }
    }, [claimId]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }
        const user = JSON.parse(storedUser);
        setCurrentUserEmail(user.email);

        // Initial fetch
        fetchChatList(user.email);
        const interval = setInterval(() => fetchChatList(user.email), 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (claimId && currentUserEmail) {
            // We don't need to find active chat here if we trust the URL
            // But updating currentChat is good for the header info
            const active = chats.find(c => c._id === claimId);
            if (active) setCurrentChat(active);

            fetchMessages();
        }
    }, [claimId, currentUserEmail]);

    useEffect(() => {
        if (claimId) {
            const interval = setInterval(() => {
                fetchMessages();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [claimId]);

    // Auto-scroll effect
    useEffect(() => {
        if (messages.length > 0 && !initialFetchDone.current) {
            scrollToBottom();
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchChatList = async (email: string) => {
        try {
            const res = await axios.get(`/api/chat/list/${email}`);

            // Sanitize unread counts:
            // Only force 0 if it is the CURRENTLY OPEN chat.
            // We trust the backend (ChatReadState) for everything else.
            const sanitizedChats = res.data.map((chat: ChatListItem) => {
                if (chat._id === claimIdRef.current) {
                    return { ...chat, unreadCount: 0 };
                }
                return chat;
            });

            setChats(sanitizedChats);
            globalChatsCache = sanitizedChats; // Keep global cache fresh

            // Notify Navbar to update its badge
            window.dispatchEvent(new Event('chat-read'));
        } catch (err) {
            console.error("Error fetching chat list:", err);
        }
    };

    const fetchMessages = async () => {
        try {
            // Pass email to get smart metadata (lastReadAt)
            const res = await axios.get(`/api/chat/${claimId}?email=${currentUserEmail}`);

            let fetchedMessages: Message[] = [];
            let lastReadAt: string | null = null;

            if (Array.isArray(res.data)) {
                fetchedMessages = res.data;
            } else {
                fetchedMessages = res.data.messages;
                lastReadAt = res.data.lastReadAt;
            }

            // Logic to determine unread divider position (run only once per chat view)
            if (!initialFetchDone.current && currentUserEmail) {
                let firstUnread;
                let count = 0;

                if (lastReadAt) {
                    // Pro Logic: Use Timestamp
                    const lastReadDate = new Date(lastReadAt);
                    firstUnread = fetchedMessages.find(m =>
                        m.senderEmail !== currentUserEmail &&
                        new Date(m.createdAt) > lastReadDate
                    );
                    count = fetchedMessages.filter(m =>
                        m.senderEmail !== currentUserEmail &&
                        new Date(m.createdAt) > lastReadDate
                    ).length;
                } else {
                    // Legacy Fallback
                    firstUnread = fetchedMessages.find(m => m.senderEmail !== currentUserEmail && !m.isRead);
                    count = fetchedMessages.filter(m => m.senderEmail !== currentUserEmail && !m.isRead).length;
                }

                if (firstUnread) {
                    setUnreadDividerId(firstUnread._id);
                    setUnreadSessionCount(count);
                }

                // Set initial fetch done to true 
                initialFetchDone.current = true;

                // Scroll to bottom after initial load
                setTimeout(scrollToBottom, 100);

                // Auto-hide the "Unread Messages" divider after 2 seconds to reduce clutter
                setTimeout(() => {
                    setUnreadDividerId(null);
                }, 2000);
            }

            // Always attempt to seek/confirm 'read' status on every fetch
            // This acts as a self-healing mechanism if the Initial call failed
            if (currentUserEmail) {
                markMessagesRead();
            }

            setMessages(fetchedMessages);
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    };

    // Dedicated effect to trigger read as soon as we enter the chat
    useEffect(() => {
        if (claimId && currentUserEmail) {
            markMessagesRead();
        }
    }, [claimId, currentUserEmail]);

    const markMessagesRead = async () => {
        if (!claimId || !currentUserEmail) return;
        try {
            await axios.patch("/api/chat/mark-read", {
                claimId,
                userEmail: currentUserEmail
            });

            // Sync UI immediately after marking read
            fetchChatList(currentUserEmail);
            window.dispatchEvent(new Event('chat-read'));
        } catch (err) {
            console.error("Error marking read:", err);
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

            // Fetch immediately to show the new message
            const res = await axios.get(`/api/chat/${claimId}`);
            setMessages(res.data);

            // Force scroll to bottom when sending
            setTimeout(scrollToBottom, 100);

            fetchChatList(currentUserEmail); // Update list preview
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    const filteredChats = chats.filter(chat => {
        const name = currentUserEmail === chat.finderEmail ? chat.claimantName : "Finder"; // Simplification
        const title = chat.itemId?.title || "";
        return name.toLowerCase().includes(searchChat.toLowerCase()) || title.toLowerCase().includes(searchChat.toLowerCase());
    });

    // Calculate total unread count excluding the currently active chat
    // This gives instant feedback to the user
    const totalUnreadCount = chats.reduce((acc, chat) => {
        if (chat._id === claimId) return acc; // Don't count active chat
        return acc + (chat.unreadCount || 0);
    }, 0);

    if (!currentUserEmail) return null;

    return (
        <div className="h-screen bg-black text-white flex overflow-hidden">
            {/* Left Sidebar (Chat List) */}
            <div className={`w-full md:w-[400px] border-r border-white/10 flex flex-col bg-black ${claimId ? 'hidden md:flex' : 'flex'}`}>
                {/* Sidebar Header */}
                <div className="h-16 bg-neutral-900 px-4 flex items-center gap-3 border-b border-white/10">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => router.push('/chat')}>
                        <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-black font-bold">
                            F!
                        </div>
                        <h2 className="font-bold text-lg tracking-tight">Found<span className="text-yellow-400">It!</span> Chat</h2>
                        {totalUnreadCount > 0 && (
                            <span className="ml-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                                {totalUnreadCount}
                            </span>
                        )}
                    </div>
                </div>

                {/* Sidebar Search */}
                <div className="px-3 py-3 border-b border-white/10 bg-black">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search or start new chat"
                            value={searchChat}
                            onChange={(e) => setSearchChat(e.target.value)}
                            className="w-full bg-neutral-900 text-gray-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-yellow-400 border border-white/5 placeholder-gray-600 transition-all"
                        />
                        <Search className="absolute left-3 top-3 text-gray-500 h-4 w-4" />
                    </div>
                </div>

                {/* Chat List Items */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-black">
                    {filteredChats.map((chat) => {
                        const isFinder = currentUserEmail === chat.finderEmail;
                        const otherName = isFinder ? chat.claimantName : "Finder";
                        const isActive = chat._id === claimId;

                        // Optimistically hide unread badge if this is the active chat
                        const displayUnreadCount = isActive ? 0 : chat.unreadCount;

                        return (
                            <div
                                key={chat._id}
                                onClick={() => router.push(`/chat/${chat._id}`)}
                                className={`flex items-center gap-3 p-3 cursor-pointer transition-all border-b border-white/5 ${isActive ? 'bg-white/10 border-l-4 border-l-yellow-400' : 'hover:bg-white/5 border-l-4 border-l-transparent'}`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                                        {chat.itemId?.file ? (
                                            <Image src={chat.itemId.file} alt="Item" width={48} height={48} className="object-cover w-full h-full" />
                                        ) : (
                                            <UserIcon size={24} className="text-gray-400" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className={`font-medium truncate ${isActive ? 'text-white' : 'text-gray-200'}`}>{otherName}</h4>
                                        {chat.lastMessage && (
                                            <span className={`text-[11px] ${displayUnreadCount > 0 ? 'text-yellow-400 font-bold' : 'text-gray-500'}`}>
                                                {new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-gray-500 text-sm truncate pr-2">
                                            {chat.lastMessage?.content || "No messages yet"}
                                        </p>
                                        {displayUnreadCount > 0 && (
                                            <span className="bg-yellow-400 text-black text-xs font-bold px-1.5 h-5 min-w-[20px] rounded-full flex items-center justify-center">
                                                {displayUnreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Side (Conversation) */}
            {claimId ? (
                <div className="flex-1 flex flex-col bg-black relative">
                    {/* Chat Header */}
                    <div className="h-16 bg-neutral-900 px-4 flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-4">
                            <button onClick={() => router.push('/chat')} className="md:hidden text-gray-400">
                                <ArrowLeft />
                            </button>
                            <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                                {currentChat?.itemId?.file ? (
                                    <Image src={currentChat.itemId.file} alt="Item" width={40} height={40} className="object-cover w-full h-full" />
                                ) : (
                                    <UserIcon size={20} className="text-gray-400" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">
                                    {currentUserEmail === currentChat?.finderEmail ? currentChat?.claimantName : "Finder"}
                                </h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <p className="text-xs text-gray-400">
                                        Active • Item: <span className="text-yellow-400">{currentChat?.itemId?.title}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 text-gray-400 items-center">
                            <Search size={20} className="hover:text-yellow-400 transition cursor-pointer hidden sm:block" />
                            <MoreVertical size={20} className="hover:text-yellow-400 transition cursor-pointer" />
                            <button
                                onClick={() => router.push('/chat')}
                                className="bg-neutral-800 hover:bg-neutral-700 text-gray-300 p-2 rounded-lg transition ml-2 border border-white/5"
                                title="Close Chat"
                            >
                                <span className="text-xs font-bold">Close</span>
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-3 bg-black custom-scrollbar">
                        {messages.map((msg) => {
                            const isMe = msg.senderEmail === currentUserEmail;
                            return (
                                <React.Fragment key={msg._id}>
                                    {/* Unread Divider */}
                                    {msg._id === unreadDividerId && (
                                        <div className="flex justify-center my-4 animate-in fade-in zoom-in duration-300">
                                            <div className="bg-neutral-800 text-yellow-400 text-xs px-4 py-1.5 rounded-full border border-yellow-400/20 shadow-sm font-medium">
                                                {unreadSessionCount} Unread Message{unreadSessionCount !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    )}
                                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                        <div className={`max-w-[75%] md:max-w-[60%] px-4 py-2.5 rounded-2xl text-sm shadow-md relative group ${isMe ? 'bg-yellow-400 text-black rounded-tr-none font-medium' : 'bg-neutral-800 text-gray-100 rounded-tl-none border border-white/5'
                                            }`}>
                                            <div className="flex flex-col">
                                                <span className="leading-relaxed">{msg.content}</span>
                                                <div className="flex items-center justify-end gap-1 mt-1 select-none opacity-70">
                                                    <span className={`text-[10px] uppercase font-bold tracking-wider`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="bg-neutral-900 px-4 py-4 flex items-end gap-3 z-10 border-t border-white/10">
                        <button className="text-gray-400 p-2 hover:bg-neutral-800 rounded-full transition mb-0.5">
                            <Paperclip size={22} />
                        </button>
                        <form onSubmit={handleSendMessage} className="flex-1 flex items-end gap-3 bg-neutral-800 rounded-xl px-4 py-2 border border-white/5 focus-within:border-yellow-400/50 transition-colors">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full bg-transparent text-white focus:outline-none placeholder-gray-500 min-h-[24px] max-h-32 py-1"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="text-gray-400 hover:text-yellow-400 transition disabled:opacity-30 disabled:hover:text-gray-400"
                            >
                                <Send size={20} className={newMessage.trim() ? "text-yellow-400" : ""} />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center bg-black flex-col text-center p-10 select-none">
                    <div className="w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-white/10 animate-pulse">
                        <div className="w-12 h-12 border-2 border-yellow-400 rounded-lg transform rotate-45"></div>
                    </div>
                    <h2 className="text-white text-3xl font-bold mb-3 tracking-tight">FoundIt! <span className="text-yellow-400">Chats</span></h2>
                    <p className="text-gray-500 max-w-sm leading-relaxed mb-8">
                        Select a conversation from the sidebar to start chatting. Coordinate meetups safely and recover your lost items.
                    </p>

                    <div className="bg-yellow-400/5 border border-yellow-400/20 p-4 rounded-xl max-w-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold mb-2">
                            <AlertTriangle size={20} />
                            <span>Safety Tip</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            For your safety, <span className="text-gray-200 font-semibold">never share sensitive personal information</span> like passwords, bank details, or home addresses. Always meet in public places for item exchanges.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl border border-white/10 transition flex items-center gap-2 font-medium"
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </button>
                </div>
            )
            }
        </div >
    );
}
