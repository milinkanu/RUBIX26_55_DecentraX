"use client";

import React, { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Bell,
    Package,
    Search,
    Clock,
    CheckCircle2,
    MapPin,
    TrendingUp,
    ArrowRight,
    Lock,
    Trash2,
    Pencil,
    History
} from "lucide-react";
import axios from "axios";
import { Navbar } from "./Navbar";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Item {
    _id: string;
    title: string;
    description: string;
    category: string;
    type: string;
    location: {
        city: string;
        area: string;
    };
    file: string;
    createdAt: string;
}

interface Match {
    _id: string;
    title: string;
    message: string;
    relatedItem: Item | null;
    createdAt: string;
}

interface User {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
}

export function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [userItems, setUserItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPosts: 0,
        activeMatches: 0,
        unreadNotifications: 0
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchDashboardData(parsedUser.email);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchDashboardData = async (email: string) => {
        try {
            const [matchesRes, notificationsRes, itemsRes] = await Promise.all([
                axios.get(`/api/user/matches?email=${email}`),
                axios.get(`/api/notifications?email=${email}`),
                axios.get(`/api/items?email=${email}`)
            ]);

            setMatches(matchesRes.data);
            setUserItems(itemsRes.data);
            setStats({
                totalPosts: itemsRes.data.length,
                activeMatches: matchesRes.data.length,
                unreadNotifications: notificationsRes.data.length
            });
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;

        try {
            await axios.delete(`/api/items/${itemId}`, {
                data: { email: user?.email }
            });
            setUserItems(prev => prev.filter(item => item._id !== itemId));
            setStats(prev => ({ ...prev, totalPosts: prev.totalPosts - 1 }));
            toast.success("Post deleted successfully");
        } catch (err) {
            console.error("Delete error:", err);
            toast.error("Failed to delete post");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-6">
                <Lock className="w-16 h-16 text-yellow-400 mb-6" />
                <h1 className="text-3xl font-bold mb-4">Please Login First</h1>
                <p className="text-gray-400 mb-8 text-center max-w-md">
                    You need to be logged in to access your personal dashboard and see potential matches.
                </p>
                <Link href="/login" className="bg-yellow-400 text-black px-8 py-3 rounded-full font-bold hover:bg-yellow-300 transition-all">
                    Login to Continue
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-yellow-400 selection:text-black">
            <Navbar />

            <main className="container mx-auto px-4 py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold flex items-center gap-3">
                            <LayoutDashboard className="text-yellow-400 w-10 h-10" />
                            User Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2 text-lg">
                            Welcome back, <span className="text-white font-semibold">{user.name || user.email}</span>. Here's your activity overview.
                        </p>
                    </div>

                    <Link href="/post" className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-300 transition-all hover:scale-105">
                        <Package className="w-5 h-5" />
                        Report New Item
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-gray-900/40 backdrop-blur-md border border-gray-800 p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <TrendingUp className="text-green-400 w-8 h-8" />
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Active matches</span>
                        </div>
                        <div className="text-4xl font-bold">{stats.activeMatches}</div>
                        <div className="text-gray-400 text-sm mt-1">Potential items found</div>
                    </div>

                    <div className="bg-gray-900/40 backdrop-blur-md border border-gray-800 p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <Bell className="text-yellow-400 w-8 h-8" />
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Notifications</span>
                        </div>
                        <div className="text-4xl font-bold">{stats.unreadNotifications}</div>
                        <div className="text-gray-400 text-sm mt-1">Unread claim requests</div>
                    </div>

                    <div className="bg-gray-900/40 backdrop-blur-md border border-gray-800 p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <History className="text-blue-400 w-8 h-8" />
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">My Reports</span>
                        </div>
                        <div className="text-4xl font-bold">{stats.totalPosts}</div>
                        <div className="text-gray-400 text-sm mt-1">Items you posted</div>
                    </div>
                </div>

                <div className="space-y-16">
                    {/* Possible Matches Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Search className="text-yellow-400 w-6 h-6" />
                                🧠 Smart Matches
                            </h2>
                            <span className="text-sm bg-yellow-400/10 text-yellow-400 px-3 py-1 rounded-full border border-yellow-400/20 font-medium">
                                Updates live
                            </span>
                        </div>

                        {matches.length === 0 ? (
                            <div className="bg-gray-900/20 border border-dashed border-gray-800 rounded-2xl p-12 text-center">
                                <Clock className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-400">No matches yet</h3>
                                <p className="text-gray-500 mt-2 max-w-sm mx-auto text-sm">
                                    Our intelligence system is still scouting for items that match your reports. We'll notify you the moment something comes up!
                                </p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {matches.map((match) => (
                                    <div
                                        key={match._id}
                                        className="group relative bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-2xl overflow-hidden hover:border-yellow-400/50 transition-all duration-300"
                                    >
                                        <div className="absolute top-4 right-4 z-10">
                                            <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black shadow-lg shadow-yellow-400/20 animate-pulse">
                                                {match.title.split('%')[0]}% MATCH
                                            </div>
                                        </div>

                                        <div className="h-48 overflow-hidden bg-gray-800">
                                            <img
                                                src={match.relatedItem?.file || "/placeholder.png"}
                                                alt={match.relatedItem?.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-duration-500 opacity-80 group-hover:opacity-100"
                                            />
                                        </div>

                                        <div className="p-6">
                                            <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-400 transition-colors">
                                                {match.relatedItem?.title || "Unknown Item"}
                                            </h3>
                                            <p className="text-gray-400 text-sm line-clamp-2 mb-4 italic">
                                                "{match.message.split('. ')[1]}"
                                            </p>

                                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 font-medium">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-yellow-400" />
                                                    {match.relatedItem?.location?.city || "Unknown"}
                                                </div>
                                                <div className="flex items-center gap-1 uppercase tracking-tighter">
                                                    <div className={`w-2 h-2 rounded-full ${match.relatedItem?.type.toLowerCase() === 'lost' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                    {match.relatedItem?.type}
                                                </div>
                                            </div>

                                            <Link
                                                href={`/find?itemId=${match.relatedItem?._id}`}
                                                className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-yellow-400 hover:text-black hover:border-yellow-400 transition-all font-bold group/btn"
                                            >
                                                View Details
                                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* My Reported Items Section */}
                    <section className="space-y-6 pb-12">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <History className="text-blue-400 w-6 h-6" />
                                📝 My Reported Items
                            </h2>
                        </div>

                        {userItems.length === 0 ? (
                            <div className="bg-gray-900/20 border border-dashed border-gray-800 rounded-2xl p-12 text-center">
                                <Package className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-400">No items reported</h3>
                                <p className="text-gray-500 mt-2 max-w-sm mx-auto text-sm">
                                    You haven't posted any lost or found items yet. Click "Report New Item" to get started.
                                </p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {userItems.map((item) => (
                                    <div
                                        key={item._id}
                                        className="group relative bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-400/50 transition-all duration-300"
                                    >
                                        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="bg-red-500 text-white p-2 rounded-lg shadow-lg hover:scale-110 transition-transform"
                                                onClick={() => handleDeleteItem(item._id)}
                                                title="Delete Post"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="h-48 overflow-hidden bg-gray-800">
                                            <img
                                                src={item.file || "/placeholder.png"}
                                                alt={item.title}
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                        </div>

                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold truncate group-hover:text-blue-400 transition-colors pr-2">
                                                    {item.title}
                                                </h3>
                                                <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${item.type.toLowerCase() === 'lost' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-green-500/20 text-green-500 border border-green-500/30'}`}>
                                                    {item.type}
                                                </div>
                                            </div>

                                            <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                                                {item.description}
                                            </p>

                                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 font-medium">
                                                <div className="flex items-center gap-1 italic">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {item.location?.city || "Unknown City"}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/post?edit=${item._id}`}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-bold text-sm"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteItem(item._id)}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50 transition-all font-bold text-sm"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
            <ToastContainer position="bottom-right" theme="dark" />
        </div>
    );
}
