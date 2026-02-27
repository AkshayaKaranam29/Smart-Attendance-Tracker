"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import { getDemoAnalytics, demoClasses, demoSessions, demoStudents } from "@/lib/demo-data"
import type { User } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { StatCard } from "@/components/stat-card"
import { AttendanceHeatmap } from "@/components/attendance-heatmap"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  BarChart3,
  QrCode,
  AlertTriangle,
  Calendar,
  Clock,
  BookOpen,
  TrendingUp,
  ArrowRight,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
} from "recharts"

export default function TeacherDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

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

  const analytics = getDemoAnalytics()
  const myClasses = demoClasses.filter((c) => c.teacherId === user.id)
  const todaySessions = demoSessions.filter(
    (s) =>
      s.teacherId === user.id &&
      s.date === new Date().toISOString().split("T")[0]
  )

  const heatmapData = analytics.attendanceTrend.map((t) => ({
    date: t.date,
    value: t.percentage,
  }))

  // Attendance trend chart data
  const chartData = analytics.attendanceTrend.slice(-14).map((t) => ({
    date: new Date(t.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    attendance: t.percentage,
  }))

  // Recent flagged records
  const flaggedRecords = demoSessions
    .flatMap((s) => s.records)
    .filter((r) => r.flagged)
    .slice(0, 5)

  return (
    <AppShell user={user} currentPath="/teacher">
      <div className="space-y-6 p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back, {user.name.split(" ")[0]}
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <Button onClick={() => router.push("/teacher/attendance")} size="lg">
            <QrCode className="mr-2 h-5 w-5" />
            Start Attendance
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Students"
            value={analytics.totalStudents}
            icon={Users}
            trend={{ value: 3, label: "this month" }}
          />
          <StatCard
            label="Avg. Attendance"
            value={analytics.averageAttendance}
            suffix="%"
            icon={BarChart3}
            iconColor="text-chart-2"
            trend={{ value: 2.4, label: "vs last week" }}
          />
          <StatCard
            label="Active Classes"
            value={myClasses.length}
            icon={BookOpen}
            iconColor="text-accent"
          />
          <StatCard
            label="Defaulters"
            value={analytics.defaulterCount}
            icon={AlertTriangle}
            iconColor="text-destructive"
            trend={{ value: -1, label: "vs last week" }}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Attendance Trend Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">
                Attendance Trend (14 Days)
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="mr-1 h-3 w-3" />
                {analytics.averageAttendance}% avg
              </Badge>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="attendanceGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="oklch(0.55 0.2 160)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="oklch(0.55 0.2 160)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.3 0 0 / 0.15)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    stroke="oklch(0.5 0 0)"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11 }}
                    stroke="oklch(0.5 0 0)"
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.17 0.015 240)",
                      border: "1px solid oklch(0.25 0.015 240)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0.005 240)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="attendance"
                    stroke="oklch(0.55 0.2 160)"
                    strokeWidth={2}
                    fill="url(#attendanceGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Calendar className="h-4 w-4 text-primary" />
                {"Today's Schedule"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myClasses.map((cls) => {
                const todaySchedule = cls.schedule.find(
                  (s) =>
                    s.day ===
                    new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                    })
                )
                const session = todaySessions.find(
                  (s) => s.classId === cls.id
                )
                if (!todaySchedule) return null

                return (
                  <div
                    key={cls.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {cls.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {todaySchedule.startTime} - {todaySchedule.endTime}{" "}
                        | {cls.roomNo}
                      </p>
                    </div>
                    <Badge
                      variant={session?.isActive ? "default" : "outline"}
                      className="text-xs"
                    >
                      {session?.isActive ? "Active" : "Upcoming"}
                    </Badge>
                  </div>
                )
              })}
              {myClasses.every(
                (cls) =>
                  !cls.schedule.find(
                    (s) =>
                      s.day ===
                      new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                      })
                  )
              ) && (
                <div className="flex flex-col items-center py-8 text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No classes scheduled today
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Class-wise attendance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">
                Class-wise Attendance
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/teacher/analytics")}
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={analytics.classWiseAttendance.map((c) => ({
                    name:
                      c.className.length > 15
                        ? c.className.slice(0, 15) + "..."
                        : c.className,
                    attendance: c.percentage,
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.3 0 0 / 0.15)"
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 11 }}
                    stroke="oklch(0.5 0 0)"
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 11 }}
                    stroke="oklch(0.5 0 0)"
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.17 0.015 240)",
                      border: "1px solid oklch(0.25 0.015 240)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0.005 240)",
                    }}
                  />
                  <Bar
                    dataKey="attendance"
                    fill="oklch(0.55 0.2 160)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Flagged Records */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Suspicious Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {flaggedRecords.length > 0 ? (
                <div className="space-y-2">
                  {flaggedRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {record.studentName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {record.flagReason}
                        </p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        Score: {Math.round(record.fraudScore)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <AlertTriangle className="h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No suspicious activity detected
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Attendance Heatmap */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Attendance Heatmap (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceHeatmap data={heatmapData} />
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-secondary" />
                No data
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-destructive/40" />
                {"< 50%"}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-warning/50" />
                {"50-75%"}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-primary/40" />
                {"75-90%"}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-primary/80" />
                {"> 90%"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Defaulter students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">
              Defaulter Watch List
            </CardTitle>
            <Badge variant="destructive" className="text-xs">
              {analytics.defaulterCount} students
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoStudents.slice(0, 4).map((student) => {
                const studentRecords = demoSessions
                  .flatMap((s) => s.records)
                  .filter((r) => r.studentId === student.id)
                const present = studentRecords.filter(
                  (r) => r.status === "present" || r.status === "late"
                )
                const pct =
                  studentRecords.length > 0
                    ? Math.round(
                        (present.length / studentRecords.length) * 100
                      )
                    : 0

                return (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {student.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.enrollmentNo}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20">
                        <Progress
                          value={pct}
                          className="h-2"
                        />
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          pct < 75
                            ? "text-destructive"
                            : "text-foreground"
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
