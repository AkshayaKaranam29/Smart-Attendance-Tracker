"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import type { User } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Settings,
  Shield,
  Bell,
  Clock,
  MapPin,
  Wifi,
  Smartphone,
  Database,
  Palette,
  Globe,
  Save,
} from "lucide-react"

export default function AdminSettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  // Settings state
  const [qrInterval, setQrInterval] = useState("10")
  const [geoRadius, setGeoRadius] = useState("5")
  const [minAttendance, setMinAttendance] = useState("75")
  const [geoEnabled, setGeoEnabled] = useState(true)
  const [wifiEnabled, setWifiEnabled] = useState(true)
  const [deviceBinding, setDeviceBinding] = useState(true)
  const [aiDetection, setAiDetection] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)
  const [offlineMode, setOfflineMode] = useState(true)
  const [autoSync, setAutoSync] = useState(true)

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

  const handleSave = () => {
    toast.success("Settings saved successfully")
  }

  return (
    <AppShell user={user} currentPath="/admin/settings">
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure attendance system parameters and security policies
            </p>
          </div>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* QR Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-primary" />
                QR Code Settings
              </CardTitle>
              <CardDescription>Configure dynamic QR code behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qrInterval">QR Rotation Interval (seconds)</Label>
                <Input
                  id="qrInterval"
                  type="number"
                  value={qrInterval}
                  onChange={(e) => setQrInterval(e.target.value)}
                  min={5}
                  max={60}
                />
                <p className="text-xs text-muted-foreground">
                  How often the QR code refreshes. Shorter intervals increase security.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minAttendance">Minimum Attendance Threshold (%)</Label>
                <Input
                  id="minAttendance"
                  type="number"
                  value={minAttendance}
                  onChange={(e) => setMinAttendance(e.target.value)}
                  min={50}
                  max={100}
                />
                <p className="text-xs text-muted-foreground">
                  Students below this threshold are flagged as defaulters.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" />
                Security & Verification
              </CardTitle>
              <CardDescription>Configure anti-proxy protection layers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label>GPS Geo-Fencing</Label>
                    <p className="text-xs text-muted-foreground">Verify student location</p>
                  </div>
                </div>
                <Switch checked={geoEnabled} onCheckedChange={setGeoEnabled} />
              </div>
              {geoEnabled && (
                <div className="ml-7 space-y-2">
                  <Label htmlFor="geoRadius">Classroom Radius (meters)</Label>
                  <Input
                    id="geoRadius"
                    type="number"
                    value={geoRadius}
                    onChange={(e) => setGeoRadius(e.target.value)}
                    min={1}
                    max={50}
                    className="max-w-32"
                  />
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label>WiFi SSID Check</Label>
                    <p className="text-xs text-muted-foreground">Match classroom WiFi</p>
                  </div>
                </div>
                <Switch checked={wifiEnabled} onCheckedChange={setWifiEnabled} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label>Device Binding</Label>
                    <p className="text-xs text-muted-foreground">Bind to SIM + IMEI</p>
                  </div>
                </div>
                <Switch checked={deviceBinding} onCheckedChange={setDeviceBinding} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label>AI Fraud Detection</Label>
                    <p className="text-xs text-muted-foreground">Real-time scoring engine</p>
                  </div>
                </div>
                <Switch checked={aiDetection} onCheckedChange={setAiDetection} />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>Configure alert preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Alerts</Label>
                  <p className="text-xs text-muted-foreground">Fraud alerts, weekly reports</p>
                </div>
                <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Alerts</Label>
                  <p className="text-xs text-muted-foreground">Critical security alerts</p>
                </div>
                <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
              </div>
            </CardContent>
          </Card>

          {/* Offline & Sync */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-primary" />
                Offline & Sync
              </CardTitle>
              <CardDescription>Configure offline-first behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Offline Mode</Label>
                  <p className="text-xs text-muted-foreground">Enable attendance capture without internet</p>
                </div>
                <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Sync</Label>
                  <p className="text-xs text-muted-foreground">Automatically sync when connected</p>
                </div>
                <Switch checked={autoSync} onCheckedChange={setAutoSync} />
              </div>

              <div className="rounded-lg border border-border bg-secondary/30 p-3">
                <p className="text-xs font-medium text-foreground">System Info</p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Version</span>
                    <span className="font-mono text-foreground">v2.1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database</span>
                    <Badge variant="outline" className="text-[10px]">Demo Mode</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Backup</span>
                    <span className="text-foreground">Today, 3:00 AM</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
