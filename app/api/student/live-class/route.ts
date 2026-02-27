import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";
import { cookies } from "next/headers";

function isTimeBetween(startTime: string, endTime: string, checkTime: Date) {
    const [sHour, sMin] = startTime.split(':').map(Number);
    const [eHour, eMin] = endTime.split(':').map(Number);

    const start = new Date(checkTime);
    start.setHours(sHour, sMin, 0);

    const end = new Date(checkTime);
    end.setHours(eHour, eMin, 0);

    return checkTime >= start && checkTime <= end;
}

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await verifyToken(token);
        if (!user || user.role !== "student") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const now = new Date();
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const currentDay = days[now.getDay()];

        // Find slots happening today for subjects the student attends.
        // NOTE: currently there's no Student-Classroom enrollment table explicitly in the prisma schema.
        // As per previous dummy data, students were in `demoClasses.students` array. 
        // Wait, the new schema implies students are just linked via AttendanceRecords to Subjects.
        // For a real college system, we usually need an Enrollment table. 
        // To not break the schema mid-flight without migrations, we will just fetch ALL slots today 
        // for all subjects in the system, and simulate the "Live Class" generic alert.

        // In a fully normalized system, we'd add an `Enrollment` model.
        // Let's grab all active slots for today matching current time.
        const slotsToday = await prisma.timetableSlot.findMany({
            where: { day: currentDay },
            include: {
                subject: { select: { name: true, subjectId: true } },
                teacher: { select: { name: true } }
            }
        });

        const liveClass = slotsToday.find((slot: any) => isTimeBetween(slot.startTime, slot.endTime, now));

        if (liveClass) {
            // Find if the teacher has started an attendance session
            const session = await prisma.attendanceSession.findFirst({
                where: {
                    subjectId: liveClass.subjectId,
                    isActive: true
                }
            });

            return NextResponse.json({
                live: true,
                slot: liveClass,
                sessionActive: !!session,
                sessionId: session?.id
            });
        }

        return NextResponse.json({ live: false });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch live class status" }, { status: 500 });
    }
}
