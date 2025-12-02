"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

/* =============== TYPES =============== */

type Phase = {
  id: number
  name: string
  startDate: string | Date
  endDate: string | Date
}

type ProjectGanttChartDialogProps = {
  project: {
    id: number
    name: string
    phases?: Phase[]
  } | null
  onClose: () => void
}

/* =============== CONSTANTS & HELPERS =============== */

const DAY_WIDTH = 28 // px per hari
const LABEL_WIDTH = 260 // px kolom kiri
const DAY_MS = 86_400_000

function toDate(v: string | Date) {
  return v instanceof Date ? v : new Date(v)
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function diffDaysInclusive(a: Date, b: Date) {
  const start = startOfDay(a).getTime()
  const end = startOfDay(b).getTime()
  return Math.max(1, Math.floor((end - start) / DAY_MS) + 1)
}

function diffDays(a: Date, b: Date) {
  const start = startOfDay(a).getTime()
  const end = startOfDay(b).getTime()
  return Math.max(0, Math.floor((end - start) / DAY_MS))
}

function formatDate(d?: Date | string | null) {
  if (!d) return "-"
  const x = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(x.getTime())) return "-"
  return x.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

/* Segmen bulan untuk header besar per-bulan */
type MonthSegment = {
  label: string
  widthPx: number
}

/* Build list bulan dari min–max (versi aman) */
function buildMonthSegments(minDate: Date, maxDate: Date): MonthSegment[] {
  const segments: MonthSegment[] = []

  let year = minDate.getFullYear()
  let month = minDate.getMonth()
  const lastYear = maxDate.getFullYear()
  const lastMonth = maxDate.getMonth()

  while (year < lastYear || (year === lastYear && month <= lastMonth)) {
    const monthStart = new Date(year, month, 1)
    const nextMonthStart = new Date(year, month + 1, 1)
    const monthEnd = new Date(nextMonthStart.getTime() - 1)

    const segStart = monthStart < minDate ? minDate : monthStart
    const segEnd = monthEnd > maxDate ? maxDate : monthEnd

    const days = diffDaysInclusive(segStart, segEnd)
    const widthPx = days * DAY_WIDTH

    const label = monthStart.toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric",
    })

    segments.push({ label, widthPx })

    // next month
    month++
    if (month > 11) {
      month = 0
      year++
    }
  }

  return segments
}

/* =============== MAIN COMPONENT =============== */

export const ProjectGanttChartDialog: React.FC<ProjectGanttChartDialogProps> = ({
  project,
  onClose,
}) => {
  const open = !!project
  if (!project) return null

  const rawPhases = project.phases ?? []

  // Normalisasi phase (skip tanggal invalid)
  const phases = rawPhases
    .map((p) => {
      const start = toDate(p.startDate)
      const end = toDate(p.endDate)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return null
      }
      const s = startOfDay(start)
      const e = startOfDay(end < start ? start : end)
      return { ...p, start: s, end: e }
    })
    .filter(Boolean) as (Phase & { start: Date; end: Date })[]

  if (phases.length === 0) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Gantt Chart — {project.name}</DialogTitle>
            <DialogDescription>
              Project ini belum memiliki phase dengan tanggal yang valid.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  // Range global dari semua phase
  const minDate = phases.reduce(
    (acc, p) => (p.start < acc ? p.start : acc),
    phases[0].start,
  )
  const maxDate = phases.reduce(
    (acc, p) => (p.end > acc ? p.end : acc),
    phases[0].end,
  )

  const totalDays = diffDaysInclusive(minDate, maxDate)
  const totalWidth = totalDays * DAY_WIDTH

  // Semua hari
  const days: Date[] = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(minDate)
    d.setDate(d.getDate() + i)
    return d
  })

  // Segmen bulan untuk header
  const monthSegments = buildMonthSegments(minDate, maxDate)

  // Today line
  const today = startOfDay(new Date())
  const showToday = today >= minDate && today <= maxDate
  const todayIndex = showToday ? diffDays(minDate, today) : -1
  const todayLeft = showToday ? todayIndex * DAY_WIDTH : 0
  const headerWidth = LABEL_WIDTH + totalWidth


  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Gantt Chart — {project.name}</DialogTitle>
          <DialogDescription className="text-xs">
            {formatDate(minDate)} — {formatDate(maxDate)} · {phases.length} phase
            {phases.length > 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>


        <div className="mt-4 overflow-x-auto rounded-lg border bg-muted/40">
          <div className="min-w-[900px]">

            <div
              className="grid bg-primary text-xs text-primary-foreground"
              style={{
                gridTemplateColumns: `${LABEL_WIDTH}px ${totalWidth}px`,
                width: headerWidth,
              }}
            >
              <div className="border-r px-3 py-2 font-medium">Phase</div>

              <div
                className="flex flex-row"
                style={{ width: totalWidth }}
              >
                {monthSegments.length === 0 ? (
                  <div className="flex w-full items-center justify-center px-2">
                    {formatDate(minDate)} — {formatDate(maxDate)}
                  </div>
                ) : (
                  monthSegments.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-center border-r border-primary-foreground/40 px-2 py-2"
                      style={{ width: m.widthPx }}
                    >
                      {m.label}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* HEADER HARI */}
            <div
              className="grid border-b bg-background text-[10px] text-muted-foreground"
              style={{
                gridTemplateColumns: `${LABEL_WIDTH}px ${totalWidth}px`,
              }}
            >
              <div className="border-r px-3 py-1" />
              <div className="relative flex" style={{ width: totalWidth }}>
                {days.map((d, i) => {
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-center border-r py-1 ${
                        isWeekend ? "bg-muted/60" : ""
                      }`}
                      style={{ width: DAY_WIDTH }}
                    >
                      {d.getDate()}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ROW PHASES */}
            <div>
              {phases.map((p, rowIndex) => {
                const startOffset = diffDays(minDate, p.start)
                const spanDays = diffDaysInclusive(p.start, p.end)
                const left = startOffset * DAY_WIDTH
                const width = spanDays * DAY_WIDTH
                const isOddRow = rowIndex % 2 === 1

                return (
                  <div
                    key={p.id}
                    className="grid text-sm"
                    style={{
                      gridTemplateColumns: `${LABEL_WIDTH}px ${totalWidth}px`,
                    }}
                  >
                    {/* label kiri */}
                    <div
                      className={`border-r px-3 py-2 ${
                        isOddRow ? "bg-background/60" : "bg-background/30"
                      }`}
                    >
                      <div className="line-clamp-1 font-medium">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatDate(p.start)} — {formatDate(p.end)}
                      </div>
                    </div>

                    {/* timeline kanan */}
                    <div
                      className={`relative h-10 ${
                        isOddRow ? "bg-background/40" : "bg-background/20"
                      }`}
                    >
                      {/* grid vertikal */}
                      <div className="absolute inset-0 flex">
                        {days.map((d, i) => {
                          const isWeekend =
                            d.getDay() === 0 || d.getDay() === 6
                          return (
                            <div
                              key={i}
                              className={`border-r ${
                                isWeekend ? "bg-muted/60" : ""
                              }`}
                              style={{ width: DAY_WIDTH }}
                            />
                          )
                        })}
                      </div>

                      {/* garis today */}
                      {showToday && (
                        <div
                          className="absolute top-0 bottom-0 border-r-2 border-red-500/80"
                          style={{ left: todayLeft }}
                        />
                      )}

                      {/* bar phase */}
                      <div
                        className="absolute top-2 h-6 rounded bg-blue-500/80 shadow-sm ring-1 ring-blue-600/70"
                        style={{
                          left,
                          width: Math.max(width, DAY_WIDTH * 0.7),
                        }}
                        title={`${p.name}\n${formatDate(
                          p.start,
                        )} — ${formatDate(p.end)}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* LEGEND */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-6 rounded bg-blue-500/80 ring-1 ring-blue-600/70" />
            <span>Durasi phase</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-[2px] bg-red-500/80" />
            <span>Hari ini</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-6 bg-muted/60" />
            <span>Weekend</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
