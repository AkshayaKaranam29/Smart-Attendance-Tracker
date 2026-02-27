"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import type { User } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  BookOpen,
  Users,
  BarChart3,
  Mail,
  Phone,
  Plus,
  Edit
} from "lucide-react"

export default function AdminTeachersPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")

  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Edit Modal State
  const [editUser, setEditUser] = useState<any | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    isActive: "true"
  })

  useEffect(() => {
    setMounted(true)
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      router.push("/")
      return
    }
    setUser(currentUser)
    loadTeachers()
  }, [router])

  const loadTeachers = async () => {
    try {
      const res = await fetch("/api/users?role=teacher")
      if (res.ok) {
        const data = await res.json()
        setTeachers(data.users || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (teacher: any) => {
    setEditUser(teacher)
    setFormData({
      name: teacher.name || "",
      department: teacher.department || "",
      isActive: teacher.isActive ? "true" : "false"
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return

    setIsUpdating(true)
    try {
      const res = await fetch(`/api/users/${editUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          isActive: formData.isActive === "true"
        })
      })

      if (!res.ok) throw new Error("Failed to update user")

      toast.success("Teacher updated successfully")
      setEditUser(null)
      loadTeachers() // Refresh list
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!mounted || !user) return null

  const filteredTeachers = teachers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell user={user} currentPath="/admin/teachers">
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Teachers
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage teaching staff and their class assignments
            </p>
          </div>
          <Button onClick={() => router.push("/register")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Teacher
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Teacher cards */}
        {loading ? (
          <div className="text-center text-sm text-muted-foreground p-8">Loading specific records...</div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground border rounded-lg p-12">No registered teachers found.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => {
              const initials = teacher.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)

              return (
                <Card key={teacher.id} className="overflow-hidden relative group">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 pr-8">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {teacher.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {teacher.department || "No Department"}
                        </p>
                        <Badge
                          variant={teacher.isActive ? "outline" : "destructive"}
                          className={`mt-1.5 text-[10px] ${teacher.isActive ? "border-success/30 text-success" : ""}`}
                        >
                          {teacher.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-secondary/30 p-3">
                      <div className="flex flex-col items-center">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <p className="mt-1 text-sm font-bold text-foreground">0</p>
                        <p className="text-[10px] text-muted-foreground">Classes</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <p className="mt-1 text-sm font-bold text-foreground">0</p>
                        <p className="text-[10px] text-muted-foreground">Students</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <p className="mt-1 text-sm font-bold text-foreground">{teacher.attendance}%</p>
                        <p className="text-[10px] text-muted-foreground">Avg Att.</p>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-between items-end">
                      <div className="space-y-1.5 text-xs text-muted-foreground flex-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{teacher.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{teacher.phone || "N/A"}</span>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openEditModal(teacher)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to the user's role and state here.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Account Status</Label>
              <Select value={formData.isActive} onValueChange={(val) => setFormData({ ...formData, isActive: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit" disabled={isUpdating}>{isUpdating ? "Saving..." : "Save changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
