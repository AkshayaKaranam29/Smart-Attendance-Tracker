"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import { getDemoAnalytics, demoClasses, demoSessions, demoEngagement, demoStudents } from "@/lib/demo-data"
import type { User } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  Users,
  TrendingUp,
  Brain,
  AlertTriangle,
  Target,
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
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = [
  "oklch(0.55 0.2 160)",
  "oklch(0.6 0.15 250)",
  "oklch(0.65 0.18 45)",
  "oklch(0.7 0.16 130)",
]

export default function TeacherAnalyticsPage() {
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

  const trendData = analytics.attendanceTrend.slice(-14).map((t) => ({
    date: new Date(t.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    attendance: t.percentage,
  }))

  const engagementRadar = analytics.engagementOverview.map((e) => ({
    metric: e.metric,
    value: e.value,
  }))

  const statusBreakdown = (() => {
    const allRecords = demoSessions.flatMap((s) => s.records)
    const present = allRecords.filter((r) => r.status === "present").length
    const late = allRecords.filter((r) => r.status === "late").length
    const absent = allRecords.filter((r) => r.status === "absent").length
    return [
      { name: "Present", value: present },
      { name: "Late", value: late },
      { name: "Absent", value: absent },
    ]
  })()

  // AI insights
  const aiInsights = [
    {
      icon: Brain,
      title: "Dropout Risk Alert",
      description: "2 students show declining attendance patterns over the last 2 weeks. Early intervention recommended.",
      severity: "high" as const,
    },
    {
      icon: TrendingUp,
      title: "Engagement Improving",
      description: "CS301 class shows 12% improvement in quiz participation this week.",
      severity: "positive" as const,
    },
    {
      icon: AlertTriangle,
      title: "Proxy Attempt Detected",
      description: "1 suspicious scan pattern detected yesterday. Location mismatch flagged.",
      severity: "medium" as const,
    },
    {
      icon: Target,
      title: "Attendance Prediction",
      description: "Based on current trends, Friday attendance expected to be ~78%. Consider engagement activity.",
      severity: "info" as const,
    },
  ]

  return (
    <AppShell user={user} currentPath="/teacher/analytics">
      <div className="space-y-6 p-4 lg:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Analytics & Insights
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-powered analytics and predictive insights for your classes
          </p>
        </div>

        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="ai">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Average Attendance"
                value={analytics.averageAttendance}
                suffix="%"
                icon={BarChart3}
                trend={{ value: 2.4, label: "vs last week" }}
              />
              <StatCard
                label="Total Sessions"
                value={analytics.totalClasses}
                icon={Users}
                iconColor="text-chart-2"
              />
              <StatCard
                label="Defaulters"
                value={analytics.defaulterCount}
                icon={AlertTriangle}
                iconColor="text-destructive"
                trend={{ value: -1, label: "vs last week" }}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Trend chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Attendance Trend (14 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="analyticGrad" x1="0" y1="0" x2="0" y2="1">
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
                        fill="url(#analyticGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusBreakdown.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
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
                  <div className="flex gap-4">
                    {statusBreakdown.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-1.5 text-xs">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[i] }}
                        />
                        {item.name}: {item.value}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Class-wise bars */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Class-wise Attendance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={analytics.classWiseAttendance.map((c) => ({
                      name:
                        c.className.length > 20
                          ? c.className.slice(0, 20) + "..."
                          : c.className,
                      attendance: c.percentage,
                    }))}
                  >
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
                    <Bar dataKey="attendance" fill="oklch(0.55 0.2 160)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Engagement radar */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Engagement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={engagementRadar}>
                      <PolarGrid stroke="oklch(0.3 0 0 / 0.2)" />
                      <PolarAngleAxis
                        dataKey="metric"
                        tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }}
                      />
                      <PolarRadiusAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 10 }}
                        stroke="oklch(0.3 0 0 / 0.15)"
                      />
                      <Radar
                        name="Engagement"
                        dataKey="value"
                        stroke="oklch(0.55 0.2 160)"
                        fill="oklch(0.55 0.2 160)"
                        fillOpacity={0.2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Student engagement table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Student Engagement Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {demoEngagement.slice(0, 6).map((eng) => {
                      const student = demoStudents.find(
                        (s) => s.id === eng.studentId
                      )
                      return (
                        <div
                          key={eng.studentId}
                          className="flex items-center gap-3 rounded-lg border border-border p-2.5"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {student?.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {student?.name}
                            </p>
                          </div>
                          <Badge
                            variant={
                              eng.overallScore >= 70
                                ? "default"
                                : eng.overallScore >= 50
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {eng.overallScore}%
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {eng.trend === "up"
                              ? "Improving"
                              : eng.trend === "down"
                                ? "Declining"
                                : "Stable"}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {aiInsights.map((insight, i) => (
                <Card
                  key={i}
                  className={
                    insight.severity === "high"
                      ? "border-destructive/30 bg-destructive/5"
                      : insight.severity === "positive"
                        ? "border-success/30 bg-success/5"
                        : insight.severity === "medium"
                          ? "border-warning/30 bg-warning/5"
                          : ""
                  }
                >
                  <CardContent className="flex gap-4 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <insight.icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {insight.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
