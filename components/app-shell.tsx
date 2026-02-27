"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/types"
import { logout } from "@/lib/auth-store"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  QrCode,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Wifi,
  WifiOff,
  Shield,
  GraduationCap,
  BookOpen,
  Building,
  UserCheck,
  ChevronRight,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
  badge?: string
}

const navByRole: Record<string, NavItem[]> = {
  teacher: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/teacher" },
    { label: "Timetable", icon: Calendar, href: "/teacher/timetable" },
    { label: "Take Attendance", icon: QrCode, href: "/teacher/attendance" },
    { label: "Subjects", icon: BookOpen, href: "/teacher/subjects" },
    { label: "My Classes", icon: BookOpen, href: "/teacher/classes" },
    { label: "Analytics", icon: BarChart3, href: "/teacher/analytics" },
    { label: "Students", icon: Users, href: "/teacher/students" },
  ],
  student: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/student" },
    { label: "Mark Attendance", icon: QrCode, href: "/student/scan" },
    { label: "My Attendance", icon: UserCheck, href: "/student/attendance" },
    { label: "Engagement", icon: BarChart3, href: "/student/engagement" },
  ],
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { label: "Subjects", icon: BookOpen, href: "/admin/subjects" },
    { label: "Classrooms", icon: Building, href: "/admin/classrooms" },
    { label: "Holidays", icon: Calendar, href: "/admin/holidays" },
    { label: "Teachers", icon: GraduationCap, href: "/admin/teachers" },
    { label: "Students", icon: Users, href: "/admin/students" },
    { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
    { label: "Security", icon: Shield, href: "/admin/security" },
    { label: "Settings", icon: Settings, href: "/admin/settings" },
  ],
}

export function AppShell({
  user,
  children,
  currentPath,
}: {
  user: User
  children: React.ReactNode
  currentPath: string
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isOnline] = useState(true)
  const router = useRouter()
  const navItems = navByRole[user.role] || []

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <QrCode className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">SmartAttend</h1>
            <p className="text-xs text-muted-foreground capitalize">{user.role} Portal</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive = currentPath === item.href
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href)
                  setSidebarOpen(false)
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {item.badge}
                  </Badge>
                )}
                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </button>
            )
          })}
        </nav>

        {/* Sync status */}
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center gap-2 text-xs">
            {isOnline ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-success" />
                <span className="text-muted-foreground">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-warning" />
                <span className="text-muted-foreground">Offline Mode</span>
              </>
            )}
            <Badge variant="outline" className="ml-auto text-xs">
              Demo
            </Badge>
          </div>
        </div>

        {/* User info */}
        <div className="border-t border-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-secondary transition-colors">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 border-b border-border bg-card px-4 py-3 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>

          <div className="flex-1" />

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            <span className="sr-only">Notifications</span>
          </Button>

          <div className="hidden items-center gap-2 lg:flex">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">{user.name}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
