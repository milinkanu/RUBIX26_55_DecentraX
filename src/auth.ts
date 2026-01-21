

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    secret: process.env.AUTH_SECRET,
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        Credentials({
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    await connectDB();
                    const user = await User.findOne({ email: credentials.email });

                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(
                        credentials.password as string,
                        user.password as string
                    );

                    if (passwordsMatch) {
                        return {
                            id: user._id.toString(),
                            name: user.name,
                            email: user.email,
                            role: user.role,
                        };
                    }
                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        ...(authConfig.callbacks || {}),
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    await connectDB();
                    const existingUser = await User.findOne({ email: user.email });
                    if (!existingUser) {
                        await User.create({
                            name: user.name || "User",
                            email: user.email!,
                            role: "user",
                            isBlocked: false,
                        });
                    }
                    return true;
                } catch (error) {
                    console.error("Error creating user from OAuth:", error);
                    return false;
                }
            }
            return true;
        },
    },
});
