"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import { demoStudents, demoSessions, demoEngagement } from "@/lib/demo-data"
import type { User } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react"

export default function TeacherStudentsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    setMounted(true)
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role !== "teacher") {
      router.push("/")
      return
    }
    setUser(currentUser)
  }, [router])

  if (!mounted || !user) return null

  const students = demoStudents
    .filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.enrollmentNo?.toLowerCase().includes(search.toLowerCase())
    )
    .map((student) => {
      const records = demoSessions
        .flatMap((s) => s.records)
        .filter((r) => r.studentId === student.id)
      const present = records.filter(
        (r) => r.status === "present" || r.status === "late"
      )
      const pct =
        records.length > 0
          ? Math.round((present.length / records.length) * 100)
          : 0
      const engagement = demoEngagement.find(
        (e) => e.studentId === student.id
      )
      const flagged = records.filter((r) => r.flagged).length

      return {
        ...student,
        attendancePercentage: pct,
        totalClasses: records.length,
        present: present.length,
        engagement: engagement?.overallScore || 0,
        engagementTrend: engagement?.trend || "stable",
        flaggedCount: flagged,
        isDefaulter: pct < 75,
      }
    })

  return (
    <AppShell user={user} currentPath="/teacher/students">
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Students
            </h1>
            <p className="text-sm text-muted-foreground">
              View student attendance and engagement details
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Mobile cards view */}
        <div className="space-y-3 lg:hidden">
          {students.map((student) => (
            <Card key={student.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {student.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {student.name}
                      </p>
                      {student.isDefaulter && (
                        <Badge variant="destructive" className="text-[10px]">
                          Defaulter
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {student.enrollmentNo}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Attendance</p>
                    <p className={`text-sm font-semibold ${student.attendancePercentage < 75 ? "text-destructive" : "text-foreground"}`}>
                      {student.attendancePercentage}%
                    </p>
                    <Progress value={student.attendancePercentage} className="mt-1 h-1.5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                    <p className="text-sm font-semibold text-foreground">
                      {student.engagement}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Flags</p>
                    <p className="text-sm font-semibold text-foreground">
                      {student.flaggedCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop table */}
        <Card className="hidden lg:block">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {student.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.enrollmentNo}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={student.attendancePercentage}
                          className="h-2 w-16"
                        />
                        <span
                          className={`text-sm font-semibold ${
                            student.attendancePercentage < 75
                              ? "text-destructive"
                              : "text-foreground"
                          }`}
                        >
                          {student.attendancePercentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.present}/{student.totalClasses}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{student.engagement}%</span>
                    </TableCell>
                    <TableCell>
                      {student.engagementTrend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : student.engagementTrend === "down" ? (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      ) : (
                        <Minus className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      {student.flaggedCount > 0 ? (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                          <span className="text-sm">{student.flaggedCount}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {student.isDefaulter ? (
                        <Badge variant="destructive" className="text-xs">
                          Defaulter
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs border-success/30 text-success">
                          Regular
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
