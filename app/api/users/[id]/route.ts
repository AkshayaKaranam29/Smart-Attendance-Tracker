import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth-utils";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const resolvedParams = await params;
        const body = await req.json();
        const { name, department, enrollmentNo, isActive } = body;

        const user = await prisma.user.update({
            where: { id: resolvedParams.id },
            data: {
                name,
                department,
                enrollmentNo,
                isActive: isActive !== undefined ? isActive : undefined
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                enrollmentNo: true,
                department: true,
                isActive: true,
            }
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Failed to update user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
