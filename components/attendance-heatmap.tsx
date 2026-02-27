"use client"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface HeatmapData {
  date: string
  value: number // 0-100 percentage
}

export function AttendanceHeatmap({ data }: { data: HeatmapData[] }) {
  const getColor = (value: number) => {
    if (value === 0) return "bg-secondary"
    if (value < 50) return "bg-destructive/40"
    if (value < 75) return "bg-warning/50"
    if (value < 90) return "bg-primary/40"
    return "bg-primary/80"
  }

  // Group data into weeks
  const weeks: HeatmapData[][] = []
  let currentWeek: HeatmapData[] = []
  data.forEach((d, i) => {
    currentWeek.push(d)
    if (currentWeek.length === 7 || i === data.length - 1) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  return (
    <TooltipProvider>
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <Tooltip key={day.date}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "h-3 w-3 rounded-sm transition-colors sm:h-3.5 sm:w-3.5",
                      getColor(day.value)
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs font-medium">
                    {new Date(day.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {day.value}% attendance
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
    </TooltipProvider>
  )
}
