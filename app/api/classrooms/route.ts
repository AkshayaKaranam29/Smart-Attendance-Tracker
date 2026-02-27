import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";
import { cookies } from "next/headers";

// GET all classrooms
export async function GET() {
    try {
        const classrooms = await prisma.classroom.findMany({
            include: { subjects: true },
            where: { isArchived: false }
        });
        return NextResponse.json(classrooms);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch classrooms" }, { status: 500 });
    }
}

// CREATE a classroom
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await verifyToken(token);
        if (!user || (user.role !== "admin" && user.role !== "teacher")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, department, semester, section } = await req.json();

        const classroom = await prisma.classroom.create({
            data: {
                name,
                department,
                semester: Number(semester),
                section,
                createdBy: user.id as string,
            }
        });

        return NextResponse.json(classroom);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create classroom" }, { status: 500 });
    }
}
