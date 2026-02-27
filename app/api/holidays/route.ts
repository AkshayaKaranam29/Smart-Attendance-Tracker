import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const holidays = await prisma.holiday.findMany({
            orderBy: { date: 'asc' }
        });
        return NextResponse.json(holidays);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch holidays" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await verifyToken(token);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { date, name, type, region } = await req.json();

        const holiday = await prisma.holiday.create({
            data: {
                date: new Date(date),
                name,
                type,
                region,
                createdBy: user.id as string,
            }
        });

        return NextResponse.json(holiday);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to create holiday" }, { status: 500 });
    }
}
