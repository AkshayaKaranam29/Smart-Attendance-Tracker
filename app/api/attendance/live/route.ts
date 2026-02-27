import { NextResponse } from "next/server"

// Global in-memory storage for live attendance sessions and records during the demo
const globalLiveAttendance: Record<string, any[]> = {}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
        return NextResponse.json({ error: "sessionId is required" }, { status: 400 })
    }

    const records = globalLiveAttendance[sessionId] || []
    return NextResponse.json({ records })
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { sessionId, studentId, studentName, status, verificationMethod, fraudScore, location, flagged, flagReason } = body

        if (!sessionId || !studentId) {
            return NextResponse.json({ error: "sessionId and studentId are required" }, { status: 400 })
        }

        if (!globalLiveAttendance[sessionId]) {
            globalLiveAttendance[sessionId] = []
        }

        // Check if the student already marked attendance in this session to prevent duplicates
        const currentRecords = globalLiveAttendance[sessionId]
        const alreadyExists = currentRecords.find(r => r.studentId === studentId)

        if (alreadyExists) {
            return NextResponse.json({ success: false, error: "Attendance already marked." })
        }

        const newRecord = {
            id: `live-${Date.now()}-${studentId}`,
            sessionId,
            studentId,
            studentName: studentName || "Unknown",
            timestamp: new Date().toISOString(),
            status: status || "present",
            verificationMethod: verificationMethod || ["qr"],
            location,
            fraudScore: fraudScore || 0,
            flagged: flagged || false,
            flagReason,
            synced: true, // Marked as synced as it's a live flow
        }

        globalLiveAttendance[sessionId].push(newRecord)

        return NextResponse.json({ success: true, record: newRecord })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
