"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import { demoEngagement } from "@/lib/demo-data"
import type { User } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  MessageSquare,
  FileCheck,
  HelpCircle,
  TrendingUp,
  Target,
  Award,
} from "lucide-react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts"

export default function StudentEngagementPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role !== "student") {
      router.push("/")
      return
    }
    setUser(currentUser)
  }, [router])

  if (!mounted || !user) return null

  const engagement = demoEngagement.find((e) => e.studentId === user.id)
  if (!engagement) return null

  const radarData = [
    { metric: "Quizzes", value: engagement.quizParticipation },
    { metric: "Polls", value: engagement.pollResponses },
    { metric: "Assignments", value: engagement.assignmentSubmissions },
    { metric: "Questions", value: engagement.questionsAsked * 5 },
  ]

  const weeklyTrend = engagement.weeklyScores.map((score, i) => ({
    week: `Week ${i + 1}`,
    score,
  }))

  const metrics = [
    {
      label: "Quiz Participation",
      value: engagement.quizParticipation,
      icon: BarChart3,
      color: "text-primary",
    },
    {
      label: "Poll Responses",
      value: engagement.pollResponses,
      icon: MessageSquare,
      color: "text-chart-2",
    },
    {
      label: "Assignments",
      value: engagement.assignmentSubmissions,
      icon: FileCheck,
      color: "text-accent",
    },
    {
      label: "Questions Asked",
      value: engagement.questionsAsked,
      icon: HelpCircle,
      color: "text-chart-4",
      max: 20,
    },
  ]

  return (
    <AppShell user={user} currentPath="/student/engagement">
      <div className="space-y-6 p-4 lg:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Engagement
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your classroom participation and engagement metrics
          </p>
        </div>

        {/* Overall score card */}
        <Card className="bg-gradient-to-r from-primary/10 via-transparent to-accent/10 border-primary/20">
          <CardContent className="flex flex-col items-center p-6 sm:flex-row sm:gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/30 bg-card">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">
                  {engagement.overallScore}
                </p>
                <p className="text-[10px] text-muted-foreground">out of 100</p>
              </div>
            </div>
            <div className="mt-4 text-center sm:mt-0 sm:text-left">
              <h2 className="text-xl font-bold text-foreground">
                Overall Engagement Score
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your engagement is{" "}
                {engagement.trend === "up"
                  ? "improving"
                  : engagement.trend === "down"
                    ? "declining"
                    : "stable"}{" "}
                compared to last week
              </p>
              <div className="mt-3 flex items-center justify-center gap-3 sm:justify-start">
                <Badge
                  variant={
                    engagement.overallScore >= 70
                      ? "default"
                      : engagement.overallScore >= 50
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {engagement.overallScore >= 70
                    ? "Excellent"
                    : engagement.overallScore >= 50
                      ? "Good"
                      : "Needs Improvement"}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  {engagement.trend === "up"
                    ? "+5% this week"
                    : engagement.trend === "down"
                      ? "-3% this week"
                      : "No change"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <Card key={m.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                  <p className="text-xs font-medium text-muted-foreground">
                    {m.label}
                  </p>
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {m.value}
                  {!m.max && <span className="text-sm text-muted-foreground">%</span>}
                </p>
                <Progress value={m.max ? (m.value / m.max) * 100 : m.value} className="mt-2 h-1.5" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Radar chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Engagement Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="oklch(0.3 0 0 / 0.2)" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fontSize: 12, fill: "oklch(0.6 0 0)" }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10 }}
                    stroke="oklch(0.3 0 0 / 0.15)"
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="oklch(0.55 0.2 160)"
                    fill="oklch(0.55 0.2 160)"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Weekly Engagement Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={weeklyTrend}>
                  <defs>
                    <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="score"
                    stroke="oklch(0.55 0.2 160)"
                    strokeWidth={2}
                    fill="url(#engGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-4 w-4 text-accent" />
              Tips to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  title: "Participate in Quizzes",
                  desc: "Complete at least 3 quizzes per week to boost your score",
                  icon: Target,
                },
                {
                  title: "Ask More Questions",
                  desc: "Active questioning shows engagement and helps learning",
                  icon: HelpCircle,
                },
                {
                  title: "Submit Assignments Early",
                  desc: "Early submissions get bonus engagement points",
                  icon: FileCheck,
                },
                {
                  title: "Respond to Polls",
                  desc: "Quick poll responses show active classroom participation",
                  icon: MessageSquare,
                },
              ].map((tip) => (
                <div
                  key={tip.title}
                  className="flex gap-3 rounded-lg border border-border p-3"
                >
                  <tip.icon className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {tip.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tip.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
