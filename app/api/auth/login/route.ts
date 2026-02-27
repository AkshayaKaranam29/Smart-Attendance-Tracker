import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/auth-utils";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const { email, password, role } = await req.json();

        if (!email || !password || !role) {
            return NextResponse.json(
                { error: "Email, password, and role are required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        if (user.role !== role) {
            return NextResponse.json(
                { error: `This account does not have ${role} privileges.` },
                { status: 403 }
            );
        }

        if (!user.isActive) {
            return NextResponse.json(
                { error: "Account is disabled. Contact your administrator." },
                { status: 403 }
            );
        }

        const isMatch = await compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Don't send the password hash back to the client
        const { password: _, ...userWithoutPassword } = user;

        // Create a secure JWT containing user info
        const token = await signToken({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        });

        const cookieStore = await cookies();
        cookieStore.set({
            name: "auth_token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return NextResponse.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        console.error("Login exception:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
