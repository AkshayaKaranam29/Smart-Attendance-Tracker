import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const users = await prisma.user.findMany();
        return NextResponse.json({ count: users.length, users: users.map(u => ({ email: u.email, role: u.role })) });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
