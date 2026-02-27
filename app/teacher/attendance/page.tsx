"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import { demoClasses, demoStudents } from "@/lib/demo-data"
import { generateQRPayload, encodeQRData, getTimeRemaining } from "@/lib/qr-utils"
import type { User, QRPayload, AttendanceRecord } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import QRCode from "react-qr-code"
import {
  QrCode,
  Play,
  Square,
  RefreshCw,
  MapPin,
  Wifi,
  Shield,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
} from "lucide-react"

export default function TeacherAttendancePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [selectedClass, setSelectedClass] = useState("")
  const [sessionActive, setSessionActive] = useState(false)
  const [currentQR, setCurrentQR] = useState<QRPayload | null>(null)
  const [timeLeft, setTimeLeft] = useState(10)
  const [qrRotations, setQrRotations] = useState(0)
  const [geoFencing, setGeoFencing] = useState(true)
  const [wifiCheck, setWifiCheck] = useState(true)
  const [liveRecords, setLiveRecords] = useState<AttendanceRecord[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setMounted(true)
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role !== "teacher") {
      router.push("/")
      return
    }
    setUser(currentUser)
  }, [router])

  // The old drawQR function has been removed because we are using react-qr-code

  // Rotate QR every 10 seconds
  const startSession = async () => {
    if (!selectedClass) {
      toast.error("Please select a class first")
      return
    }
    setSessionActive(true)
    setLiveRecords([])
    setQrRotations(0)

    // Create new live session ID once and trigger initial QR rotation
    let currentSessionId = `session-live-${Date.now()}`

    const rotate = () => {
      const payload = generateQRPayload(currentSessionId, selectedClass)
      setCurrentQR(payload)
      setTimeLeft(10)
      setQrRotations((prev) => prev + 1)
    }

    rotate()

    // Rotate QR every 10 seconds locally based on the same sessionId
    intervalRef.current = setInterval(() => {
      rotate()
    }, 10000)

    toast.success("Attendance session started!")
  }

  const stopSession = () => {
    setSessionActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    toast.success(`Session ended. ${liveRecords.length} students marked present.`)
  }

  // Poll for live attendance updates and update timer
  useEffect(() => {
    if (!sessionActive || !currentQR?.sessionId) return

    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 10
        return prev - 1
      })
    }, 1000)

    // Poll live records every 3 seconds
    const pollInterval = setInterval(() => {
      fetch(`/api/attendance/live?sessionId=${currentQR.sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.records) {
            setLiveRecords(data.records)
          }
        })
        .catch(console.error)
    }, 3000)

    return () => {
      clearInterval(timer)
      clearInterval(pollInterval)
    }
  }, [sessionActive, currentQR?.sessionId])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (!mounted || !user) return null

  let myClasses = demoClasses.filter((c) => c.teacherId === user.id)
  if (myClasses.length === 0) {
    // Fallback for demo purposes if the user has no assigned classes
    myClasses = demoClasses
  }
  const selectedClassData = demoClasses.find((c) => c.id === selectedClass)
  const totalStudents = selectedClassData?.students.length || 0
  const presentCount = liveRecords.length
  const flaggedCount = liveRecords.filter((r) => r.flagged).length

  return (
    <AppShell user={user} currentPath="/teacher/attendance">
      <div className="space-y-6 p-4 lg:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Take Attendance
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate dynamic QR codes for secure attendance tracking
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* QR Code Panel */}
          <div className="space-y-4">
            {/* Class selector */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Select Class</Label>
                    <Select
                      value={selectedClass}
                      onValueChange={setSelectedClass}
                      disabled={sessionActive}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Choose a class..." />
                      </SelectTrigger>
                      <SelectContent>
                        {myClasses.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.code} - {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Verification toggles */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="geo"
                        checked={geoFencing}
                        onCheckedChange={setGeoFencing}
                        disabled={sessionActive}
                      />
                      <Label htmlFor="geo" className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3.5 w-3.5" /> Geo-fence
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="wifi"
                        checked={wifiCheck}
                        onCheckedChange={setWifiCheck}
                        disabled={sessionActive}
                      />
                      <Label htmlFor="wifi" className="flex items-center gap-1 text-sm">
                        <Wifi className="h-3.5 w-3.5" /> WiFi Check
                      </Label>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={sessionActive ? stopSession : startSession}
                    variant={sessionActive ? "destructive" : "default"}
                  >
                    {sessionActive ? (
                      <>
                        <Square className="mr-2 h-5 w-5" /> Stop Session
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" /> Start Session
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* QR Display */}
            <Card className="overflow-hidden">
              <CardContent className="flex flex-col items-center p-6">
                {sessionActive && currentQR ? (
                  <>
                    <div className="relative rounded-xl border-4 border-primary/20 bg-white p-4">
                      <QRCode
                        value={encodeQRData(currentQR)}
                        size={240}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                      />
                      {/* Timer overlay */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                        <Badge
                          variant="default"
                          className="px-3 py-1 text-sm font-bold shadow-lg"
                        >
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          {timeLeft}s
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-primary" />
                        Rotation #{qrRotations}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        10s refresh
                      </span>
                    </div>

                    <Progress
                      value={(timeLeft / 10) * 100}
                      className="mt-3 h-1.5 w-full"
                    />
                  </>
                ) : (
                  <div className="flex flex-col items-center py-12 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary">
                      <QrCode className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-muted-foreground">
                      Select a class and start the session to generate QR codes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Live attendance feed */}
          <div className="space-y-4">
            {/* Session stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="flex flex-col items-center p-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <p className="mt-1 text-xl font-bold text-foreground">
                    {totalStudents}
                  </p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center p-3">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <p className="mt-1 text-xl font-bold text-foreground">
                    {presentCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center p-3">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <p className="mt-1 text-xl font-bold text-foreground">
                    {flaggedCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Flagged</p>
                </CardContent>
              </Card>
            </div>

            {/* Live feed */}
            <Card className="max-h-[500px] overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  {sessionActive && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                    </span>
                  )}
                  Live Attendance Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                {liveRecords.length > 0 ? (
                  <div className="space-y-2">
                    {[...liveRecords].reverse().map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center gap-3 rounded-lg border border-border p-2.5 animate-in slide-in-from-top-2"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {record.studentName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {record.studentName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {record.verificationMethod.map((m) => (
                              <Badge key={m} variant="outline" className="text-[10px] px-1.5 py-0">
                                {m.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {record.flagged ? (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-12 text-center">
                    <Users className="h-10 w-10 text-muted-foreground/40" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {sessionActive
                        ? "Waiting for students to scan..."
                        : "Start a session to see live attendance"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Export */}
            {liveRecords.length > 0 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const csv = [
                    "Name,Status,Time,Verification,Fraud Score",
                    ...liveRecords.map(
                      (r) =>
                        `${r.studentName},${r.status},${new Date(r.timestamp).toLocaleTimeString()},${r.verificationMethod.join("+")},${Math.round(r.fraudScore)}`
                    ),
                  ].join("\n")
                  const blob = new Blob([csv], { type: "text/csv" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = `attendance-${new Date().toISOString().split("T")[0]}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success("CSV exported successfully")
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
