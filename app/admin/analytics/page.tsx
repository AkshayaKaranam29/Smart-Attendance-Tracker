"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import {
  getDemoAnalytics,
  demoClasses,
  demoSessions,
  demoStudents,
  demoEngagement,
} from "@/lib/demo-data"
import type { User } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  AlertTriangle,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from "recharts"

export default function AdminAnalyticsPage() {
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

  // Engagement radar data
  const engagementRadar = analytics.engagementOverview.map((e) => ({
    subject: e.metric,
    value: e.value,
    fullMark: 100,
  }))

  // Class comparison data
  const classComparison = demoClasses.map((cls) => {
    const records = demoSessions
      .filter((s) => s.classId === cls.id)
      .flatMap((s) => s.records)
    const present = records.filter((r) => r.status === "present" || r.status === "late")
    const avg = records.length > 0 ? Math.round((present.length / records.length) * 100) : 0
    const engagement = demoEngagement
      .filter((e) => e.classId === cls.id)
      .reduce((acc, e) => acc + e.overallScore, 0)
    const engAvg = demoEngagement.filter((e) => e.classId === cls.id).length > 0
      ? Math.round(engagement / demoEngagement.filter((e) => e.classId === cls.id).length)
      : 0

    return {
      name: cls.code,
      attendance: avg,
      engagement: engAvg,
      students: cls.students.length,
    }
  })

  // Daily distribution by hour
  const hourlyData = Array.from({ length: 8 }, (_, i) => ({
    hour: `${8 + i}:00`,
    sessions: Math.floor(Math.random() * 5) + 1,
    avgAttendance: Math.floor(70 + Math.random() * 25),
  }))

  // Weekly pattern
  const weeklyPattern = ["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => ({
    day,
    attendance: Math.floor(70 + Math.random() * 25),
    engagement: Math.floor(55 + Math.random() * 40),
  }))

  const chartData = analytics.attendanceTrend.slice(-14).map((t) => ({
    date: new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    attendance: t.percentage,
  }))

  return (
    <AppShell user={user} currentPath="/admin/analytics">
      <div className="space-y-6 p-4 lg:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Analytics Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive attendance and engagement analytics across the institution
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Attendance</p>
                <p className="text-xl font-bold text-foreground">{analytics.averageAttendance}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                <BookOpen className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
                <p className="text-xl font-bold text-foreground">{analytics.totalClasses}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Students</p>
                <p className="text-xl font-bold text-foreground">{demoStudents.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">At-Risk Students</p>
                <p className="text-xl font-bold text-foreground">{analytics.defaulterCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 14-day attendance trend */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Attendance Trend</CardTitle>
              <Badge variant="outline" className="text-xs">14 days</Badge>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="attendance" stroke="oklch(0.55 0.2 160)" strokeWidth={2} fill="url(#analyticsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Engagement Radar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Engagement Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={engagementRadar}>
                  <PolarGrid stroke="oklch(0.3 0 0 / 0.2)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} stroke="oklch(0.3 0 0 / 0.2)" />
                  <Radar
                    name="Engagement"
                    dataKey="value"
                    stroke="oklch(0.55 0.2 160)"
                    fill="oklch(0.55 0.2 160)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Class comparison */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Class Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={classComparison}>
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
                  <Bar dataKey="attendance" fill="oklch(0.55 0.2 160)" radius={[4, 4, 0, 0]} name="Attendance %" />
                  <Bar dataKey="engagement" fill="oklch(0.6 0.15 250)" radius={[4, 4, 0, 0]} name="Engagement %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly pattern */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Weekly Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyPattern}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0 / 0.15)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="oklch(0.5 0 0)" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="oklch(0.5 0 0)" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.17 0.015 240)",
                      border: "1px solid oklch(0.25 0.015 240)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0.005 240)",
                    }}
                  />
                  <Line type="monotone" dataKey="attendance" stroke="oklch(0.55 0.2 160)" strokeWidth={2} dot={{ r: 4 }} name="Attendance" />
                  <Line type="monotone" dataKey="engagement" stroke="oklch(0.65 0.18 45)" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 5" name="Engagement" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Hourly distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Hourly Session Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0 / 0.15)" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="oklch(0.5 0 0)" />
                <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.5 0 0)" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.17 0.015 240)",
                    border: "1px solid oklch(0.25 0.015 240)",
                    borderRadius: "8px",
                    color: "oklch(0.95 0.005 240)",
                  }}
                />
                <Bar dataKey="sessions" fill="oklch(0.65 0.18 45)" radius={[4, 4, 0, 0]} name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
