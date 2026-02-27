"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import { getStudentAttendance, demoClasses, demoEngagement, demoSessions, demoSyncStatus } from "@/lib/demo-data"
import type { User } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  UserCheck,
  BarChart3,
  QrCode,
  AlertTriangle,
  Calendar,
  Clock,
  BookOpen,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Wifi,
  WifiOff,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts"

export default function StudentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [liveInfo, setLiveInfo] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role !== "student") {
      router.push("/")
      return
    }
    setUser(currentUser)

    // Fetch live class status
    fetch("/api/student/live-class")
      .then(res => res.json())
      .then(data => {
        if (data.live) setLiveInfo(data)
      })
      .catch(console.error)
  }, [router])

  if (!mounted || !user) return null

  const attendance = getStudentAttendance(user.id)
  const engagement = demoEngagement.find((e) => e.studentId === user.id)
  const myClasses = demoClasses.filter((c) => c.students.includes(user.id))
  const syncStatus = demoSyncStatus

  // Weekly trend
  const weeklyData = (engagement?.weeklyScores || []).map((score, i) => ({
    week: `W${i + 1}`,
    engagement: score,
    attendance: 65 + Math.random() * 30,
  }))

  // Recent records
  const recentRecords = attendance.records.slice(-10).reverse()

  const isDefaulter = attendance.percentage < 75

  return (
    <AppShell user={user} currentPath="/student">
      <div className="space-y-6 p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Hey, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-sm text-muted-foreground">
              {user.enrollmentNo} | {user.department}
            </p>
          </div>
          <Button onClick={() => router.push("/student/scan")} size="lg">
            <QrCode className="mr-2 h-5 w-5" />
            Scan QR Code
          </Button>
        </div>

        {/* Live Class Alert */}
        {liveInfo && (
          <Card className={`border-${liveInfo.sessionActive ? 'primary' : 'warning'}/50 bg-${liveInfo.sessionActive ? 'primary' : 'warning'}/10 shadow-sm animate-in fade-in slide-in-from-top-4`}>
            <CardContent className="flex items-center justify-between p-4 px-6">
              <div className="flex items-center gap-4">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background/50">
                  <div className={`absolute inset-0 rounded-full bg-${liveInfo.sessionActive ? 'primary' : 'warning'}/20 ${liveInfo.sessionActive ? 'animate-ping' : ''}`} />
                  <Clock className={`h-5 w-5 ${liveInfo.sessionActive ? 'text-primary' : 'text-warning'}`} />
                </div>
                <div>
                  <p className="font-bold text-foreground flex items-center gap-2">
                    {liveInfo.slot.subject.name}
                    {liveInfo.sessionActive && (
                      <Badge variant="default" className="text-[10px] h-4 py-0 px-1 animate-pulse">LIVE NOW</Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Room {liveInfo.slot.roomNo} | {liveInfo.slot.startTime} - {liveInfo.slot.endTime} | {liveInfo.slot.teacher.name}
                  </p>
                </div>
              </div>
              {liveInfo.sessionActive && (
                <Button onClick={() => router.push("/student/scan")} size="sm" className="hidden sm:flex">
                  Mark Attendance <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Defaulter warning */}
        {isDefaulter && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-center gap-4 p-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Low Attendance Warning
                </p>
                <p className="text-xs text-muted-foreground">
                  Your attendance is below 75%. Please attend classes regularly to avoid being marked as a defaulter.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stat cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Attendance"
            value={attendance.percentage}
            suffix="%"
            icon={UserCheck}
            iconColor={isDefaulter ? "text-destructive" : "text-primary"}
            trend={{ value: 1.5, label: "this week" }}
          />
          <StatCard
            label="Classes Attended"
            value={attendance.present}
            suffix={`/${attendance.total}`}
            icon={BookOpen}
            iconColor="text-chart-2"
          />
          <StatCard
            label="Engagement Score"
            value={engagement?.overallScore || 0}
            suffix="%"
            icon={BarChart3}
            iconColor="text-accent"
            trend={{
              value: engagement?.trend === "up" ? 5 : engagement?.trend === "down" ? -3 : 0,
              label: "trend",
            }}
          />
          <StatCard
            label="Late Arrivals"
            value={attendance.late}
            icon={Clock}
            iconColor="text-warning"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Weekly trend */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">
                Weekly Progress
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="mr-1 h-3 w-3" />
                8 Weeks
              </Badge>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.55 0.2 160)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.55 0.2 160)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0 / 0.15)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="oklch(0.5 0 0)" />
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
                    dataKey="engagement"
                    stroke="oklch(0.55 0.2 160)"
                    strokeWidth={2}
                    fill="url(#studentGrad)"
                    name="Engagement"
                  />
                  <Area
                    type="monotone"
                    dataKey="attendance"
                    stroke="oklch(0.6 0.15 250)"
                    strokeWidth={2}
                    fill="none"
                    strokeDasharray="5 5"
                    name="Attendance"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sync status & Today's classes */}
          <div className="space-y-4">
            {/* Sync */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {syncStatus.isSyncing ? (
                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                  ) : syncStatus.pendingRecords > 0 ? (
                    <WifiOff className="h-5 w-5 text-warning" />
                  ) : (
                    <Wifi className="h-5 w-5 text-success" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {syncStatus.isSyncing
                        ? "Syncing..."
                        : syncStatus.pendingRecords > 0
                          ? `${syncStatus.pendingRecords} pending records`
                          : "All synced"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {syncStatus.lastSyncTime
                        ? `Last sync: ${new Date(syncStatus.lastSyncTime).toLocaleTimeString()}`
                        : "Never synced"}
                    </p>
                  </div>
                  <Badge variant={syncStatus.pendingRecords > 0 ? "secondary" : "outline"} className="text-xs">
                    {syncStatus.pendingRecords > 0 ? "Pending" : "Synced"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Today's classes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Calendar className="h-4 w-4 text-primary" />
                  {"Today's Classes"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {myClasses.map((cls) => {
                  const todaySchedule = cls.schedule.find(
                    (s) =>
                      s.day ===
                      new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                      })
                  )
                  if (!todaySchedule) return null

                  return (
                    <div
                      key={cls.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {cls.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {todaySchedule.startTime} | {cls.roomNo}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent attendance records */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">
              Recent Attendance
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/student/attendance")}
            >
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentRecords.map((record) => {
                const session = demoSessions.find(
                  (s) => s.id === record.sessionId
                )
                const cls = demoClasses.find(
                  (c) => c.id === session?.classId
                )

                return (
                  <div
                    key={record.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    {record.status === "present" ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : record.status === "late" ? (
                      <Clock className="h-5 w-5 text-warning" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {cls?.name || "Unknown Class"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.timestamp).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        | {session?.startTime}
                      </p>
                    </div>
                    <Badge
                      variant={
                        record.status === "present"
                          ? "outline"
                          : record.status === "late"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-xs capitalize"
                    >
                      {record.status}
                    </Badge>
                    {!record.synced && (
                      <Badge variant="secondary" className="text-[10px]">
                        Pending
                      </Badge>
                    )}
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
