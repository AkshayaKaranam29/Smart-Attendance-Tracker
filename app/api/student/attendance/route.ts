import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await verifyToken(token);
        if (!user || user.role !== "student") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const records = await prisma.attendanceRecord.findMany({
            where: { studentId: user.id as string },
            include: {
                subject: { select: { name: true, subjectId: true } },
                session: { select: { date: true, startTime: true, endTime: true, teacher: { select: { name: true } } } }
            },
            orderBy: { timestamp: 'desc' }
        });

        // Group by Subject
        const subjectMap: Record<string, { subjectId: string, name: string, present: number, total: number, percentage: number }> = {};

        // Overall Stats
        let totalPresent = 0;

        records.forEach((r: any) => {
            if (!subjectMap[r.subjectId]) {
                subjectMap[r.subjectId] = { subjectId: r.subject.subjectId, name: r.subject.name, present: 0, total: 0, percentage: 0 };
            }

            if (r.status !== "holiday") {
                subjectMap[r.subjectId].total += 1;
            }
            if (r.status === "present" || r.status === "late") {
                subjectMap[r.subjectId].present += 1;
                totalPresent += 1;
                // "late" is fully present, or could be 0.5 depending on logic.
            }
        });

        Object.keys(subjectMap).forEach(key => {
            const sub = subjectMap[key];
            sub.percentage = sub.total > 0 ? Math.round((sub.present / sub.total) * 100) : 0;
        });

        const validRecords = records.filter((r: any) => r.status !== "holiday");
        const overallPercentage = validRecords.length > 0 ? Math.round((totalPresent / validRecords.length) * 100) : 0;

        return NextResponse.json({
            records,
            analytics: Object.values(subjectMap),
            overallPercentage,
            totalClasses: validRecords.length,
            totalPresent
        });

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 });
    }
}
