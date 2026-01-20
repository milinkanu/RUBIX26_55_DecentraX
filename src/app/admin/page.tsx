"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import { Check, X, Trash2, Flag, AlertTriangle, Filter } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

interface AdminItem {
    _id: string;
    title: string;
    description: string;
    category: string;
    type: string;
    file: string;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
    email: string;
    location: {
        city: string;
        area: string;
    };
    reportedCount?: number;
}

interface Report {
    _id: string;
    itemId: {
        _id: string;
        title: string;
        type: string;
        status: string;
        file: string;
    };
    reportedBy: {
        name: string;
        email: string;
    };
    reason: string;
    description?: string;
    evidenceImage?: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"reports" | "all">("all");
    const [items, setItems] = useState<AdminItem[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = () => {
            const storedUser = localStorage.getItem("user");
            if (!storedUser) {
                router.push("/login");
                return;
            }
            const user = JSON.parse(storedUser);
            if (user.role !== "admin") {
                toast.error("Unauthorized access");
                router.push("/dashboard");
                return;
            }
            setIsAdmin(true);
            fetchData();
        };
        checkAdmin();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Emulate admin auth by passing email in header for now, 
            // relying on backend to verify DB role
            const user = JSON.parse(localStorage.getItem("user") || '{}');
            const config = { headers: { "x-user-email": user.email } };

            if (activeTab === "reports") {
                const res = await axios.get("/api/admin/reports", config);
                // Filter out reports where the item has been deleted (itemId is null)
                const activeReports = res.data.filter((report: Report) => report.itemId);
                setReports(activeReports);
            } else {
                const status = "all";
                const res = await axios.get(`/api/admin/items?status=${status}`, config);
                setItems(res.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: "approve" | "reject" | "delete") => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || '{}');
            const config = { headers: { "x-user-email": user.email } };

            if (action === "delete") {
                if (!confirm("Are you sure you want to delete this item?")) return;
                await axios.delete(`/api/admin/items/${id}`, config);
                toast.success("Item deleted");
            } else {
                const status = action === "approve" ? "approved" : "rejected";
                await axios.patch(`/api/admin/items/${id}`, { status }, config);
                toast.success(`Item ${status}`);
            }
            fetchData(); // Refresh
        } catch (error) {
            toast.error("Action failed");
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <ToastContainer position="top-right" theme="dark" />

            <div className="flex">
                {/* Sidebar */}
                <div className="w-64 min-h-screen bg-neutral-900 border-r border-white/10 hidden md:block pt-6">
                    <div className="px-6 mb-8">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            Admin
                        </h2>
                    </div>
                    <nav className="space-y-2 px-3">
                        <button
                            onClick={() => setActiveTab("reports")}
                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === "reports" ? "bg-yellow-400 text-black font-bold" : "text-gray-400 hover:bg-white/5"}`}
                        >
                            <Flag size={18} /> User Reports
                        </button>
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === "all" ? "bg-yellow-400 text-black font-bold" : "text-gray-400 hover:bg-white/5"}`}
                        >
                            <Check size={18} /> All Listings
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8">
                    <h1 className="text-3xl font-bold mb-8">
                        {activeTab === "reports" && "Flagged Reports"}
                        {activeTab === "all" && "All Items Database"}
                    </h1>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {activeTab !== "reports" ? items.map((item) => (
                                <div key={item._id} className="bg-neutral-900 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                                    <div className="h-48 relative bg-neutral-800">
                                        <img src={item.file} alt={item.title} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-md bg-black/60 backdrop-blur-md border border-white/10 ${item.type === 'Lost' ? 'text-red-400' : 'text-green-400'}`}>
                                                {item.type}
                                            </span>
                                            {item.status === 'pending' && <span className="px-2 py-1 text-xs font-bold rounded-md bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">Pending</span>}
                                            {item.reportedCount && item.reportedCount > 0 && <span className="px-2 py-1 text-xs font-bold rounded-md bg-red-500 text-white flex items-center gap-1"><Flag size={10} /> {item.reportedCount}</span>}
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                                        <p className="text-gray-400 text-xs mb-2">{item.location?.area}, {item.location?.city}</p>
                                        <p className="text-gray-300 text-sm mb-4 bg-neutral-800 p-2 rounded-lg">{item.description}</p>
                                        <div className="mt-auto grid grid-cols-3 gap-2">
                                            {item.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleAction(item._id, "approve")} className="flex items-center justify-center gap-1 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white py-2 rounded-lg transition text-sm font-bold border border-green-500/20">
                                                        <Check size={16} /> Approve
                                                    </button>
                                                    <button onClick={() => handleAction(item._id, "reject")} className="flex items-center justify-center gap-1 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white py-2 rounded-lg transition text-sm font-bold border border-red-500/20">
                                                        <X size={16} /> Reject
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => handleAction(item._id, "delete")} className={`flex items-center justify-center gap-1 bg-neutral-800 hover:bg-red-900/30 hover:text-red-400 py-2 rounded-lg transition text-sm text-gray-400 ${item.status === 'pending' ? '' : 'col-span-3'}`}>
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : reports.map((report) => (
                                <div key={report._id} className="bg-neutral-900 border border-red-500/30 rounded-xl p-4 overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-white">Item: {report.itemId?.title || "Deleted Item"}</h3>
                                            <p className="text-xs text-gray-500">Reported by: <span className="text-gray-300">{report.reportedBy?.name}</span></p>
                                        </div>
                                        <span className="text-red-400 text-xs font-bold border border-red-500/30 px-2 py-1 rounded-full">{new Date(report.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-lg mb-4 space-y-2">
                                        <p className="text-red-300 text-sm font-bold">Type: {report.reason}</p>
                                        {report.description && (
                                            <p className="text-gray-300 text-sm italic">"{report.description}"</p>
                                        )}
                                        {report.evidenceImage && (
                                            <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                                                <img src={report.evidenceImage} alt="Evidence" className="w-full h-32 object-cover" />
                                            </div>
                                        )}
                                    </div>
                                    {report.itemId && (
                                        <div className="flex gap-2">
                                            <button onClick={() => router.push(`/find?itemId=${report.itemId._id}`)} className="flex-1 bg-neutral-800 hover:bg-neutral-700 py-2 rounded-lg text-sm text-gray-300 transition-colors">
                                                View Item
                                            </button>
                                            <button onClick={() => handleAction(report.itemId._id, "delete")} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-sm font-bold transition-colors">
                                                Remove Post
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {items.length === 0 && reports.length === 0 && !loading && (
                        <div className="text-center text-gray-500 mt-20">
                            <Check className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>All caught up! No pending items found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
