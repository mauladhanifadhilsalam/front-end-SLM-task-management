import { useMemo } from "react";
import { formatStatus } from "@/utils/format.utils";
import { Ticket, TicketStatus } from "@/types/project-tasks.types";
import { cn } from "@/lib/utils";

type TaskGanttViewProps = {
  tickets: Ticket[];
  className?: string;
};

type NormalizedTask = Ticket & { start: Date; end: Date };

const DAY_MS = 86_400_000;
const DAY_WIDTH = 26;
const TASK_WIDTH = 250;
const OWNER_WIDTH = 150;
const DATE_WIDTH = 100;
const DURATION_WIDTH = 70;
const STATUS_WIDTH = 100;

// Total fixed columns width
const FIXED_COLS_WIDTH = TASK_WIDTH + OWNER_WIDTH + DATE_WIDTH + DATE_WIDTH + DURATION_WIDTH + STATUS_WIDTH;

const STATUS_COLORS: Record<TicketStatus, string> = {
  NEW: "bg-slate-300/80 text-slate-900 ring-slate-500/50",
  TO_DO: "bg-slate-300/80 text-slate-900 ring-slate-500/50",
  IN_PROGRESS: "bg-blue-500/80 text-blue-50 ring-blue-600/60",
  IN_REVIEW: "bg-indigo-500/80 text-indigo-50 ring-indigo-600/60",
  DONE: "bg-emerald-500/80 text-emerald-50 ring-emerald-600/60",
  RESOLVED: "bg-teal-500/80 text-teal-50 ring-teal-600/60",
  CLOSED: "bg-neutral-400/80 text-neutral-900 ring-neutral-500/60",
};

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

function formatDateShort(value?: Date | string | null) {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
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

function durationDaysInclusive(start: Date, end: Date) {
  return diffDaysInclusive(start, end);
}

export const TaskGanttView = ({ tickets, className }: TaskGanttViewProps) => {
  const tasks: NormalizedTask[] = useMemo(() => {
    return tickets
      .map((task) => {
        const parsedStart = toDate(task.startDate ?? null);
        const parsedEnd = toDate(task.dueDate ?? null);

        if (!parsedStart && !parsedEnd) return null;

        const start = parsedStart ?? parsedEnd!;
        const endCandidate = parsedEnd ?? parsedStart!;
        const end = endCandidate < start ? start : endCandidate;

        return { ...task, start, end };
      })
      .filter(Boolean) as NormalizedTask[];
  }, [tickets]);

  if (tasks.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground",
          className
        )}
      >
        Tambahkan tanggal mulai atau due date pada task untuk melihat Gantt chart.
      </div>
    );
  }

  const sortedTasks = [...tasks].sort((a, b) => a.start.getTime() - b.start.getTime());

  const minDate = sortedTasks.reduce((acc, task) => (task.start < acc ? task.start : acc), sortedTasks[0].start);
  const maxDate = sortedTasks.reduce((acc, task) => (task.end > acc ? task.end : acc), sortedTasks[0].end);

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

  const gridCols = `${TASK_WIDTH}px ${OWNER_WIDTH}px ${DATE_WIDTH}px ${DATE_WIDTH}px ${DURATION_WIDTH}px ${STATUS_WIDTH}px ${totalWidth}px`;

  const minTableWidth = FIXED_COLS_WIDTH + totalWidth;

  return (
    <div className={cn("flex h-full flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Gantt Chart</p>
          <p className="text-sm font-semibold text-foreground">Timeline tugas</p>
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDate(minDate)} - {formatDate(maxDate)} | {tasks.length} task
          {tasks.length > 1 ? "s" : ""} | {totalDays} hari
        </div>
      </div>

      <div className="relative h-full overflow-hidden rounded-xl border bg-muted/40">
        <div className="absolute inset-0 overflow-auto">
          <div
            className="relative"
            style={{ minWidth: minTableWidth }}>
          {showToday && (
              <>
                <div
                  className="pointer-events-none absolute top-2 -translate-x-1/2"
                  style={{ left: FIXED_COLS_WIDTH + todayLeft }}
                >
                  <span className="inline-flex items-center rounded-full bg-purple-600 px-2 py-[2px] text-[10px] font-semibold text-white shadow-sm">
                    Hari ini
                  </span>
                </div>
                <div
                  className="pointer-events-none absolute inset-y-0 border-l-2 border-purple-500/80"
                  style={{ left: FIXED_COLS_WIDTH + todayLeft }}
                />
              </>
            )}

            {/* Header Row */}
            <div
              className="grid bg-muted text-xs font-semibold text-foreground"
              style={{ gridTemplateColumns: gridCols }}
            >
              <div className="border-r px-3 py-2 text-muted-foreground">Task</div>
              <div className="border-r px-3 py-2 text-muted-foreground">Task Owner</div>
              <div className="border-r px-3 py-2 text-muted-foreground">Start Date</div>
              <div className="border-r px-3 py-2 text-muted-foreground">End Date</div>
              <div className="border-r px-3 py-2 text-muted-foreground">Duration</div>
              <div className="border-r px-3 py-2 text-muted-foreground">Status</div>
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

            {/* Day Numbers Row */}
            <div
              className="grid border-b text-[10px] text-muted-foreground"
              style={{ gridTemplateColumns: gridCols }}
            >
              <div className="border-r bg-card px-3 py-1" />
              <div className="border-r bg-card px-3 py-1" />
              <div className="border-r bg-card px-3 py-1" />
              <div className="border-r bg-card px-3 py-1" />
              <div className="border-r bg-card px-3 py-1" />
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

            {/* Task Rows */}
            <div>
              {sortedTasks.map((task, rowIndex) => {
                const startOffset = diffDays(minDate, task.start);
                const spanDays = diffDaysInclusive(task.start, task.end);
                const left = startOffset * DAY_WIDTH;
                const width = spanDays * DAY_WIDTH;
                const isOddRow = rowIndex % 2 === 1;
                const barTone = STATUS_COLORS[task.status] ?? STATUS_COLORS.TO_DO;
                const rowBg = isOddRow ? "bg-card" : "bg-background";

                return (
                  <div
                    key={task.id}
                    className="grid"
                    style={{ gridTemplateColumns: gridCols }}
                  >
                    {/* Task Title */}
                    <div className={`border-r px-3 py-3 ${rowBg}`}>
                      <p className="line-clamp-2 text-sm font-semibold text-foreground">
                        {task.title}
                      </p>
                    </div>

                    {/* Task Owner */}
                    <div className={`border-r px-3 py-3 ${rowBg}`}>
                      <p className="line-clamp-2 text-sm text-foreground">
                        {task.requester?.fullName || "Unassigned"}
                      </p>
                    </div>

                    {/* Start Date */}
                    <div className={`border-r px-3 py-3 ${rowBg}`}>
                      <p className="text-xs text-muted-foreground">
                        {formatDateShort(task.start)}
                      </p>
                    </div>

                    {/* End Date */}
                    <div className={`border-r px-3 py-3 ${rowBg}`}>
                      <p className="text-xs text-muted-foreground">
                        {formatDateShort(task.end)}
                      </p>
                    </div>

                    {/* Duration */}
                    <div className={`border-r px-3 py-3 ${rowBg}`}>
                      <p className="text-xs text-muted-foreground">
                        {durationDaysInclusive(task.start, task.end)} hari
                      </p>
                    </div>

                    {/* Status */}
                    <div className={`border-r px-3 py-3 ${rowBg}`}>
                      <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {formatStatus(task.status)}
                      </span>
                    </div>

                    {/* Gantt Bar */}
                    <div className={`relative h-12 ${rowBg}`}>
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
                        className={`absolute top-2 h-6 rounded-md shadow-sm ring-1 ${barTone}`}
                        style={{
                          left,
                          width: Math.max(width, DAY_WIDTH * 0.7),
                        }}
                        title={`${task.title}\n${formatDate(task.start)} - ${formatDate(task.end)} | ${durationDaysInclusive(task.start, task.end)} hari`}
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