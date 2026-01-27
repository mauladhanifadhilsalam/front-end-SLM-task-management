"use client"

import * as React from "react"
import {
  IconAlertTriangle,
  IconBell,
  IconFilter,
  IconFlame,
  IconSearch,
  IconTargetArrow,
  IconTicket,
} from "@tabler/icons-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { PmDeveloperHighlight } from "@/types/pm-overview.type"
import { useDeveloperHighlights } from "../hooks/use-developer-highlights"
import { Skeleton } from "@/components/ui/skeleton"

type SortKey = "workload" | "highPriority" | "overdue"
type FilterKey = "all" | "highPriority" | "overdue" | "dueSoon"

type Props = {
  data?: PmDeveloperHighlight[]
  loading?: boolean
  error?: string | null
}

export function DeveloperHighlightsContent({
  data,
  loading,
  error,
}: Props) {
  const [sortBy, setSortBy] = React.useState<SortKey>("workload")
  const [query, setQuery] = React.useState("")
  const [filterBy, setFilterBy] = React.useState<FilterKey>("all")

  const highlights = React.useMemo(() => {
    return [...(data || [])].sort((a, b) => b.workloadIndex - a.workloadIndex)
  }, [data])

  const filtered = React.useMemo(() => {
    const text = query.trim().toLowerCase()
    const base = highlights.filter((item) => {
      const matchesText =
        !text ||
        item.fullName.toLowerCase().includes(text) ||
        item.email.toLowerCase().includes(text)

      if (!matchesText) return false

      if (filterBy === "highPriority") {
        return (
          (item.openTasksHighPriority || 0) + (item.openIssuesHighPriority || 0) >
          0
        )
      }
      if (filterBy === "overdue") {
        return (item.overdueTasks || 0) > 0
      }
      if (filterBy === "dueSoon") {
        return (item.tasksDueNext7Days || 0) + (item.issuesDueNext7Days || 0) > 0
      }
      return true
    })

    const sortFn: Record<SortKey, (a: PmDeveloperHighlight, b: PmDeveloperHighlight) => number> = {
      workload: (a, b) => b.workloadIndex - a.workloadIndex,
      highPriority: (a, b) =>
        b.openIssuesHighPriority + b.openTasksHighPriority -
        (a.openIssuesHighPriority + a.openTasksHighPriority),
      overdue: (a, b) => b.overdueTasks - a.overdueTasks,
    }

    return [...base].sort(sortFn[sortBy])
  }, [highlights, query, sortBy, filterBy])

  const summary = React.useMemo(() => {
    return highlights.reduce(
      (acc, dev) => {
        acc.highPriority += dev.openTasksHighPriority + dev.openIssuesHighPriority
        acc.overdueTasks += dev.overdueTasks
        acc.totalDueSoon += dev.tasksDueNext7Days + dev.issuesDueNext7Days
        return acc
      },
      { highPriority: 0, overdueTasks: 0, totalDueSoon: 0 },
    )
  }, [highlights])

  const maxWorkload = Math.max(...highlights.map((h) => h.workloadIndex), 1)

  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-col gap-3 px-3 pb-3 sm:px-6 sm:pb-4">

        <div className="mt-5 flex flex-col gap-2 rounded-xl border bg-card/60 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center gap-2 sm:flex-1 sm:max-w-md">
            <IconSearch className="h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama atau email..."
              className="h-9 text-sm"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => setQuery("")}
              >
                Clear
              </Button>
            )}
          </div>
          <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <IconFilter className="h-4 w-4" />
              <span>Urutkan</span>
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
              <SelectTrigger className="h-9 w-full sm:w-48">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workload">Workload tertinggi</SelectItem>
                <SelectItem value="highPriority">High priority terbanyak</SelectItem>
                <SelectItem value="overdue">Overdue terbanyak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-5 sm:px-5">
        {loading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="h-48 animate-pulse rounded-xl border bg-muted/40"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex h-32 items-center justify-center text-sm text-destructive">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Tidak ada developer yang cocok dengan pencarian.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((developer) => (
              <DeveloperCard
                key={developer.userId}
                developer={developer}
                maxWorkload={maxWorkload}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function DeveloperHighlights() {
  const { data, loading, error } = useDeveloperHighlights()
  return (
    <DeveloperHighlightsContent
      data={data}
      loading={loading}
      error={error}
    />
  )
}

function DeveloperCard({
  developer,
  maxWorkload,
}: {
  developer: PmDeveloperHighlight
  maxWorkload: number
}) {
  const highPriority =
    developer.openTasksHighPriority + developer.openIssuesHighPriority
  const dueSoon = developer.tasksDueNext7Days + developer.issuesDueNext7Days
  const completionPct = Math.max(
    0,
    Math.min(Math.round(developer.taskCompletionPercentage || 0), 100),
  )

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border bg-card/60 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <Avatar className="h-11 w-11">
            <AvatarFallback className="text-xs font-semibold uppercase">
              {initials(developer.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-0.5">
            <div className="break-words text-sm font-semibold text-foreground">
              {developer.fullName}
            </div>
            <div className="max-w-[180px] truncate text-xs text-muted-foreground sm:max-w-none">
              {developer.email}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="secondary" className="bg-primary/10 text-foreground">
            WL {developer.workloadIndex}
          </Badge>
          {developer.overdueTasks > 0 && (
            <Badge variant="destructive" className="text-[11px]">
              <IconAlertTriangle className="h-3.5 w-3.5" />
              {developer.overdueTasks} overdue
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 text-[11px]">
        <Badge variant={highPriority > 0 ? "warning" : "outline"}>
          {highPriority} high priority
        </Badge>
        <Badge variant="outline">
          Projects {developer.projectsInProgress}/{developer.totalAssignedProjects}
        </Badge>
        {developer.primaryProjectId && (
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Primary #{developer.primaryProjectId}
          </Badge>
        )}
        <Badge variant="outline">
          Due 7d {dueSoon}
        </Badge>
      </div>

      <div className="space-y-2 text-xs">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Workload index</span>
            <span className="font-semibold text-foreground">{developer.workloadIndex}</span>
          </div>
          <ProgressBar value={developer.workloadIndex} max={maxWorkload} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Completion</span>
            <span className="font-semibold text-foreground">{completionPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <StatPill
            label="Tasks in progress"
            value={`${developer.tasksInProgress}/${developer.totalAssignedTasks || 0}`}
            hint={`${developer.overdueTasks} overdue / ${developer.completedTasksLast7Days} done/7d`}
          />
          <StatPill
            label="Issues in progress"
            value={`${developer.issuesInProgress}/${developer.totalAssignedIssues || 0}`}
            hint={`${developer.criticalIssues} critical / ${developer.completedIssuesLast7Days} done/7d`}
          />
          <StatPill
            label="High priority"
            value={highPriority}
            hint={`${developer.openTasksHighPriority} task / ${developer.openIssuesHighPriority} issue`}
          />
          <StatPill
            label="Due next 7d"
            value={dueSoon}
            hint={`${developer.tasksDueNext7Days} task / ${developer.issuesDueNext7Days} issue`}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
          <IconTicket size={14} />
          <span>Tickets by project</span>
        </div>
        {developer.ticketsByProject.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Tidak ada ticket aktif.
          </div>
        ) : (
          <div className="space-y-1.5">
            {developer.ticketsByProject.map((project) => (
              <div
                key={`${developer.userId}-${project.projectId}`}
                className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <IconTargetArrow size={14} className="text-muted-foreground" />
                  <span className="font-medium text-foreground">Project #{project.projectId}</span>
                </div>
                <span className="font-semibold tabular-nums text-foreground">
                  {project.openTickets}/{project.totalTickets} open
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
        <Badge variant="outline" className="bg-card/80 text-foreground">
          +{developer.newTicketsAssignedLast7Days} tickets / 7d
        </Badge>
        <Badge variant="outline" className="bg-card/80 text-foreground">
          {developer.commentsWrittenLast7Days} comments / 7d
        </Badge>
        <Badge variant={developer.unreadNotificationsCount > 0 ? "secondary" : "outline"}>
          <IconBell size={14} />
          {developer.unreadNotificationsCount > 0
            ? `${developer.unreadNotificationsCount} unread`
            : "Inbox clear"}
        </Badge>
      </div>
    </div>
  )
}

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-full border px-2.5 py-1 bg-card/60 text-[11px] leading-tight">
      {label}
    </span>
  )
}

function StatPill({
  label,
  value,
  hint,
}: {
  label: string
  value: number | string
  hint?: string
}) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  )
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(Math.round((value / Math.max(max, 1)) * 100), 100)
  return (
    <div className="h-2 w-full rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}
