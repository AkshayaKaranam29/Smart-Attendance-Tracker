import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const { name, email, role, phone, department, enrollmentNo, password } = await req.json();

        // In a real app, an authentication check on "Admin" would exist here.
        // E.g., const authCookie = cookies().get("auth_token") ... etc.

        if (!name || !email || !role || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email: email.toLowerCase() }, { enrollmentNo: enrollmentNo || "NON_EXISTENT_ENROLLMENT" }],
            },
        });

        if (existingUser) {
            if (existingUser.email === email.toLowerCase()) {
                return NextResponse.json(
                    { error: "An account with this email already exists." },
                    { status: 400 }
                );
            }
            return NextResponse.json(
                { error: "An account with this enrollment number already exists." },
                { status: 400 }
            );
        }

        const hashedPassword = await hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                role,
                phone,
                department,
                enrollmentNo: enrollmentNo && enrollmentNo.trim() !== "" ? enrollmentNo : null,
                password: hashedPassword,
            },
        });

        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        console.error("Registration exception:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
