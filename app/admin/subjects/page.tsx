"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import type { User, Subject, Classroom } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Book, CalendarDays, Edit } from "lucide-react"

export default function AdminSubjectsPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [subjects, setSubjects] = useState<any[]>([])
    const [classrooms, setClassrooms] = useState<Classroom[]>([])
    const [teachers, setTeachers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [formData, setFormData] = useState({ subjectId: "", name: "", classroomId: "", teacherId: "", roomNo: "", wifiSSID: "" })

    // Edit Modal State
    const [editSubject, setEditSubject] = useState<any | null>(null)
    const [editFormData, setEditFormData] = useState({ subjectId: "", name: "", classroomId: "", teacherId: "", roomNo: "", wifiSSID: "" })
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        const currentUser = getCurrentUser()
        if (!currentUser || currentUser.role !== "admin") {
            router.push("/")
            return
        }
        setUser(currentUser)
        fetchData()
    }, [router])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [subRes, clsRes, teacherRes] = await Promise.all([
                fetch("/api/subjects"),
                fetch("/api/classrooms"),
                fetch("/api/users?role=teacher")
            ])
            if (subRes.ok) setSubjects(await subRes.json())
            if (clsRes.ok) setClassrooms(await clsRes.json())

            if (teacherRes.ok) {
                const data = await teacherRes.json()
                setTeachers(data.users || [])
            }
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.classroomId) return alert("Please select a classroom")
        if (!formData.teacherId) return alert("Please dynamically assign a teacher")

        try {
            const res = await fetch("/api/subjects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setFormData({ subjectId: "", name: "", classroomId: "", teacherId: "", roomNo: "", wifiSSID: "" })
                fetchData()
            } else {
                const errorData = await res.json()
                alert(errorData.error)
            }
        } catch { }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editSubject) return

        setIsUpdating(true)
        try {
            const res = await fetch(`/api/subjects/${editSubject.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editFormData),
            })

            if (res.ok) {
                fetchData()
                setEditSubject(null)
            } else {
                const data = await res.json()
                alert(data.error || "Failed to update subject")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsUpdating(false)
        }
    }

    const openEditModal = (sub: any) => {
        setEditSubject(sub)
        setEditFormData({
            subjectId: sub.subjectId,
            name: sub.name,
            classroomId: sub.classroomId,
            teacherId: sub.teacherId || "",
            roomNo: sub.roomNo,
            wifiSSID: sub.wifiSSID || ""
        })
    }

    if (!user) return null

    return (
        <AppShell user={user} currentPath="/admin/subjects">
            <div className="space-y-6 p-4 lg:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Institution Subjects
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Create subjects and assign them to specific teachers and classrooms
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Register New Subject</CardTitle>
                        <CardDescription>Allocate curriculum responsibilities below</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Input
                                placeholder="Subject Code (e.g. CS301)"
                                value={formData.subjectId}
                                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                required
                            />
                            <Input
                                placeholder="Subject Name (e.g. Data Structures)"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <Select value={formData.classroomId} onValueChange={(val) => setFormData({ ...formData, classroomId: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Classroom" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classrooms.map((cls) => (
                                        <SelectItem key={cls.id} value={cls.id}>
                                            {cls.name} (Sem {cls.semester} {cls.section})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={formData.teacherId} onValueChange={(val) => setFormData({ ...formData, teacherId: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Assign Teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.name} ({t.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                placeholder="Room No (e.g. Lab 4)"
                                value={formData.roomNo}
                                onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                                required
                            />
                            <Input
                                placeholder="WiFi SSID Validator (Optional)"
                                value={formData.wifiSSID}
                                onChange={(e) => setFormData({ ...formData, wifiSSID: e.target.value })}
                            />
                            <div className="sm:col-span-2 lg:col-span-3">
                                <Button type="submit" className="w-full lg:w-auto">
                                    <Plus className="mr-2 h-4 w-4" /> Register Subject
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="text-center text-sm text-muted-foreground py-8">Loading Institution Subjects...</div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {subjects.map((sub: any) => (
                            <Card key={sub.id} className="flex flex-col">
                                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="text-xs font-mono text-muted-foreground">{sub.subjectId}</div>
                                            <Book className="h-4 w-4 text-primary opacity-75" />
                                        </div>
                                        <CardTitle className="text-lg">{sub.name}</CardTitle>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => openEditModal(sub)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <div className="text-sm space-y-1">
                                        <p className="flex justify-between"><span className="text-muted-foreground">Classroom:</span> <span className="font-medium text-right">{sub.classroom?.name || "Unknown"}</span></p>
                                        <p className="flex justify-between"><span className="text-muted-foreground">Teacher:</span> <span className="font-medium text-right line-clamp-1" title={sub.teacher?.name}>{sub.teacher?.name || "Unassigned"}</span></p>
                                        <p className="flex justify-between"><span className="text-muted-foreground">Room:</span> <span className="font-medium text-right">{sub.roomNo}</span></p>
                                    </div>

                                    <Button
                                        variant="secondary"
                                        className="w-full mt-4"
                                        onClick={() => router.push(`/admin/subjects/${sub.id}`)}
                                    >
                                        <CalendarDays className="mr-2 h-4 w-4" /> Manage Timetable
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                        {subjects.length === 0 && (
                            <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
                                <h3 className="text-lg font-semibold">No subjects available</h3>
                                <p className="text-sm text-muted-foreground mt-1">Register the first curriculum subject above.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Edit Subject Modal */}
                <Dialog open={!!editSubject} onOpenChange={(open) => !open && setEditSubject(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Subject details</DialogTitle>
                            <DialogDescription>
                                Reassign classes or modify curriculum tags.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Subject Code</Label>
                                    <Input
                                        value={editFormData.subjectId}
                                        onChange={(e) => setEditFormData({ ...editFormData, subjectId: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subject Name</Label>
                                    <Input
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Assigned Classroom</Label>
                                <Select value={editFormData.classroomId} onValueChange={(val) => setEditFormData({ ...editFormData, classroomId: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Classroom" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classrooms.map((cls) => (
                                            <SelectItem key={cls.id} value={cls.id}>
                                                {cls.name} (Sem {cls.semester} {cls.section})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Assigned Teacher</Label>
                                <Select value={editFormData.teacherId} onValueChange={(val) => setEditFormData({ ...editFormData, teacherId: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Assign Teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.name} ({t.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Room No</Label>
                                    <Input
                                        value={editFormData.roomNo}
                                        onChange={(e) => setEditFormData({ ...editFormData, roomNo: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>WiFi SSID (Optional)</Label>
                                    <Input
                                        value={editFormData.wifiSSID}
                                        onChange={(e) => setEditFormData({ ...editFormData, wifiSSID: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isUpdating}>
                                {isUpdating ? "Saving..." : "Save Changes"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </AppShell>
    )
}
