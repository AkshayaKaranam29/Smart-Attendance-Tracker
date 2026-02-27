import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";
import { cookies } from "next/headers";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;

        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await verifyToken(token);
        if (!user || (user.role !== "admin" && user.role !== "teacher")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { subjectId, name, classroomId, teacherId, roomNo, wifiSSID } = body;

        const updatedSubject = await prisma.subject.update({
            where: { id },
            data: {
                ...(subjectId && { subjectId }),
                ...(name && { name }),
                ...(classroomId && { classroomId }),
                // Only allow teacher reassignment updates if explicitly provided
                ...(teacherId && { teacherId }),
                ...(roomNo && { roomNo }),
                ...(wifiSSID !== undefined && { wifiSSID }),
            },
            include: {
                teacher: { select: { name: true, id: true } },
                classroom: true,
            }
        });

        return NextResponse.json(updatedSubject);
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ error: "Subject ID must be unique" }, { status: 400 });
        if (error.code === 'P2025') return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        return NextResponse.json({ error: "Failed to update subject" }, { status: 500 });
    }
}
