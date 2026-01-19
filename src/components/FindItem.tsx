"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, User, Phone, Mail, Paperclip, Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Navbar } from "./Navbar";
import { CustomDropdown } from "./CustomDropdown";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface Item {
    _id: string;
    title: string;
    description: string;
    category: string;
    type: string;
    file: string;
    name: string;
    email?: string;
    verify: string;
    questions?: { question: string; answer: string }[];
    location: {
        city: string;
        area: string;
        landmark?: string;
    };
}

interface Claim {
    claimId: string;
    submitted: boolean;
    approved: boolean;
    phone?: string;
    email?: string;
}

export function FindItem() {
    const searchParams = useSearchParams();
    const search = searchParams.get("search");
    const itemId = searchParams.get("itemId");

    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        type: "",
        category: "",
        city: "",
        area: "",
    });
    const [showFilter, setShowFilter] = useState(false);

    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [showClaimForm, setShowClaimForm] = useState(false);
    const [answer, setAnswer] = useState("");
    const [answers, setAnswers] = useState<{ question: string, answer: string }[]>([]);
    const [claims, setClaims] = useState<{ [key: string]: Claim }>({});
    const pollingRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

    const categories = ["Mobile", "Wallet", "Documents", "Bag", "Keys", "Electronics", "Other"];

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.type) params.append("type", filters.type);
            if (filters.category) params.append("category", filters.category);
            if (filters.city) params.append("city", filters.city);
            if (filters.area) params.append("area", filters.area);
            if (search) params.append("search", search);

            const res = await axios.get(`${API_URL}/api/items?${params.toString()}`);
            setItems(res.data);
        } catch (err) {
            console.error("Error fetching items:", err);
            toast.error("Failed to fetch items");
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and refetch on search change
    useEffect(() => {
        fetchItems();
    }, [search]); // Added search dependency

    // Handle selection from URL itemId
    useEffect(() => {
        if (itemId) {
            const itemInList = items.find(i => i._id === itemId);
            if (itemInList) {
                setSelectedItem(itemInList);
            } else {
                axios.get(`${API_URL}/api/items/${itemId}`)
                    .then(res => {
                        if (res.data) setSelectedItem(res.data);
                    })
                    .catch(err => console.error("Error fetching specific item:", err));
            }
        }
    }, [itemId, items]);

    const handleApplyFilters = () => {
        fetchItems();
        setShowFilter(false);
    };

    const handleClearFilters = () => {
        setFilters({ type: "", category: "", city: "", area: "" });
        setLoading(true);
        axios.get(`${API_URL}/api/items`)
            .then(res => {
                setItems(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
        setShowFilter(false);
    };

    const handleSubmitAnswer = async () => {
        if (!selectedItem) return;
        try {
            const storedUser = localStorage.getItem("user");
            const user = storedUser ? JSON.parse(storedUser) : null;

            const res = await axios.post(
                `${API_URL}/api/claim`,
                {
                    itemId: selectedItem._id,
                    claimantName: user?.name || "Anonymous User",
                    claimantEmail: user?.email || "anonymous@example.com",
                    answers: answers.length > 0 ? answers : [{ question: selectedItem.verify || "Legacy Question", answer }],
                }
            );

            setClaims((prev) => ({
                ...prev,
                [selectedItem._id]: {
                    claimId: res.data._id,
                    submitted: true,
                    approved: false,
                },
            }));

            setShowClaimForm(false);
            toast.success("Claim sent successfully");
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit claim");
        }
    };

    useEffect(() => {
        Object.entries(claims).forEach(([itemId, claim]) => {
            if (!claim.claimId || claim.approved || pollingRefs.current[itemId]) return;

            pollingRefs.current[itemId] = setInterval(async () => {
                try {
                    const res = await axios.get(
                        `${API_URL}/api/claim/${claim.claimId}`
                    );

                    if (res.data.status === "approved") {
                        const contactRes = await axios.get(
                            `${API_URL}/api/claim/${claim.claimId}/contact`
                        );

                        setClaims((prev) => ({
                            ...prev,
                            [itemId]: {
                                ...prev[itemId],
                                approved: true,
                                phone: contactRes.data.phone,
                                email: contactRes.data.email,
                            },
                        }));

                        clearInterval(pollingRefs.current[itemId]);
                        delete pollingRefs.current[itemId];

                        toast.success("Claim approved!");
                    }
                } catch (err) {
                    console.error("Polling error:", err);
                }
            }, 5000);
        });

        return () => {
            Object.values(pollingRefs.current).forEach(clearInterval);
            pollingRefs.current = {};
        };
    }, [claims]);

    const claim = selectedItem ? claims[selectedItem._id] : null;

    return (
        <>
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
                <Navbar />

                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8 relative">
                        <button
                            onClick={() => setShowFilter(!showFilter)}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors shadow-lg shadow-yellow-400/20 absolute left-8 top-2"
                        >
                            <Filter className="w-4 h-4" />
                            {showFilter ? "Hide Filters" : "Filters"}
                        </button>
                        <h1 className="text-4xl font-bold text-center">Find Lost Items</h1>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                        {/* Filters Sidebar */}
                        <div className={`flex flex-col transition-all duration-300 ${showFilter ? 'w-full lg:w-1/4 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>

                            {showFilter && (
                                <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 p-6 rounded-xl sticky top-24 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                                        <Search className="w-5 h-5 text-yellow-400" />
                                        Filters
                                    </h2>

                                    <CustomDropdown
                                        label="Type"
                                        value={filters.type}
                                        onChange={(val) => setFilters({ ...filters, type: val })}
                                        options={[
                                            { value: "", label: "All Types" },
                                            { value: "Lost", label: "Lost Items" },
                                            { value: "Found", label: "Found Items" },
                                        ]}
                                        placeholder="Select Type"
                                    />

                                    <CustomDropdown
                                        label="Category"
                                        value={filters.category}
                                        onChange={(val) => setFilters({ ...filters, category: val })}
                                        options={[
                                            { value: "", label: "All Categories" },
                                            ...categories.map((cat) => ({ value: cat, label: cat }))
                                        ]}
                                        placeholder="Select Category"
                                    />

                                    {/* City */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">City</label>
                                        <input
                                            type="text"
                                            placeholder="Enter City"
                                            value={filters.city}
                                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                            className="w-full bg-black/50 border border-gray-600 rounded-lg p-3 text-white focus:border-yellow-400 focus:outline-none transition-colors"
                                        />
                                    </div>

                                    {/* Area */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Area</label>
                                        <input
                                            type="text"
                                            placeholder="Enter Area"
                                            value={filters.area}
                                            onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                                            className="w-full bg-black/50 border border-gray-600 rounded-lg p-3 text-white focus:border-yellow-400 focus:outline-none transition-colors"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={handleApplyFilters}
                                            className="flex-1 bg-yellow-400 text-black py-2.5 rounded-lg font-bold hover:bg-yellow-500 transition-all hover:scale-[1.02]"
                                        >
                                            Apply
                                        </button>
                                        <button
                                            onClick={handleClearFilters}
                                            className="px-5 py-2.5 border border-gray-600 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* Results Grid */}
                        <div className="flex-1">
                            {loading ? (
                                <div className={`grid sm:grid-cols-2 gap-6 ${!showFilter ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                                    {[1, 2, 3, 4, 5, 6].map((n) => (
                                        <div key={n} className="bg-gray-800/50 rounded-xl h-80 animate-pulse"></div>
                                    ))}
                                </div>
                            ) : items.length === 0 ? (
                                <div className="text-center py-20 bg-black/40 rounded-xl border border-gray-800">
                                    <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-300">No items found</h3>
                                    <p className="text-gray-500 mt-2">Try adjusting your filters to see more results</p>
                                </div>
                            ) : (
                                <div className={`grid sm:grid-cols-2 gap-6 ${!showFilter ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                                    {items.map((item) => (
                                        <div
                                            key={item._id}
                                            className="bg-black/60 border border-gray-700 rounded-xl overflow-hidden hover:border-yellow-400/50 transition duration-300 group"
                                        >
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={item.file || "/placeholder.png"}
                                                    alt={item.title || "Item image"}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                />
                                                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                                                    <div className="bg-black/70 backdrop-blur-md px-2 py-1 rounded text-xs font-semibold border border-white/20">
                                                        {item.category || "General"}
                                                    </div>
                                                    <div className={`px-2 py-1 rounded text-xs font-bold ${item.type === 'Lost' ? 'bg-red-500 text-white' : 'bg-green-500 text-black'}`}>
                                                        {item.type || "Found"}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-xl font-semibold truncate flex-1 pr-2">
                                                        {item.title || "Untitled"}
                                                    </h3>
                                                    {item.location?.city && (
                                                        <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                                                            {item.location.city}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-gray-400 text-sm flex items-center gap-2">
                                                    <User className="w-4 h-4" /> {item.name || "Unknown"}
                                                </p>

                                                <p className="text-gray-300 text-sm line-clamp-2 min-h-[40px]">
                                                    {item.description || "No description available"}
                                                </p>

                                                {item.location?.area && (
                                                    <p className="text-xs text-gray-500">
                                                        📍 {item.location.area}
                                                    </p>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        setSelectedItem(item);
                                                        setShowClaimForm(false);
                                                        setAnswer("");
                                                    }}
                                                    className="w-full bg-white/10 border border-white/20 text-white font-semibold py-2 rounded-lg mt-2 hover:bg-yellow-400 hover:text-black hover:border-yellow-400 transition-colors"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {selectedItem && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl">
                            <div className="bg-white/10 border border-white/20 shadow-2xl rounded-2xl max-w-md w-full p-6 relative mx-4">
                                <button
                                    onClick={() => {
                                        setSelectedItem(null);
                                        setShowClaimForm(false);
                                    }}
                                    className="absolute top-4 right-4 text-white/70 hover:text-white"
                                >
                                    <X />
                                </button>

                                <img
                                    src={selectedItem.file || "/placeholder.png"}
                                    alt={selectedItem.title}
                                    className="w-full max-h-80 object-contain rounded-lg"
                                />

                                <h2 className="text-2xl font-bold mt-3">
                                    {selectedItem.title}
                                </h2>

                                <div className="flex gap-2">
                                    <span className={`text-base font-bold ${selectedItem.type === 'Lost' ? 'text-red-500' : 'text-green-500'}`}>
                                        {selectedItem.type || "Found"} Item
                                    </span>
                                </div>

                                <p className="mt-2 text-gray-300 flex items-center gap-2">
                                    <User className="w-4 h-4 text-yellow-400" />
                                    Finder: {selectedItem.name || "Unknown"}
                                </p>

                                <p className="mt-3 text-gray-200 flex items-start gap-2">
                                    <Paperclip className="w-4 h-4 mt-1 text-yellow-400" />
                                    {selectedItem.description}
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-400">
                                    {selectedItem.category && <span>🏷️ {selectedItem.category}</span>}
                                    {selectedItem.location?.city && <span>🏙️ {selectedItem.location.city}</span>}
                                    {selectedItem.location?.area && <span>📍 {selectedItem.location.area}</span>}
                                </div>

                                {/* Actions */}
                                {(() => {
                                    const storedUser = localStorage.getItem("user");
                                    const user = storedUser ? JSON.parse(storedUser) : null;
                                    const isOwner = user?.email === selectedItem.email;

                                    if (isOwner) {
                                        return (
                                            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded text-center">
                                                <p className="text-blue-400 font-semibold">
                                                    You uploaded this {selectedItem.type?.toLowerCase() || "found"} item
                                                </p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <>
                                            {!claim?.submitted && (
                                                <button
                                                    onClick={() => setShowClaimForm(true)}
                                                    className="w-full mt-4 bg-yellow-400 text-black py-2 rounded font-semibold hover:bg-yellow-500 transition"
                                                >
                                                    {selectedItem.type === 'Found' ? "This is my item" : "I found this item"}
                                                </button>
                                            )}

                                            {showClaimForm && !claim?.submitted && (
                                                <div className="mt-4 space-y-4 bg-white/5 p-4 rounded-lg">
                                                    {selectedItem.type === 'Found' ? (
                                                        <>
                                                            <p className="text-gray-300 text-sm font-semibold border-b border-gray-700 pb-2">
                                                                Answer verification questions to prove ownership:
                                                            </p>

                                                            {/* Legacy support: If old 'verify' field exists but no 'questions', show that */}
                                                            {(!selectedItem.questions || selectedItem.questions.length === 0) && selectedItem.verify && (
                                                                <div>
                                                                    <p className="text-gray-400 text-xs mb-1">{selectedItem.verify}</p>
                                                                    <input
                                                                        value={answer}
                                                                        onChange={(e) => setAnswer(e.target.value)}
                                                                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-yellow-400 focus:outline-none"
                                                                        placeholder="Your answer..."
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* New Multi-Question Support */}
                                                            {selectedItem.questions?.map((q: any, idx: number) => (
                                                                <div key={idx}>
                                                                    <p className="text-gray-400 text-xs mb-1">
                                                                        Q{idx + 1}: {q.question}
                                                                    </p>
                                                                    <input
                                                                        onChange={(e) => {
                                                                            const currentAnswers = [...(answers || [])];
                                                                            // Ensure we have an entry for this index
                                                                            const existingIndex = currentAnswers.findIndex(a => a.question === q.question);
                                                                            if (existingIndex >= 0) {
                                                                                currentAnswers[existingIndex].answer = e.target.value;
                                                                            } else {
                                                                                currentAnswers.push({ question: q.question, answer: e.target.value });
                                                                            }
                                                                            setAnswers(currentAnswers);
                                                                        }}
                                                                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-yellow-400 focus:outline-none text-sm"
                                                                        placeholder="Your answer..."
                                                                    />
                                                                </div>
                                                            ))}
                                                        </>
                                                    ) : (
                                                        <p className="text-gray-300 text-sm">
                                                            Notify the owner that you found their item. They will receive your contact details.
                                                        </p>
                                                    )}

                                                    <button
                                                        onClick={handleSubmitAnswer}
                                                        className="w-full bg-yellow-400 text-black py-2 rounded font-semibold hover:bg-yellow-500 transition"
                                                    >
                                                        {selectedItem.type === 'Found' ? "Submit Proof" : "Send Contact Info"}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}

                                {claim?.submitted && !claim?.approved && (
                                    <div className="mt-4 p-3 bg-yellow-400/10 border border-yellow-400/20 rounded text-center">
                                        <p className="text-yellow-400 text-sm">
                                            Request sent! Waiting for approval...
                                        </p>
                                    </div>
                                )}

                                {claim?.approved && (
                                    <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded space-y-2">
                                        <h3 className="text-green-400 font-semibold mb-2">Contact Details</h3>
                                        <p className="flex items-center gap-2 text-gray-300">
                                            <Phone className="w-4 h-4 text-green-400" /> {claim.phone}
                                        </p>
                                        <p className="flex items-center gap-2 text-gray-300">
                                            <Mail className="w-4 h-4 text-green-400" /> {claim.email}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <ToastContainer />
            </div >
        </>
    );
}
