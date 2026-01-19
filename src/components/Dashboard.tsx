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
    Lock
} from "lucide-react";
import axios from "axios";
import { Navbar } from "./Navbar";
import Link from "next/link";

interface Item {
    _id: string;
    title: string;
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

export function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const [matches, setMatches] = useState<Match[]>([]);
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
            const [matchesRes, notificationsRes] = await Promise.all([
                axios.get(`/api/user/matches?email=${email}`),
                axios.get(`/api/notifications?email=${email}`)
            ]);

            setMatches(matchesRes.data);
            setStats({
                totalPosts: 0, // In a real app we'd fetch user items too
                activeMatches: matchesRes.data.length,
                unreadNotifications: notificationsRes.data.length
            });
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
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
                            <CheckCircle2 className="text-blue-400 w-8 h-8" />
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Security</span>
                        </div>
                        <div className="text-xl font-bold text-green-400">Verified Account</div>
                        <div className="text-gray-400 text-sm mt-1">Active and protected</div>
                    </div>
                </div>

                {/* Possible Matches Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Search className="text-yellow-400 w-6 h-6" />
                            🧠 Possible Matches
                        </h2>
                        <span className="text-sm bg-yellow-400/10 text-yellow-400 px-3 py-1 rounded-full border border-yellow-400/20">
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
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {matches.map((match) => (
                                <div
                                    key={match._id}
                                    className="group relative bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-2xl overflow-hidden hover:border-yellow-400/50 transition-all duration-300"
                                >
                                    {/* Match Badge */}
                                    <div className="absolute top-4 right-4 z-10">
                                        <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black shadow-lg shadow-yellow-400/20 animate-pulse">
                                            {match.title.split('%')[0]}% MATCH
                                        </div>
                                    </div>

                                    {/* Item Image */}
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
                                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                                            {match.message.split('. ')[1]}
                                        </p>

                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 font-medium">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-yellow-400" />
                                                {match.relatedItem?.location.city}
                                            </div>
                                            <div className="flex items-center gap-1 uppercase tracking-tighter">
                                                <div className={`w-2 h-2 rounded-full ${match.relatedItem?.type.toLowerCase() === 'lost' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                {match.relatedItem?.type}
                                            </div>
                                        </div>

                                        <Link
                                            href="/find"
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
            </main>
        </div>
    );
}
