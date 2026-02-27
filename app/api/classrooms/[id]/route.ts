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
        // Both Admin and Teachers can edit classrooms depending on the app's internal policy
        if (!user || (user.role !== "admin" && user.role !== "teacher")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, department, semester, section } = body;

        const updatedClassroom = await prisma.classroom.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(department && { department }),
                ...(semester && { semester: Number(semester) }),
                ...(section !== undefined && { section }),
            },
        });

        return NextResponse.json(updatedClassroom);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json({ error: "Classroom not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Failed to update classroom" }, { status: 500 });
    }
}
