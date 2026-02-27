"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import type { User, Classroom } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Building, Edit } from "lucide-react"

export default function AdminClassroomsPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [classrooms, setClassrooms] = useState<Classroom[]>([])
    const [loading, setLoading] = useState(true)

    const [formData, setFormData] = useState({ name: "", department: "", semester: 1, section: "" })

    // Edit Modal State
    const [editClassroom, setEditClassroom] = useState<Classroom | null>(null)
    const [editFormData, setEditFormData] = useState({ name: "", department: "", semester: 1, section: "" })
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        const currentUser = getCurrentUser()
        if (!currentUser || currentUser.role !== "admin") {
            router.push("/")
            return
        }
        setUser(currentUser)
        fetchClassrooms()
    }, [router])

    const fetchClassrooms = async () => {
        try {
            const res = await fetch("/api/classrooms")
            if (res.ok) {
                const data = await res.json()
                setClassrooms(data)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch("/api/classrooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setFormData({ name: "", department: "", semester: 1, section: "" })
                fetchClassrooms()
            }
        } catch { }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editClassroom) return

        setIsUpdating(true)
        try {
            const res = await fetch(`/api/classrooms/${editClassroom.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editFormData),
            })

            if (res.ok) {
                fetchClassrooms()
                setEditClassroom(null)
            } else {
                const data = await res.json()
                alert(data.error || "Failed to update classroom")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsUpdating(false)
        }
    }

    const openEditModal = (cls: Classroom) => {
        setEditClassroom(cls)
        setEditFormData({
            name: cls.name,
            department: cls.department,
            semester: cls.semester,
            section: cls.section || ""
        })
    }

    if (!user) return null

    return (
        <AppShell user={user} currentPath="/admin/classrooms">
            <div className="space-y-6 p-4 lg:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Classroom Management
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Create and oversee institution classrooms
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Create New Classroom</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Input
                                placeholder="Name (e.g. CS Lab 1)"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <Input
                                placeholder="Department (e.g. Computer Science)"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                required
                            />
                            <Input
                                type="number"
                                min="1"
                                placeholder="Semester"
                                value={formData.semester}
                                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                                required
                            />
                            <Input
                                placeholder="Section (e.g. A)"
                                value={formData.section}
                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                            />
                            <Button type="submit" className="sm:col-span-2 lg:col-span-4">
                                <Plus className="mr-2 h-4 w-4" /> Add Classroom
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="text-center text-sm text-muted-foreground">Loading Classrooms...</div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {classrooms.map((cls) => (
                            <Card key={cls.id}>
                                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">{cls.name}</CardTitle>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => openEditModal(cls)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground">
                                        <p>Department: {cls.department}</p>
                                        <p>Semester: {cls.semester} | Section: {cls.section || "N/A"}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {classrooms.length === 0 && (
                            <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                                No classrooms found. Create one above.
                            </div>
                        )}
                    </div>
                )}

                {/* Edit Classroom Modal */}
                <Dialog open={!!editClassroom} onOpenChange={(open) => !open && setEditClassroom(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Classroom</DialogTitle>
                            <DialogDescription>
                                Modify tracking details for this classroom.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Department</Label>
                                <Input
                                    value={editFormData.department}
                                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Semester</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={editFormData.semester}
                                        onChange={(e) => setEditFormData({ ...editFormData, semester: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Section</Label>
                                    <Input
                                        value={editFormData.section}
                                        onChange={(e) => setEditFormData({ ...editFormData, section: e.target.value })}
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
