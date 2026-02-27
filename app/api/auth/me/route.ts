import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
        }

        const decoded = await verifyToken(token);

        if (!decoded || !decoded.id) {
            return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id as string },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                avatar: true,
                department: true,
                enrollmentNo: true,
                deviceId: true,
                isActive: true,
                createdAt: true,
            }
        });

        if (!user) {
            return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
        }

        return NextResponse.json({ authenticated: true, user });
    } catch (error) {
        return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
    }
}
