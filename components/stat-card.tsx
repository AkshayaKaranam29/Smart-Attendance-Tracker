"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  suffix?: string
  icon: React.ElementType
  trend?: { value: number; label: string }
  className?: string
  iconColor?: string
}

export function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  trend,
  className,
  iconColor = "text-primary",
}: StatCardProps) {
  const TrendIcon =
    trend && trend.value > 0
      ? TrendingUp
      : trend && trend.value < 0
        ? TrendingDown
        : Minus

  return (
    <Card className={cn("border border-border", className)}>
      <CardContent className="flex items-start gap-4 p-4 sm:p-5">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary")}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            {suffix && (
              <span className="text-sm font-medium text-muted-foreground">
                {suffix}
              </span>
            )}
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              <TrendIcon
                className={cn(
                  "h-3 w-3",
                  trend.value > 0
                    ? "text-success"
                    : trend.value < 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "font-medium",
                  trend.value > 0
                    ? "text-success"
                    : trend.value < 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                )}
              >
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
