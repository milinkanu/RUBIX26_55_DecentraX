
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    secret: process.env.AUTH_SECRET,
    providers: [
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
});
