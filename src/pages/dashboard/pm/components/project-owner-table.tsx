"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Project, ProjectStatus } from "@/types/project.type"

type Props = {
  projects: Project[]
  loading?: boolean
  error?: string | null
}

type ColumnKey = "startDate" | "endDate" | "status" | "progress"

const statusMeta: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  IN_PROGRESS: {
    label: "In Progress",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-50",
  },
  NOT_STARTED: {
    label: "Not Started",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-50",
  },
  DONE: {
    label: "Done",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-50",
  },
  ON_HOLD: {
    label: "On Hold",
    className:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-100",
  },
}

export function ProjectOwnerTable({ projects, loading, error }: Props) {
  const [query, setQuery] = React.useState("")
  const [columns, setColumns] = React.useState<Record<ColumnKey, boolean>>({
    startDate: true,
    endDate: true,
    status: true,
    progress: true,
  })

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return projects
    return projects.filter((p) => {
      const name = p.name.toLowerCase()
      const owner = p.owner?.name?.toLowerCase?.() ?? ""
      return name.includes(q) || owner.includes(q)
    })
  }, [projects, query])

  const rows = React.useMemo(
    () =>
      filtered.map((p) => ({
        id: p.id,
        name: p.name,
        owner: p.owner?.name || "-",
        startDate: p.startDate,
        endDate: p.endDate,
        status: p.status,
        completion: clampCompletion(p.completion),
      })),
    [filtered],
  )

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 pb-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Recent Projects</CardTitle>
        </div>
        <div className="flex justify-between w-full">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-96"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" >
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {(
                [
                  ["startDate", "Start Date"],
                  ["endDate", "Deadline"],
                  ["status", "Status"],
                  ["progress", "Progress"],
                ] as [ColumnKey, string][]
              ).map(([key, label]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={columns[key]}
                  onCheckedChange={(val) =>
                    setColumns((prev) => ({ ...prev, [key]: Boolean(val) }))
                  }
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-4 sm:px-5 space-y-3">
        {loading ? (
  <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project Name</TableHead>
          <TableHead>Client Name</TableHead>
          {columns.startDate && <TableHead>Start Date</TableHead>}
          {columns.endDate && <TableHead>Deadline</TableHead>}
          {columns.status && <TableHead>Status</TableHead>}
          {columns.progress && <TableHead>Progress</TableHead>}
        </TableRow>
      </TableHeader>

      <TableBody>
        {Array.from({
          length: projects.length || 5,
        }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <div className="h-4 w-40 rounded bg-accent animate-pulse" />
            </TableCell>

            <TableCell>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-accent animate-pulse" />
                <div className="space-y-1">
                  <div className="h-3 w-24 rounded bg-accent animate-pulse" />
                  <div className="h-2 w-16 rounded bg-accent animate-pulse" />
                </div>
              </div>
            </TableCell>

            {columns.startDate && (
              <TableCell>
                <div className="h-3 w-20 rounded bg-accent animate-pulse" />
              </TableCell>
            )}

            {columns.endDate && (
              <TableCell>
                <div className="h-3 w-20 rounded bg-accent animate-pulse" />
              </TableCell>
            )}

            {columns.status && (
              <TableCell>
                <div className="h-5 w-20 rounded-full bg-accent animate-pulse" />
              </TableCell>
            )}

            {columns.progress && (
              <TableCell>
                <div className="h-2 w-full rounded bg-accent animate-pulse" />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
) : error ? (
          <div className="text-sm text-destructive px-2 py-4">{error}</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-muted-foreground px-2 py-4">
            Belum ada data proyek.
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 dark:bg-background/40 shadow-sm">
              <Table className="border-separate border-spacing-0 text-sm">
                <TableHeader className="bg-muted/40 dark:bg-muted/20">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[32%]">Project Name</TableHead>
                    <TableHead>Client Name</TableHead>
                    {columns.startDate && <TableHead>Start Date</TableHead>}
                    {columns.endDate && <TableHead>Deadline</TableHead>}
                    {columns.status && <TableHead>Status</TableHead>}
                    {columns.progress && <TableHead>Progress</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="transition-colors hover:bg-primary/5 dark:hover:bg-primary/10"
                    >
                      <TableCell className="font-medium">
                        <span className="truncate">{row.name}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-9 border border-border/50">
                            <AvatarFallback
                              className={cn(
                                "text-xs font-semibold",
                                pickAvatarColor(row.owner),
                              )}
                            >
                              {initials(row.owner)}
                            </AvatarFallback>
                          </Avatar>
                            <div className="truncate leading-tight">
                              <div className="text-sm font-semibold">
                                {row.owner}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Project Owner
                              </div>
                            </div>
                        </div>
                      </TableCell>
                      {columns.startDate && (
                        <TableCell className="text-muted-foreground">
                          {formatDate(row.startDate)}
                        </TableCell>
                      )}
                      {columns.endDate && (
                        <TableCell className="text-muted-foreground">
                          {formatDate(row.endDate)}
                        </TableCell>
                      )}
                      {columns.status && (
                        <TableCell>
                          <StatusBadge status={row.status} />
                        </TableCell>
                      )}
                      {columns.progress && (
                        <TableCell className="min-w-[160px]">
                          <ProgressPill value={row.completion} />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="text-muted-foreground mt-1 text-xs sm:text-sm px-2">
              {rows.length} row(s) ditampilkan.
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function initials(name: string) {
  if (!name) return "?"
  const parts = name.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0]
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : ""
  return `${first ?? ""}${last ?? ""}`.toUpperCase() || "?"
}

function formatDate(value?: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function clampCompletion(value: number) {
  if (Number.isNaN(Number(value))) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const meta =
    statusMeta[status] ||
    ({
      label: status || "Unknown",
      className:
        "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-100",
    } as const)

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        meta.className,
      )}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-80" />
      {meta.label}
    </Badge>
  )
}

function ProgressPill({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted/70">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-foreground tabular-nums">
        {value}%
      </span>
    </div>
  )
}

const avatarPalette = [
  "bg-sky-500/15 text-sky-600 dark:text-sky-200",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-200",
  "bg-amber-500/15 text-amber-700 dark:text-amber-200",
  "bg-rose-500/15 text-rose-600 dark:text-rose-200",
  "bg-indigo-500/15 text-indigo-600 dark:text-indigo-200",
]

function pickAvatarColor(seed: string) {
  const idx = Math.abs(hashString(seed)) % avatarPalette.length
  return avatarPalette[idx]
}

function hashString(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}
