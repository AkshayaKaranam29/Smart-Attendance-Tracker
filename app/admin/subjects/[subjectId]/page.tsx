"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import type { User, Subject } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Clock, MapPin, ArrowLeft } from "lucide-react"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function AdminTimetableManagerPage() {
    const router = useRouter()
    const { subjectId } = useParams()

    const [user, setUser] = useState<User | null>(null)
    const [subject, setSubject] = useState<any | null>(null)
    const [slots, setSlots] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [formData, setFormData] = useState({
        day: "",
        startTime: "",
        endTime: "",
        roomNo: ""
    })

    useEffect(() => {
        const currentUser = getCurrentUser()
        if (!currentUser || currentUser.role !== "admin") {
            router.push("/")
            return
        }
        setUser(currentUser)

        if (subjectId) {
            fetchData(subjectId as string)
        }
    }, [router, subjectId])

    const fetchData = async (id: string) => {
        try {
            setLoading(true)

            // 1. Fetch Subject directly from the main list
            const subRes = await fetch("/api/subjects")
            const allSubjects = await subRes.json()
            const matchingSubject = allSubjects.find((s: any) => s.id === id)
            setSubject(matchingSubject)

            // 2. Fetch the Timetable specific to this class
            if (matchingSubject) {
                const ttRes = await fetch(`/api/timetable?classroomId=${matchingSubject.classroomId}`)
                const ttData = await ttRes.json()
                // Filter specifically by subject - ensure data is actually an array
                if (Array.isArray(ttData)) {
                    setSlots(ttData.filter((t: any) => t.subjectId === id))
                } else {
                    setSlots([]) // Fallback if API returned an error payload
                }
                // Default the room to the subject's baseline room
                setFormData(prev => ({ ...prev, roomNo: matchingSubject.roomNo }))
            }
        } finally {
            setLoading(false)
        }
    }

    const handleCreateSlot = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!subject) return

        try {
            const res = await fetch("/api/timetable", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    subjectId: subject.id,
                    classroomId: subject.classroomId,
                    teacherId: subject.teacherId
                })
            })
            if (res.ok) {
                setFormData(prev => ({ ...prev, day: "", startTime: "", endTime: "" })) // Keep roomNo
                fetchData(subjectId as string)
            } else {
                const errorData = await res.json()
                alert(errorData.error)
            }
        } catch { }
    }

    if (!user) return null

    return (
        <AppShell user={user} currentPath="/admin/subjects">
            <div className="space-y-6 p-4 lg:p-6">

                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push("/admin/subjects")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {subject ? `Schedule: ${subject.name}` : "Timetable Manager"}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {subject ? `Assigning slots for ${subject.subjectId} (${subject.teacher?.name || 'Unassigned'})` : "Loading subject details..."}
                        </p>
                    </div>
                </div>

                {!loading && subject && (
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* LEFT: Add Slot Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Add Timetable Block</CardTitle>
                                <CardDescription>Define a new weekly occurrence</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateSlot} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Day of Week</label>
                                        <Select value={formData.day} onValueChange={(val) => setFormData({ ...formData, day: val })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Day" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DAYS.map(day => (
                                                    <SelectItem key={day} value={day}>{day}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Start Time</label>
                                            <Input
                                                type="time"
                                                value={formData.startTime}
                                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">End Time</label>
                                            <Input
                                                type="time"
                                                value={formData.endTime}
                                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Room Location</label>
                                        <Input
                                            placeholder="Room No"
                                            value={formData.roomNo}
                                            onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        <Plus className="mr-2 h-4 w-4" /> Add Slot
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* RIGHT: Current Schedule List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Schedule</CardTitle>
                                <CardDescription>All assigned blocks for this subject</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {slots.length === 0 ? (
                                        <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                                            No timetable slots configured yet.
                                        </div>
                                    ) : (
                                        slots.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day)).map((slot) => (
                                            <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg bg-card text-card-foreground shadow-sm">
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-sm">{slot.day}</p>
                                                    <div className="flex items-center text-xs text-muted-foreground gap-3">
                                                        <span className="flex items-center"><Clock className="mr-1 h-3 w-3" /> {slot.startTime} - {slot.endTime}</span>
                                                        <span className="flex items-center"><MapPin className="mr-1 h-3 w-3" /> {slot.roomNo}</span>
                                                    </div>
                                                </div>
                                                {/* Optionally an Admin Delete button could go here */}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppShell>
    )
}
