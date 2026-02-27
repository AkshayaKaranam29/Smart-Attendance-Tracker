"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import type { User, Subject, TimetableSlot } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Clock } from "lucide-react"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function TeacherTimetablePage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [slots, setSlots] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [formData, setFormData] = useState({ subjectId: "", day: "Monday", startTime: "09:00", endTime: "10:00", roomNo: "" })

    useEffect(() => {
        const currentUser = getCurrentUser()
        if (!currentUser || currentUser.role !== "teacher") {
            router.push("/")
            return
        }
        setUser(currentUser)
        fetchData(currentUser.id)
    }, [router])

    const fetchData = async (teacherId: string) => {
        try {
            const [subRes, slotRes] = await Promise.all([
                fetch(`/api/subjects`), // Backend filters by teacher
                fetch(`/api/timetable?teacherId=${teacherId}`)
            ])
            if (subRes.ok) setSubjects(await subRes.json())
            if (slotRes.ok) setSlots(await slotRes.json())
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        const selectedSubject = subjects.find(s => s.id === formData.subjectId)
        if (!selectedSubject) return alert("Select a subject")

        try {
            const res = await fetch("/api/timetable", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    classroomId: selectedSubject.classroomId
                })
            })
            if (res.ok) {
                setFormData({ ...formData, roomNo: "" }) // Keep day/time for quick consecutive additions
                if (user) fetchData(user.id)
            } else {
                const errorData = await res.json()
                alert(errorData.error)
            }
        } catch { }
    }

    if (!user) return null

    // Ensure subjects shown are owned by this teacher
    const mySubjects = subjects.filter(s => s.teacherId === user.id)

    return (
        <AppShell user={user} currentPath="/teacher/timetable">
            <div className="space-y-6 p-4 lg:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Timetable Management
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Schedule your subjects across the week
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Add Time Slot</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                            <div className="lg:col-span-2">
                                <Select value={formData.subjectId} onValueChange={(val) => setFormData({ ...formData, subjectId: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mySubjects.map((sub: any) => (
                                            <SelectItem key={sub.id} value={sub.id}>
                                                {sub.name} ({sub.subjectId})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Select value={formData.day} onValueChange={(val) => setFormData({ ...formData, day: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Day" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DAYS.map((d) => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                required
                            />
                            <Input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                required
                            />
                            <Input
                                placeholder="Room No"
                                value={formData.roomNo}
                                onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                                required
                            />
                            <Button type="submit" className="sm:col-span-2 lg:col-span-6">
                                <Plus className="mr-2 h-4 w-4" /> Add Slot
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="text-center text-sm text-muted-foreground">Loading Schedule...</div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {DAYS.map((day) => {
                            const daySlots = slots.filter((s: any) => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime))
                            if (daySlots.length === 0) return null

                            return (
                                <Card key={day}>
                                    <CardHeader className="pb-3 border-b border-border/50">
                                        <CardTitle className="text-lg">{day}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-3">
                                        {daySlots.map((slot: any) => (
                                            <div key={slot.id} className="flex justify-between items-center text-sm border border-border p-2 rounded-md">
                                                <div>
                                                    <div className="font-medium">{slot.subject?.name}</div>
                                                    <div className="text-xs text-muted-foreground">{slot.subject?.subjectId} | Room {slot.roomNo}</div>
                                                </div>
                                                <div className="flex items-center text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {slot.startTime} - {slot.endTime}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )
                        })}
                        {slots.length === 0 && (
                            <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                                Your schedule is empty. Add slots above.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppShell>
    )
}
