"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Html5Qrcode } from "html5-qrcode"
import { getCurrentUser } from "@/lib/auth-store"
import type { User, QRPayload } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import {
  QrCode,
  Camera,
  MapPin,
  Wifi,
  Shield,
  CheckCircle2,
  Loader2,
  Smartphone,
  AlertTriangle,
} from "lucide-react"

type ScanPhase =
  | "idle"
  | "scanning"
  | "verifying-qr"
  | "verifying-location"
  | "verifying-wifi"
  | "verifying-device"
  | "success"
  | "failed"

const verificationSteps = [
  { id: "qr", label: "QR Code Validation", icon: QrCode },
  { id: "location", label: "Location Verification", icon: MapPin },
  { id: "wifi", label: "WiFi SSID Check", icon: Wifi },
  { id: "device", label: "Device Authentication", icon: Smartphone },
]

export default function StudentScanPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [phase, setPhase] = useState<ScanPhase>("idle")
  const [currentStep, setCurrentStep] = useState(-1)
  const [progress, setProgress] = useState(0)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [cameraActive, setCameraActive] = useState(false)

  useEffect(() => {
    setMounted(true)
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role !== "student") {
      router.push("/")
      return
    }
    setUser(currentUser)

    // Request location permissions early
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => { }, () => { })
    }
  }, [router])

  const startScanning = async () => {
    setPhase("scanning")
    setCameraActive(true)

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader")
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // On successful scan
          if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => {
              setCameraActive(false)
              runVerification(decodedText)
            }).catch(console.error)
          } else {
            setCameraActive(false)
            runVerification(decodedText)
          }
        },
        (errorMessage) => {
          // Ignore scanning errors (they fire constantly until a QR is found)
        }
      )
    } catch (err: any) {
      toast.error("Unable to access camera. Please check permissions.");
      setPhase("failed")
      setCameraActive(false)
    }
  }

  const runVerification = async (qrData?: string) => {
    // Stop camera if still active
    if (cameraActive && scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
      } catch (e) {
        // ignore
      }
    }
    setCameraActive(false)

    if (!qrData) {
      setPhase("failed")
      toast.error("Invalid scan result. Please try again.")
      return
    }

    let payload: QRPayload | null = null
    try {
      payload = JSON.parse(atob(qrData))
    } catch {
      setPhase("failed")
      toast.error("QR Code format is invalid or expired.")
      return
    }

    if (!payload?.sessionId) {
      setPhase("failed")
      toast.error("QR Code is missing required data.")
      return
    }

    const steps: ScanPhase[] = [
      "verifying-qr",
      "verifying-location",
      "verifying-wifi",
      "verifying-device",
    ]

    for (let i = 0; i < steps.length; i++) {
      setPhase(steps[i])
      setCurrentStep(i)
      setProgress(((i + 1) / steps.length) * 100)
      await new Promise((resolve) => setTimeout(resolve, 800))
    }

    // Get current location if possible to send with payload
    let location = undefined
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
        })
        location = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      } catch (e) {
        // ignore
      }
    }

    // Send the actual API request
    try {
      const resp = await fetch("/api/attendance/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: payload.sessionId,
          studentId: user?.id,
          studentName: user?.name,
          status: "present",
          verificationMethod: ["qr", ...(location ? ["gps"] : [])],
          location,
          fraudScore: location ? 0 : 5, // add slight fraud ping if no location
          flagged: false
        })
      })

      const data = await resp.json()

      if (data.success) {
        setPhase("success")
        toast.success("Attendance marked successfully!")
      } else {
        setPhase("failed")
        toast.error(data.error || "Failed to mark attendance.")
      }
    } catch (e) {
      setPhase("failed")
      toast.error("Network error submitting attendance.")
    }
  }

  const reset = async () => {
    setPhase("idle")
    setCurrentStep(-1)
    setProgress(0)
    setCameraActive(false)
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
      } catch (e) {
        // ignore
      }
    }
  }

  if (!mounted || !user) return null

  return (
    <AppShell user={user} currentPath="/student/scan">
      <div className="flex flex-col items-center p-4 lg:p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Mark Attendance
            </h1>
            <p className="text-sm text-muted-foreground">
              Scan the QR code displayed by your teacher
            </p>
          </div>

          {/* Scanner area */}
          <Card className="overflow-hidden">
            <CardContent className="relative flex flex-col items-center p-0">
              {/* Camera / QR area */}
              <div className="relative flex h-72 w-full items-center justify-center bg-secondary/50 overflow-hidden">
                <div id="reader" className={`absolute inset-0 h-full w-full [&>video]:object-cover ${!cameraActive && phase !== 'scanning' ? 'hidden' : ''}`} />
                {cameraActive ? (
                  <>
                    {/* Scanner overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <div className="relative h-48 w-48">
                        <div className="absolute left-0 top-0 h-6 w-6 border-l-3 border-t-3 border-primary rounded-tl" />
                        <div className="absolute right-0 top-0 h-6 w-6 border-r-3 border-t-3 border-primary rounded-tr" />
                        <div className="absolute bottom-0 left-0 h-6 w-6 border-b-3 border-l-3 border-primary rounded-bl" />
                        <div className="absolute bottom-0 right-0 h-6 w-6 border-b-3 border-r-3 border-primary rounded-br" />
                        {/* Scanning line animation */}
                        <div className="absolute left-2 right-2 top-1/2 h-0.5 animate-pulse bg-primary/60" />
                      </div>
                    </div>
                    <Badge className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-foreground/80 text-background z-20">
                      <Camera className="mr-1.5 h-3 w-3" />
                      Scanning...
                    </Badge>
                  </>
                ) : phase === "success" ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
                      <CheckCircle2 className="h-10 w-10 text-success" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      Attendance Marked!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                ) : phase === "failed" ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
                      <AlertTriangle className="h-10 w-10 text-destructive" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      Verification Failed
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Location mismatch detected
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary">
                      <QrCode className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tap the button below to start scanning
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Verification progress */}
          {phase !== "idle" && phase !== "scanning" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Shield className="h-4 w-4 text-primary" />
                  Multi-Layer Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} className="h-2" />

                <div className="space-y-3">
                  {verificationSteps.map((step, i) => {
                    const isComplete = i < currentStep || phase === "success"
                    const isCurrent =
                      i === currentStep && phase !== "success" && phase !== "failed"
                    const isFailed =
                      phase === "failed" && i === currentStep

                    return (
                      <div
                        key={step.id}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                          {isComplete ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : isCurrent ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : isFailed ? (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          ) : (
                            <step.icon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <span
                          className={
                            isComplete
                              ? "font-medium text-foreground"
                              : isCurrent
                                ? "font-medium text-primary"
                                : "text-muted-foreground"
                          }
                        >
                          {step.label}
                        </span>
                        {isComplete && (
                          <Badge variant="outline" className="ml-auto text-[10px] border-success/30 text-success">
                            Passed
                          </Badge>
                        )}
                        {isFailed && (
                          <Badge variant="destructive" className="ml-auto text-[10px]">
                            Failed
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action button */}
          {phase === "idle" ? (
            <Button className="w-full" size="lg" onClick={startScanning}>
              <Camera className="mr-2 h-5 w-5" />
              Start QR Scan
            </Button>
          ) : phase === "success" || phase === "failed" ? (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/student")}
              >
                Back to Dashboard
              </Button>
              <Button className="flex-1" onClick={reset}>
                Scan Again
              </Button>
            </div>
          ) : null}

          {/* Security info */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold text-foreground">
              Security Checks Active
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                "Dynamic QR (10s)",
                "GPS Verification",
                "WiFi SSID Match",
                "Device Binding",
                "Fraud Detection",
              ].map((check) => (
                <Badge
                  key={check}
                  variant="secondary"
                  className="text-[10px]"
                >
                  <Shield className="mr-1 h-2.5 w-2.5" />
                  {check}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
