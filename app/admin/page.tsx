"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import {
  getDemoAnalytics,
  demoClasses,
  demoSessions,
  demoStudents,
  demoUsers,
} from "@/lib/demo-data"
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
  GraduationCap,
  AlertTriangle,
  Shield,
  TrendingUp,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Activity,
  Server,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      router.push("/")
      return
    }
    setUser(currentUser)
  }, [router])

  if (!mounted || !user) return null

  const analytics = getDemoAnalytics()
  const teachers = demoUsers.filter((u) => u.role === "teacher")
  const students = demoUsers.filter((u) => u.role === "student")
  const allRecords = demoSessions.flatMap((s) => s.records)
  const flaggedRecords = allRecords.filter((r) => r.flagged)

  // Department breakdown
  const departments = Array.from(new Set(demoClasses.map((c) => c.department)))
  const deptData = departments.map((dept) => {
    const deptClasses = demoClasses.filter((c) => c.department === dept)
    const deptRecords = demoSessions
      .filter((s) => deptClasses.some((c) => c.id === s.classId))
      .flatMap((s) => s.records)
    const present = deptRecords.filter(
      (r) => r.status === "present" || r.status === "late"
    )
    return {
      name: dept,
      attendance: deptRecords.length > 0 ? Math.round((present.length / deptRecords.length) * 100) : 0,
      students: deptClasses.reduce((acc, c) => acc + c.students.length, 0),
    }
  })

  // Status distribution for pie chart
  const statusCounts = {
    present: allRecords.filter((r) => r.status === "present").length,
    late: allRecords.filter((r) => r.status === "late").length,
    absent: allRecords.filter((r) => r.status === "absent").length,
  }
  const pieData = [
    { name: "Present", value: statusCounts.present, color: "oklch(0.6 0.19 145)" },
    { name: "Late", value: statusCounts.late, color: "oklch(0.75 0.17 65)" },
    { name: "Absent", value: statusCounts.absent, color: "oklch(0.55 0.22 25)" },
  ]

  const heatmapData = analytics.attendanceTrend.map((t) => ({
    date: t.date,
    value: t.percentage,
  }))

  const chartData = analytics.attendanceTrend.slice(-14).map((t) => ({
    date: new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    attendance: t.percentage,
  }))

  // System health
  const systemHealth = [
    { label: "API Uptime", value: 99.9, unit: "%" },
    { label: "Avg Response Time", value: 45, unit: "ms" },
    { label: "Active Sessions", value: demoSessions.filter((s) => s.isActive).length, unit: "" },
    { label: "Sync Queue", value: 3, unit: "records" },
  ]

  return (
    <AppShell user={user} currentPath="/admin">
      <div className="space-y-6 p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Institution-wide attendance and engagement overview
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/admin/security")}>
              <Shield className="mr-2 h-4 w-4" />
              Security
            </Button>
            <Button onClick={() => router.push("/admin/analytics")}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Full Analytics
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Students"
            value={students.length}
            icon={Users}
            trend={{ value: 5, label: "this semester" }}
          />
          <StatCard
            label="Total Teachers"
            value={teachers.length}
            icon={GraduationCap}
            iconColor="text-chart-2"
          />
          <StatCard
            label="Avg Attendance"
            value={analytics.averageAttendance}
            suffix="%"
            icon={BarChart3}
            iconColor="text-accent"
            trend={{ value: 2.1, label: "vs last month" }}
          />
          <StatCard
            label="Fraud Flags"
            value={flaggedRecords.length}
            icon={AlertTriangle}
            iconColor="text-destructive"
            trend={{ value: -3, label: "vs last week" }}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Attendance Trend */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">
                Institution Attendance Trend
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="mr-1 h-3 w-3" />
                14 days
              </Badge>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="adminAttGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.55 0.2 160)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.55 0.2 160)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0 / 0.15)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="oklch(0.5 0 0)" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="oklch(0.5 0 0)" />
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
                    fill="url(#adminAttGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status distribution pie */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.17 0.015 240)",
                      border: "1px solid oklch(0.25 0.015 240)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0.005 240)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-xs">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-muted-foreground">{entry.name}</span>
                    <span className="font-semibold text-foreground">{entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Department Breakdown */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">
                Department Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0 / 0.15)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="oklch(0.5 0 0)" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="oklch(0.5 0 0)" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.17 0.015 240)",
                      border: "1px solid oklch(0.25 0.015 240)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0.005 240)",
                    }}
                  />
                  <Bar dataKey="attendance" fill="oklch(0.6 0.15 250)" radius={[4, 4, 0, 0]} name="Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Server className="h-4 w-4 text-primary" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemHealth.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-semibold text-foreground">
                        {item.value}{item.unit && ` ${item.unit}`}
                      </p>
                    </div>
                    {item.unit === "%" && (
                      <Progress value={item.value} className="mt-1.5 h-1.5" />
                    )}
                  </div>
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                </div>
              ))}

              <div className="rounded-lg border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-foreground">All Systems Operational</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Last checked: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Heatmap */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Institution Attendance Heatmap
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

        {/* Recent Security Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Shield className="h-4 w-4 text-destructive" />
              Recent Security Alerts
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/security")}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {flaggedRecords.length > 0 ? (
              <div className="space-y-2">
                {flaggedRecords.slice(0, 5).map((record) => {
                  const session = demoSessions.find((s) => s.id === record.sessionId)
                  const cls = demoClasses.find((c) => c.id === session?.classId)
                  return (
                    <div
                      key={record.id}
                      className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3"
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {record.studentName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cls?.name} | {record.flagReason}
                        </p>
                      </div>
                      <Badge variant="destructive" className="text-xs shrink-0">
                        Score: {Math.round(record.fraudScore)}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <Shield className="h-10 w-10 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No security alerts
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
