"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import { QrCode, MapPin, Wifi, Fingerprint, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const features = [
  { icon: QrCode, label: "Dynamic QR Codes", desc: "Rotating every 10 seconds" },
  { icon: MapPin, label: "Geo-Fencing", desc: "5m classroom radius" },
  { icon: Wifi, label: "WiFi Validation", desc: "SSID verification" },
  { icon: Fingerprint, label: "Device Binding", desc: "SIM + device lock" },
  { icon: Smartphone, label: "Offline-First", desc: "Works without internet" },
]

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("student")

  useEffect(() => {
    setMounted(true)
    const user = getCurrentUser()
    if (user) {
      router.push(`/${user.role}`)
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Store in session storage to sync the UI context instantly
      sessionStorage.setItem("sat-auth-user", JSON.stringify(data.user))
      toast.success("Login successful")

      // Force a hard navigation so the new HTTP-only cookie is sent 
      // with the initial document request, bypassing Next.js client caching
      window.location.href = `/${data.user.role}`
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-dvh bg-background flex flex-col md:flex-row">
      {/* Left Marketing Section */}
      <div className="relative overflow-hidden md:flex flex-col justify-center w-full md:w-1/2 p-12 bg-primary/5 hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />
        <div className="relative max-w-lg mx-auto">
          {/* Logo */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
              <QrCode className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                SmartAttend
              </h1>
              <p className="text-xs font-medium text-muted-foreground">
                Attendance & Engagement Tracker
              </p>
            </div>
          </div>

          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            Smart Attendance for Modern Colleges
          </h2>
          <p className="text-pretty text-lg text-muted-foreground mb-10">
            AI-powered attendance tracking with anti-proxy protection, offline support, and real-time engagement analytics.
          </p>

          <div className="space-y-4">
            {features.map((f) => (
              <div key={f.label} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background shadow-sm border border-border">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{f.label}</h4>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="flex flex-1 items-center justify-center p-6 w-full md:w-1/2">
        <div className="w-full max-w-sm space-y-8">

          <div className="md:hidden flex flex-col items-center text-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25 mb-4">
              <QrCode className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">SmartAttend</h1>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">Please sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="name@college.edu"
                value={email}
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button variant="link" className="p-0 h-auto text-xs text-muted-foreground" type="button">
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Login As</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => router.push("/register")}>
              Sign up
            </Button>
          </p>

        </div>
      </div>
    </div>
  )
}
