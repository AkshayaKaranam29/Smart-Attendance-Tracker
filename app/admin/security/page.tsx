"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import { demoSessions, demoClasses, demoStudents } from "@/lib/demo-data"
import type { User, AttendanceRecord } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Lock,
  Fingerprint,
  MapPin,
  Wifi,
  XCircle,
  TrendingDown,
  Users,
} from "lucide-react"

export default function AdminSecurityPage() {
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

  const allRecords = demoSessions.flatMap((s) => s.records)
  const flaggedRecords = allRecords.filter((r) => r.flagged)
  const highRisk = flaggedRecords.filter((r) => r.fraudScore > 12)
  const resolvedCount = Math.floor(flaggedRecords.length * 0.4)

  // Security metrics
  const gpsViolations = flaggedRecords.filter((r) =>
    r.flagReason?.toLowerCase().includes("location")
  ).length
  const wifiMismatches = Math.floor(flaggedRecords.length * 0.3)
  const suspiciousScans = flaggedRecords.filter((r) =>
    r.flagReason?.toLowerCase().includes("scan") || r.flagReason?.toLowerCase().includes("pattern")
  ).length

  // Group flagged by student
  const flaggedByStudent = new Map<string, AttendanceRecord[]>()
  flaggedRecords.forEach((r) => {
    const existing = flaggedByStudent.get(r.studentId) || []
    existing.push(r)
    flaggedByStudent.set(r.studentId, existing)
  })
  const repeatOffenders = Array.from(flaggedByStudent.entries())
    .filter(([, records]) => records.length > 1)
    .sort((a, b) => b[1].length - a[1].length)

  return (
    <AppShell user={user} currentPath="/admin/security">
      <div className="space-y-6 p-4 lg:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Security Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Anti-proxy protection and fraud detection overview
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Flags"
            value={flaggedRecords.length}
            icon={AlertTriangle}
            iconColor="text-destructive"
            trend={{ value: -8, label: "vs last week" }}
          />
          <StatCard
            label="High Risk"
            value={highRisk.length}
            icon={Shield}
            iconColor="text-warning"
          />
          <StatCard
            label="Resolved"
            value={resolvedCount}
            icon={CheckCircle2}
            iconColor="text-success"
          />
          <StatCard
            label="Repeat Offenders"
            value={repeatOffenders.length}
            icon={Users}
            iconColor="text-chart-2"
          />
        </div>

        {/* Threat breakdown */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <MapPin className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{gpsViolations}</p>
                <p className="text-xs text-muted-foreground">GPS Violations</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <Wifi className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{wifiMismatches}</p>
                <p className="text-xs text-muted-foreground">WiFi Mismatches</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-2/10">
                <Fingerprint className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{suspiciousScans}</p>
                <p className="text-xs text-muted-foreground">Suspicious Scans</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Protection features */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Lock className="h-4 w-4 text-primary" />
              Active Protection Layers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Dynamic QR Rotation", desc: "Every 10 seconds", active: true, icon: Shield },
                { label: "GPS Geo-Fencing", desc: "5m classroom radius", active: true, icon: MapPin },
                { label: "WiFi SSID Verification", desc: "Classroom network match", active: true, icon: Wifi },
                { label: "Device Binding", desc: "SIM + IMEI lock", active: true, icon: Fingerprint },
                { label: "AI Fraud Detection", desc: "Real-time scoring", active: true, icon: Eye },
                { label: "Behavioral Analysis", desc: "Pattern matching", active: false, icon: TrendingDown },
              ].map((feature) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                    <feature.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{feature.label}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                  <Badge
                    variant={feature.active ? "outline" : "secondary"}
                    className={`text-[10px] ${feature.active ? "border-success/30 text-success" : ""}`}
                  >
                    {feature.active ? "Active" : "Planned"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Flagged records table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">
              Recent Flagged Records
            </CardTitle>
            <Badge variant="destructive" className="text-xs">
              {flaggedRecords.length} total flags
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden sm:table-cell">Class</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="hidden md:table-cell">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flaggedRecords.slice(0, 10).map((record) => {
                    const session = demoSessions.find((s) => s.id === record.sessionId)
                    const cls = demoClasses.find((c) => c.id === session?.classId)
                    const isResolved = Math.random() > 0.6

                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-xs font-semibold text-destructive">
                              {record.studentName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <span className="text-sm font-medium text-foreground">{record.studentName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm text-muted-foreground">{cls?.code || "N/A"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{record.flagReason || "Anomaly detected"}</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={record.fraudScore > 12 ? "destructive" : "secondary"}
                            className="text-xs font-mono"
                          >
                            {Math.round(record.fraudScore)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {isResolved ? (
                            <Badge variant="outline" className="text-xs border-success/30 text-success">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Resolved
                            </Badge>
                          ) : (
                            <Button variant="ghost" size="sm" className="text-xs">
                              <Eye className="mr-1 h-3 w-3" />
                              Review
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
