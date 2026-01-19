"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !password) {
            toast.warning(" Please fill all fields");
            return;
        }

        try {
            await axios.post(
                `${API_URL}/api/user/register`,
                { name, email, password }
            );

            toast.success("Account created successfully!");

            setTimeout(() => router.push("/login"), 2000);
        } catch (err) {
            console.error(err);
            toast.error("Failed to create account. Try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black p-4">
            <ToastContainer position="top-center" autoClose={3000} />

            <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center space-y-6">
                <h2 className="text-3xl font-bold text-white">Create Account</h2>
                <p className="text-gray-400">
                    Join our community and help others find what’s lost.
                </p>

                <form className="space-y-4 text-left" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-gray-300 text-sm mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full bg-white/10 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-400"
                            placeholder="Rohit Sharma"
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full bg-white/10 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-400"
                            placeholder="rohit@example.com"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full bg-white/10 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-400"
                            placeholder="••••••••"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-yellow-400 text-black font-semibold rounded-lg py-2 hover:bg-yellow-500 transition-colors"
                    >
                        Sign Up
                    </button>
                </form>

                <p className="text-gray-400 text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="text-yellow-400 hover:underline">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
}
