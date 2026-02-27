import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth-utils";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "admin") {
            return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const role = searchParams.get("role");

        const users = await prisma.user.findMany({
            where: role ? { role } : undefined,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                enrollmentNo: true,
                department: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" }
        });

        // For structural compatibility with the charts returning mock aggregate data
        // we'll append fake 'attendance' arrays for now until the records migration is complete.
        // This prevents the UI crashing right away.
        const mappedUsers = users.map(u => ({
            ...u,
            attendance: Math.floor(Math.random() * 40) + 60, // Dummy 60-100% attendance score
            flagged: 0
        }))

        return NextResponse.json({ users: mappedUsers });
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
