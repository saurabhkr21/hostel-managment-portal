import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("[Auth] Attempting login for:", credentials?.email);
                const start = Date.now();

                if (!credentials?.email || !credentials?.password) {
                    console.log("[Auth] Missing credentials");
                    return null;
                }

                try {
                    console.log(`[Auth] Queries starting at ${Date.now() - start}ms`);
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email },
                        include: { profile: true },
                    });
                    console.log(`[Auth] User query took ${Date.now() - start}ms`);

                    if (!user) {
                        console.log("[Auth] User not found");
                        return null;
                    }

                    console.log(`[Auth] Bcrypt starting at ${Date.now() - start}ms`);
                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );
                    console.log(`[Auth] Bcrypt took ${Date.now() - start}ms`);

                    if (!isPasswordValid) {
                        console.log("[Auth] Invalid password");
                        return null;
                    }

                    console.log(`[Auth] Login success for user: ${user.id} at ${Date.now() - start}ms`);

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    };
                } catch (error) {
                    console.error("[Auth] Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as Role;
                session.user.id = token.id as string;
                session.user.image = token.picture;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
