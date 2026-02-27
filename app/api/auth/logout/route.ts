import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    const cookieStore = await cookies();
    cookieStore.set({
        name: "auth_token",
        value: "",
        expires: new Date(0), // Set expiration in the past to delete the cookie
        path: "/",
    });

    return NextResponse.json({ success: true });
}
