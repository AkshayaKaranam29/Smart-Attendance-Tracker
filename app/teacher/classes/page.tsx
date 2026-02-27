"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import { demoClasses, demoSessions, demoStudents } from "@/lib/demo-data"
import type { User } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Users, Clock, MapPin, Wifi } from "lucide-react"

export default function TeacherClassesPage() {
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

  const myClasses = demoClasses.filter((c) => c.teacherId === user.id)

  return (
    <AppShell user={user} currentPath="/teacher/classes">
      <div className="space-y-6 p-4 lg:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Classes
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your classes and view student enrollment
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {myClasses.map((cls) => {
            const classRecords = demoSessions
              .filter((s) => s.classId === cls.id)
              .flatMap((s) => s.records)
            const present = classRecords.filter(
              (r) => r.status === "present" || r.status === "late"
            )
            const pct =
              classRecords.length > 0
                ? Math.round((present.length / classRecords.length) * 100)
                : 0

            return (
              <Card
                key={cls.id}
                className="group cursor-pointer transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2 text-xs">
                        {cls.code}
                      </Badge>
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {cls.students.length} Students
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {cls.roomNo}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {cls.schedule.length}x / week
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Wifi className="h-4 w-4" />
                      {cls.wifiSSID}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="flex flex-wrap gap-1.5">
                    {cls.schedule.map((s) => (
                      <Badge key={s.day} variant="secondary" className="text-xs">
                        {s.day.slice(0, 3)} {s.startTime}
                      </Badge>
                    ))}
                  </div>

                  {/* Attendance progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Avg. Attendance
                      </span>
                      <span className="font-semibold text-foreground">
                        {pct}%
                      </span>
                    </div>
                    <Progress value={pct} className="mt-1.5 h-2" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
