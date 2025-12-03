import { useMemo } from "react";
import type { Phase } from "@/types/project-phases.type";
import { cn } from "@/lib/utils";

type PhaseGanttViewProps = {
  phases: Phase[];
  className?: string;
};

type NormalizedPhase = Phase & { start: Date; end: Date };

const DAY_MS = 86_400_000;
const DAY_WIDTH = 26;
const LABEL_WIDTH = 240;

function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : startOfDay(d);
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function diffDaysInclusive(a: Date, b: Date) {
  const start = startOfDay(a).getTime();
  const end = startOfDay(b).getTime();
  return Math.max(1, Math.floor((end - start) / DAY_MS) + 1);
}

function diffDays(a: Date, b: Date) {
  const start = startOfDay(a).getTime();
  const end = startOfDay(b).getTime();
  return Math.max(0, Math.floor((end - start) / DAY_MS));
}

function formatDate(value?: Date | string | null) {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type MonthSegment = { label: string; widthPx: number };

function buildMonthSegments(minDate: Date, maxDate: Date): MonthSegment[] {
  const segments: MonthSegment[] = [];

  let year = minDate.getFullYear();
  let month = minDate.getMonth();
  const lastYear = maxDate.getFullYear();
  const lastMonth = maxDate.getMonth();

  while (year < lastYear || (year === lastYear && month <= lastMonth)) {
    const monthStart = new Date(year, month, 1);
    const nextMonthStart = new Date(year, month + 1, 1);
    const monthEnd = new Date(nextMonthStart.getTime() - 1);

    const segStart = monthStart < minDate ? minDate : monthStart;
    const segEnd = monthEnd > maxDate ? maxDate : monthEnd;

    const days = diffDaysInclusive(segStart, segEnd);
    const widthPx = days * DAY_WIDTH;

    const label = monthStart.toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric",
    });

    segments.push({ label, widthPx });

    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return segments;
}

export const PhaseGanttView = ({ phases, className }: PhaseGanttViewProps) => {
  const rows: NormalizedPhase[] = useMemo(() => {
    return phases
      .map((p) => {
        const start = toDate(p.startDate);
        const endCandidate = toDate(p.endDate);
        if (!start || !endCandidate) return null;

        const end = endCandidate < start ? start : endCandidate;
        return { ...p, start, end };
      })
      .filter(Boolean) as NormalizedPhase[];
  }, [phases]);

  if (rows.length === 0) {
    return (
      <div className={cn("rounded-xl border border-dashed border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground", className)}>
        Tambahkan phase dengan tanggal mulai dan selesai untuk melihat Gantt chart.
      </div>
    );
  }

  const sorted = [...rows].sort((a, b) => a.start.getTime() - b.start.getTime());
  const minDate = sorted.reduce((acc, p) => (p.start < acc ? p.start : acc), sorted[0].start);
  const maxDate = sorted.reduce((acc, p) => (p.end > acc ? p.end : acc), sorted[0].end);
  const totalDays = diffDaysInclusive(minDate, maxDate);
  const totalWidth = totalDays * DAY_WIDTH;

  const days: Date[] = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(minDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  const monthSegments = buildMonthSegments(minDate, maxDate);

  const today = startOfDay(new Date());
  const showToday = today >= minDate && today <= maxDate;
  const todayIndex = showToday ? diffDays(minDate, today) : -1;
  const todayLeft = showToday ? todayIndex * DAY_WIDTH : 0;

  return (
    <div className={cn("flex h-full flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Gantt Chart</p>
          <p className="text-sm font-semibold text-foreground">Timeline phases</p>
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDate(minDate)} - {formatDate(maxDate)} | {rows.length} phase
          {rows.length > 1 ? "s" : ""}
        </div>
      </div>

      <div className="relative h-full overflow-hidden rounded-xl border bg-muted/40">
        <div className="absolute inset-0 overflow-auto">
          <div className="relative min-w-[900px]">
            {showToday && (
              <>
                <div
                  className="pointer-events-none absolute top-2 -translate-x-1/2"
                  style={{ left: LABEL_WIDTH + todayLeft }}
                >
                  <span className="inline-flex items-center rounded-full bg-purple-600 px-2 py-[2px] text-[10px] font-semibold text-white shadow-sm">
                    Hari ini
                  </span>
                </div>
                <div
                  className="pointer-events-none absolute inset-y-0 border-l-2 border-purple-500/80"
                  style={{ left: LABEL_WIDTH + todayLeft }}
                />
              </>
            )}

            <div
              className="grid bg-muted text-xs font-semibold text-foreground"
              style={{
                gridTemplateColumns: `${LABEL_WIDTH}px ${totalWidth}px`,
              }}
            >
              <div className="border-r px-3 py-2 text-muted-foreground">Phase</div>
              <div className="flex" style={{ width: totalWidth }}>
                {monthSegments.map((month, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-center border-r border-border/70 px-2 py-2"
                    style={{ width: month.widthPx }}
                  >
                    {month.label}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="grid border-b text-[10px] text-muted-foreground"
              style={{
                gridTemplateColumns: `${LABEL_WIDTH}px ${totalWidth}px`,
              }}
            >
              <div className="border-r bg-card px-3 py-1" />
              <div className="relative flex" style={{ width: totalWidth }}>
                {days.map((d, i) => {
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-center border-r ${isWeekend ? "bg-muted/60" : "bg-card"}`}
                      style={{ width: DAY_WIDTH }}
                    >
                      {d.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              {sorted.map((phase, rowIndex) => {
                const startOffset = diffDays(minDate, phase.start);
                const spanDays = diffDaysInclusive(phase.start, phase.end);
                const left = startOffset * DAY_WIDTH;
                const width = spanDays * DAY_WIDTH;
                const isOddRow = rowIndex % 2 === 1;

                return (
                  <div
                    key={phase.id}
                    className="grid"
                    style={{
                      gridTemplateColumns: `${LABEL_WIDTH}px ${totalWidth}px`,
                    }}
                  >
                    <div
                      className={`border-r px-3 py-3 ${isOddRow ? "bg-card" : "bg-background"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <p className="line-clamp-1 text-sm font-semibold text-foreground">
                            {phase.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatDate(phase.start)} - {formatDate(phase.end)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={`relative h-12 ${isOddRow ? "bg-card" : "bg-background"}`}>
                      <div className="absolute inset-0 flex">
                        {days.map((d, i) => {
                          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                          return (
                            <div
                              key={i}
                              className={`border-r ${isWeekend ? "bg-muted/60" : "bg-transparent"}`}
                              style={{ width: DAY_WIDTH }}
                            />
                          );
                        })}
                      </div>

                      <div
                        className="absolute top-2 h-6 rounded-md bg-primary/80 shadow-sm ring-1 ring-primary/70"
                        style={{
                          left,
                          width: Math.max(width, DAY_WIDTH * 0.7),
                        }}
                        title={`${phase.name}\n${formatDate(phase.start)} - ${formatDate(phase.end)}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
