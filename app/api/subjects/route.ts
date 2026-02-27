import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";
import { cookies } from "next/headers";

// GET all subjects (optionally filtered by class)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const classroomId = searchParams.get("classroomId");

        const subjects = await prisma.subject.findMany({
            where: {
                isArchived: false,
                ...(classroomId ? { classroomId } : {}),
            },
            include: {
                teacher: { select: { name: true, id: true } },
                classroom: true,
            }
        });

        return NextResponse.json(subjects);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
    }
}

// CREATE a subject
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await verifyToken(token);
        if (!user || (user.role !== "admin" && user.role !== "teacher")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { subjectId, name, classroomId, teacherId, roomNo, wifiSSID } = await req.json();

        const subject = await prisma.subject.create({
            data: {
                subjectId,
                name,
                classroomId,
                teacherId,
                roomNo,
                wifiSSID
            },
            include: {
                classroom: true,
                teacher: { select: { name: true, id: true } }
            }
        });

        return NextResponse.json(subject);
    } catch (error: any) {
        // Basic unique constraint error handling
        if (error.code === 'P2002') return NextResponse.json({ error: "Subject ID must be unique" }, { status: 400 });
        return NextResponse.json({ error: "Failed to create subject" }, { status: 500 });
    }
}
