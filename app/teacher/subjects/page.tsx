"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import type { User, Subject, Classroom } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Book } from "lucide-react"

export default function TeacherSubjectsPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [classrooms, setClassrooms] = useState<Classroom[]>([])
    const [loading, setLoading] = useState(true)

    const [formData, setFormData] = useState({ subjectId: "", name: "", classroomId: "", roomNo: "", wifiSSID: "" })

    useEffect(() => {
        const currentUser = getCurrentUser()
        if (!currentUser || currentUser.role !== "teacher") {
            router.push("/")
            return
        }
        setUser(currentUser)
        fetchData()
    }, [router])

    const fetchData = async () => {
        try {
            const [subRes, clsRes] = await Promise.all([
                fetch("/api/subjects"),
                fetch("/api/classrooms")
            ])
            if (subRes.ok) setSubjects(await subRes.json())
            if (clsRes.ok) setClassrooms(await clsRes.json())
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.classroomId) return alert("Please select a classroom")

        try {
            const res = await fetch("/api/subjects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, teacherId: user?.id })
            })
            if (res.ok) {
                setFormData({ subjectId: "", name: "", classroomId: "", roomNo: "", wifiSSID: "" })
                fetchData()
            } else {
                const errorData = await res.json()
                alert(errorData.error)
            }
        } catch { }
    }

    if (!user) return null

    // Filter to just show the teacher's owned subjects
    const mySubjects = subjects.filter(sub => sub.teacherId === user.id)

    return (
        <AppShell user={user} currentPath="/teacher/subjects">
            <div className="space-y-6 p-4 lg:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Subject Management
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Define subjects and link them to institution classrooms
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Add New Subject</CardTitle>
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
                            <div className="sm:col-span-2 lg:col-span-1">
                                <Button type="submit" className="w-full">
                                    <Plus className="mr-2 h-4 w-4" /> Create Subject
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="text-center text-sm text-muted-foreground">Loading Subjects...</div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {mySubjects.map((sub: any) => (
                            <Card key={sub.id}>
                                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">{sub.subjectId}</div>
                                        <CardTitle className="text-lg">{sub.name}</CardTitle>
                                    </div>
                                    <Book className="h-5 w-5 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground">
                                        <p>Classroom: {sub.classroom?.name || "Unknown"}</p>
                                        <p>Room: {sub.roomNo}</p>
                                        {sub.wifiSSID && <p>WiFi: {sub.wifiSSID}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {mySubjects.length === 0 && (
                            <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                                No subjects found. Add yours above.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppShell>
    )
}
