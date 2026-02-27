import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");
        const classroomId = searchParams.get("classroomId");

        const slots = await prisma.timetableSlot.findMany({
            where: {
                ...(teacherId ? { teacherId } : {}),
                ...(classroomId ? { classroomId } : {}),
            },
            include: {
                subject: { select: { name: true, subjectId: true } },
                classroom: { select: { name: true, department: true } }
            }
        });

        return NextResponse.json(slots);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch timetable" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await verifyToken(token);
        if (!user || (user.role !== "teacher" && user.role !== "admin")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { subjectId, classroomId, day, startTime, endTime, roomNo, teacherId } = await req.json();

        // If an admin provides a teacherId, use it. Otherwise default to the requestor's own ID.
        const assignedTeacherId = (user.role === "admin" && teacherId) ? teacherId : user.id;

        const slot = await prisma.timetableSlot.create({
            data: {
                subjectId,
                classroomId,
                teacherId: assignedTeacherId as string,
                day,
                startTime,
                endTime,
                roomNo
            }
        });

        return NextResponse.json(slot);
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ error: "A slot already exists for this time and day" }, { status: 400 });
        return NextResponse.json({ error: "Failed to create slot" }, { status: 500 });
    }
}
