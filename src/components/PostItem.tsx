"use client";

import React, { useState, useEffect } from "react";
import { Upload, ChevronLeft } from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navbar } from "./Navbar";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function PostItem() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const editId = searchParams.get("edit");

    const [formData, setFormData] = useState({
        phone: "",
        title: "",
        description: "",
        verify: "",
        category: "",
        city: "",
        area: "",
        landmark: "",
        type: "Found", // Default
    });

    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);

    const categories = ["Mobile", "Wallet", "Documents", "Bag", "Keys", "Electronics", "Other"];
    const types = ["Lost", "Found"];

    useEffect(() => {
        if (editId) {
            fetchItemForEdit();
        }
    }, [editId]);

    const fetchItemForEdit = async () => {
        setLoading(true);
        try {
            const url = `/api/items/${editId}`;
            console.log("Fetching item for edit:", url);
            const res = await axios.get(url);
            const item = res.data;
            setFormData({
                phone: item.phone || "",
                title: item.title,
                description: item.description,
                verify: item.verify || "",
                category: item.category,
                city: item.location.city,
                area: item.location.area,
                landmark: item.location.landmark || "",
                type: item.type || "Found",
            });
            setFileUrl(item.file);
        } catch (err) {
            console.error("Error fetching item:", err);
            toast.error("Failed to load item data");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const storedUser = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
        const user = storedUser ? JSON.parse(storedUser) : null;

        if (
            !user?.email ||
            !formData.phone ||
            !formData.title ||
            !formData.description ||
            (formData.type === "Found" && !formData.verify) ||
            !formData.category ||
            !formData.city ||
            !formData.area ||
            !formData.type
        ) {
            toast.warning("Please fill all required fields");
            return;
        }

        if (!file && !fileUrl) {
            toast.warning("Please select a file to upload");
            return;
        }

        setUploading(true);

        try {
            let uploadedFileUrl = fileUrl;

            // Upload new file if selected
            if (file) {
                const data = new FormData();
                data.append("file", file);
                data.append("upload_preset", "First_time_using_cloudinary");

                const cloudinaryRes = await axios.post(
                    "https://api.cloudinary.com/v1_1/dscllest7/image/upload",
                    data
                );
                uploadedFileUrl = cloudinaryRes.data.secure_url;
            }

            const { category, city, area, landmark, type, ...rest } = formData;
            const payload = {
                ...rest,
                category,
                type,
                location: { city, area, landmark },
                email: user.email,
                file: uploadedFileUrl,
            };

            if (editId) {
                await axios.patch(`/api/items/${editId}`, payload);
                toast.success("Item updated successfully!");
                setTimeout(() => router.push("/dashboard"), 1500);
            } else {
                const newPayload = { ...payload, name: user.name };
                await axios.post(`/api/items`, newPayload);
                toast.success("Item posted successfully!");
                setFormData({
                    phone: "", title: "", description: "", verify: "",
                    category: "", city: "", area: "", landmark: "", type: "Found",
                });
                setFile(null);
                setFileUrl("");
            }
        } catch (err: any) {
            console.error("Error submitting item:", err);
            toast.error("Error: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            <Navbar />
            <ToastContainer position="top-center" autoClose={3000} />

            <div className="max-w-3xl mx-auto px-6 py-16">
                <div className="flex items-center justify-between mb-10">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-bold">{editId ? "Edit Item" : "Post Item"}</h1>
                    <div className="w-24"></div> {/* Spacer for symmetry */}
                </div>

                <div className="bg-black/80 p-8 rounded-2xl shadow-2xl border border-gray-800 backdrop-blur-md">
                    <p className="text-gray-400 mb-6">
                        {editId ? "Update your item details below" : "Please fill all the required fields"}
                    </p>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-3">Item Type</label>
                            <div className="flex gap-4">
                                {types.map((t) => (
                                    <label key={t} className={`flex-1 flex items-center justify-center gap-2 cursor-pointer px-4 py-3 rounded-xl border transition-all ${formData.type === t ? "bg-yellow-400/10 border-yellow-400 text-yellow-400" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"}`}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value={t}
                                            checked={formData.type === t}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <span className="font-bold uppercase tracking-wider text-xs">
                                            {t} Item
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full p-3 bg-black/50 border border-gray-800 rounded-xl text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">City *</label>
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="e.g. Mumbai"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-black/50 border border-gray-800 rounded-xl text-white focus:border-yellow-400 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Area *</label>
                                <input
                                    type="text"
                                    name="area"
                                    placeholder="e.g. Andheri West"
                                    value={formData.area}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-black/50 border border-gray-800 rounded-xl text-white focus:border-yellow-400 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Landmark (Optional)</label>
                            <input
                                type="text"
                                name="landmark"
                                placeholder="e.g. Near Metro Station"
                                value={formData.landmark}
                                onChange={handleChange}
                                className="w-full p-3 bg-black/50 border border-gray-800 rounded-xl text-white focus:border-yellow-400 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Contact Phone *</label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Your contact number"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full p-3 bg-black/50 border border-gray-800 rounded-xl text-white focus:border-yellow-400 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Title *</label>
                            <input
                                type="text"
                                name="title"
                                placeholder="What did you lose/find?"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full p-3 bg-black/50 border border-gray-800 rounded-xl text-white focus:border-yellow-400 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Description *</label>
                            <textarea
                                name="description"
                                placeholder="Provide more details about the item..."
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full p-3 bg-black/50 border border-gray-800 rounded-xl text-white focus:border-yellow-400 transition-all"
                            />
                        </div>

                        {formData.type === "Found" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Verification Question *</label>
                                <input
                                    type="text"
                                    name="verify"
                                    placeholder="e.g. What is the color of the case?"
                                    value={formData.verify}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-black/50 border border-gray-800 rounded-xl text-white focus:border-yellow-400 transition-all"
                                />
                                <p className="text-[10px] text-gray-500 mt-1">This will be asked to anyone trying to claim the item.</p>
                            </div>
                        )}

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Item Image *</label>
                            {fileUrl && !file && (
                                <div className="mb-4 relative group w-32 h-32">
                                    <img src={fileUrl} className="w-full h-full object-cover rounded-xl border border-gray-700" alt="Current" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                                        <p className="text-[10px] text-white">Click below to change</p>
                                    </div>
                                </div>
                            )}
                            <label
                                htmlFor="file"
                                className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-800 rounded-2xl cursor-pointer hover:border-yellow-400 hover:bg-yellow-400/5 transition-all group"
                            >
                                <Upload className="h-8 w-8 text-gray-500 group-hover:text-yellow-400" />
                                <span className="text-gray-400 group-hover:text-white font-medium">
                                    {file ? file.name : "Click to upload a new image"}
                                </span>
                            </label>
                            <input type="file" id="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                        </div>

                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full bg-yellow-400 text-black font-black py-4 rounded-xl hover:bg-yellow-500 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                    SAVING...
                                </div>
                            ) : (
                                editId ? "UPDATE POST" : "POST ITEM"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
