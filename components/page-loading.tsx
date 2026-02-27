"use client"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export function PageLoading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/20 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
        <Icon className="h-7 w-7 text-muted-foreground/60" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-xl border border-border bg-card p-5", className)}>
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-secondary" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 rounded bg-secondary" />
          <div className="h-5 w-1/2 rounded bg-secondary" />
        </div>
      </div>
    </div>
  )
}
