"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import type { User } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Download, Plus, Filter, AlertTriangle, CheckCircle2, Edit } from "lucide-react"

export default function AdminStudentsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")
  const [filterDefaulters, setFilterDefaulters] = useState(false)

  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Edit Modal State
  const [editUser, setEditUser] = useState<any | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    enrollmentNo: "",
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
    loadStudents()
  }, [router])

  const loadStudents = async () => {
    try {
      const res = await fetch("/api/users?role=student")
      if (res.ok) {
        const data = await res.json()
        setStudents(data.users || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (student: any) => {
    setEditUser(student)
    setFormData({
      name: student.name || "",
      department: student.department || "",
      enrollmentNo: student.enrollmentNo || "",
      isActive: student.isActive ? "true" : "false"
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

      toast.success("Student updated successfully")
      setEditUser(null)
      loadStudents() // Refresh list
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!mounted || !user) return null

  const filteredStudents = students
    .filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.enrollmentNo?.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    )
    .filter((s) => !filterDefaulters || s.attendance < 75)

  return (
    <AppShell user={user} currentPath="/admin/students">
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Students
            </h1>
            <p className="text-sm text-muted-foreground">
              {students.length} students enrolled
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" onClick={() => router.push("/register")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, enrollment, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant={filterDefaulters ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterDefaulters(!filterDefaulters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {filterDefaulters ? "Show All" : "Defaulters Only"}
          </Button>
        </div>

        {/* Students table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Loading specific records...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead className="hidden sm:table-cell">Enrollment</TableHead>
                      <TableHead className="hidden md:table-cell">Department</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead className="hidden lg:table-cell">Access</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No registered students found.
                        </TableCell>
                      </TableRow>
                    ) : filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary uppercase">
                              {student.name.substring(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{student.name}</p>
                              <p className="text-xs text-muted-foreground sm:hidden">{student.enrollmentNo}</p>
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm text-muted-foreground font-mono">
                            {student.enrollmentNo || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">{student.department || "N/A"}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={student.attendance || 0} className="h-2 w-16" />
                            <span
                              className={`text-sm font-semibold ${student.attendance < 75 ? "text-destructive" : "text-foreground"
                                }`}
                            >
                              {Math.round(student.attendance || 0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {student.isActive ? (
                            <Badge variant="outline" className="text-xs border-success/30 text-success">
                              <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="mr-1 h-3 w-3" /> Disabled
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(student)}>
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
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
              <Label htmlFor="enrollmentNo">Enrollment No.</Label>
              <Input id="enrollmentNo" value={formData.enrollmentNo} onChange={(e) => setFormData({ ...formData, enrollmentNo: e.target.value })} />
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
