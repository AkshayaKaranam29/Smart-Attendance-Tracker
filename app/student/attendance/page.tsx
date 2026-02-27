"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import type { User } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  BookOpen,
} from "lucide-react"

type AnalyticsData = {
  records: any[],
  analytics: { subjectId: string, name: string, present: number, total: number, percentage: number }[],
  overallPercentage: number,
  totalClasses: number,
  totalPresent: number
}

export default function StudentAttendancePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role !== "student") {
      router.push("/")
      return
    }
    setUser(currentUser)

    fetch("/api/student/attendance")
      .then(res => res.json())
      .then(json => {
        if (!json.error) setData(json)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  if (!user) return null

  if (loading || !data) {
    return (
      <AppShell user={user} currentPath="/student/attendance">
        <div className="p-8 text-center text-muted-foreground">Loading attendance data...</div>
      </AppShell>
    )
  }

  // Group records by date for the generic timeline
  const byDate: Record<string, any[]> = {}
  data.records.forEach((record) => {
    const date = new Date(record.timestamp).toISOString().split("T")[0]
    if (!byDate[date]) byDate[date] = []
    byDate[date].push(record)
  })

  const sortedDates = Object.keys(byDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  const absentCount = data.totalClasses - data.totalPresent; // Assuming present=present/late.
  // We can refine this if we track 'late' separately encoded in totalClasses or something.

  return (
    <AppShell user={user} currentPath="/student/attendance">
      <div className="space-y-6 p-4 lg:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Attendance
          </h1>
          <p className="text-sm text-muted-foreground">
            View your complete attendance history by subject
          </p>
        </div>

        {/* Overall stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <p className="text-2xl font-bold text-foreground">
                {data.overallPercentage}%
              </p>
              <p className="text-xs text-muted-foreground">Overall</p>
              <Progress value={data.overallPercentage} className="mt-2 h-1.5 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <p className="text-2xl font-bold text-success">
                {data.totalPresent}
              </p>
              <p className="text-xs text-muted-foreground">Present/Late</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <p className="text-2xl font-bold text-destructive">
                {absentCount}
              </p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <p className="text-2xl font-bold text-primary">
                {data.totalClasses}
              </p>
              <p className="text-xs text-muted-foreground">Total Sessions</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="by-subject" className="space-y-4">
          <TabsList>
            <TabsTrigger value="by-subject">By Subject</TabsTrigger>
            <TabsTrigger value="by-date">By Date</TabsTrigger>
          </TabsList>

          <TabsContent value="by-subject" className="space-y-4">
            {data.analytics.map((sub) => (
              <Card key={sub.subjectId}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{sub.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {sub.subjectId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${sub.percentage < 75
                            ? "text-destructive"
                            : "text-foreground"
                          }`}
                      >
                        {sub.percentage}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sub.present}/{sub.total}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={sub.percentage} className="h-2" />
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {data.records.filter(r => r.subjectId === sub.subjectId).slice(0, 15).reverse().map((r) => (
                      <div
                        key={r.id}
                        className={`h-5 w-5 rounded-sm ${r.status === "present"
                            ? "bg-success/60"
                            : r.status === "late"
                              ? "bg-warning/60"
                              : "bg-destructive/40"
                          }`}
                        title={`${new Date(r.timestamp).toLocaleDateString()} - ${r.status}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            {data.analytics.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No attendance records found yet.
              </div>
            )}
          </TabsContent>

          <TabsContent value="by-date" className="space-y-3">
            {sortedDates.slice(0, 15).map((date) => {
              const records = byDate[date]

              return (
                <Card key={date}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {new Date(date).toLocaleDateString("en-IN", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {records.map((r) => {
                            return (
                              <div
                                key={r.id}
                                className="flex items-center gap-1.5 text-xs bg-secondary/30 px-2 py-1 rounded"
                              >
                                {r.status === "present" ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                ) : r.status === "late" ? (
                                  <Clock className="h-3.5 w-3.5 text-warning" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5 text-destructive" />
                                )}
                                <span className="text-muted-foreground">
                                  {r.subject.subjectId}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
