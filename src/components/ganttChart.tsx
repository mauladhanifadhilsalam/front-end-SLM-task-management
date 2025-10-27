import * as React from "react";

type Phase = {
  id: number;
  name: string;
  startDate: string; // ISO
  endDate: string; // ISO
  // optional: progress/state kalau nanti mau warna beda-beda
};

type Owner = {
  id: number;
  name: string;
  company: string;
  email: string;
};

export type ProjectForGantt = {
  id: number;
  name: string;
  startDate: string; // ISO
  endDate: string; // ISO
  status: string;
  owner?: Owner;
  phases?: Phase[];
};

/* ---------- Date utils ---------- */
function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function daysBetween(a: Date, b: Date) {
  return Math.max(1, Math.ceil((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000));
}
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

const fmtFull = (d: Date) =>
  d.toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
const fmtDay = (d: Date) => d.toLocaleDateString("id-ID", { day: "2-digit" });

function buildDays(min: Date, totalDays: number) {
  return Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(min);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function groupByMonth(days: Date[]) {
  const res: { label: string; span: number }[] = [];
  let cur = "",
    span = 0;
  for (const d of days) {
    const lab = d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
    if (lab !== cur) {
      if (span) res.push({ label: cur, span });
      cur = lab;
      span = 1;
    } else {
      span++;
    }
  }
  if (span) res.push({ label: cur, span });
  return res;
}

function barPos(min: Date, totalDays: number, startISO: string, endISO: string) {
  const s = startOfDay(new Date(startISO));
  const e = endOfDay(new Date(endISO));
  const offset = clamp(daysBetween(min, s) - 1, 0, totalDays);
  const length = clamp(daysBetween(s, e), 1, totalDays - offset);
  return { leftPct: (offset / totalDays) * 100, widthPct: (length / totalDays) * 100 };
}

/* ---------- Dummy default project ---------- */
const DUMMY_PROJECT: ProjectForGantt = {
  id: 2,
  name: "Project Kintsugi — Sensor Grid & Ops Intelligence",
  startDate: "2024-11-11T00:00:00.000Z",
  endDate: "2025-04-25T00:00:00.000Z",
  status: "IN_PROGRESS",
  owner: { id: 1, name: "Winston Scott", company: "The Continental Group", email: "scott@gmail.com" },
  phases: [
    {
      id: 5,
      name: "Signal Capture",
      startDate: "2024-11-11T00:00:00.000Z",
      endDate: "2024-12-20T00:00:00.000Z",
    },
    {
      id: 6,
      name: "Data Processing",
      startDate: "2025-01-05T00:00:00.000Z",
      endDate: "2025-03-10T00:00:00.000Z",
    },
  ],
};

/* ---------- Component ---------- */
/**
 * GanttChart
 * - Jika prop `project` tidak diberikan, akan memakai dummy data (DUMMY_PROJECT).
 */
export function GanttChart({ project }: { project?: ProjectForGantt }) {
  const proj = React.useMemo(() => project ?? DUMMY_PROJECT, [project]);

  const min = startOfDay(new Date(proj.startDate));
  const max = endOfDay(new Date(proj.endDate));
  const totalDays = daysBetween(min, max);
  const days = React.useMemo(() => buildDays(min, totalDays), [min.getTime(), totalDays]);
  const months = React.useMemo(() => groupByMonth(days), [days]);

  const today = startOfDay(new Date());
  const showToday = today >= min && today <= max;
  const todayOffset = clamp(daysBetween(min, today) - 1, 0, totalDays);
  const todayPct = (todayOffset / totalDays) * 100;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{proj.name}</h2>
          <p className="text-xs text-muted-foreground">
            {fmtFull(new Date(proj.startDate))} — {fmtFull(new Date(proj.endDate))} • Status: {proj.status}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex h-3 w-3 rounded-sm bg-blue-500/70 ring-1 ring-blue-600/60" /> Phase
          <span className="inline-flex h-3 w-3 rounded-sm bg-red-500/80 ring-1 ring-red-600/70" /> Today
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <div className="min-w-[900px]">
          {/* Month row */}
          <div
            className="grid bg-primary text-primary-foreground text-xs"
            style={{
              gridTemplateColumns: `200px repeat(${totalDays}, minmax(28px, 1fr))`,
            }}
          >
            <div className="px-3 py-2 font-medium">Phase</div>
            {months.map((m, i) => (
              <div key={i} className="col-span-1" style={{ gridColumn: `span ${m.span} / span ${m.span}` }}>
                <div className="flex items-center justify-center border-l border-primary-foreground/30 px-2 py-2">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Day row */}
          <div
            className="grid border-b text-[10px] text-muted-foreground"
            style={{
              gridTemplateColumns: `200px repeat(${totalDays}, minmax(28px, 1fr))`,
            }}
          >
            <div className="px-3 py-1" />
            {days.map((d, i) => (
              <div
                key={i}
                className={`flex items-center justify-center border-l py-1 ${[0, 6].includes(d.getDay()) ? "bg-muted/50" : ""}`}
                title={fmtFull(d)}
              >
                {fmtDay(d)}
              </div>
            ))}
          </div>

          {/* Grid + bars */}
          <div className="relative" style={{ height: `${(proj.phases?.length ?? 0) * 40}px` }}>
            {/* vertical lines */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                display: "grid",
                gridTemplateColumns: `200px repeat(${totalDays}, minmax(28px, 1fr))`,
              }}
            >
              <div className="border-r" />
              {days.map((_, i) => (
                <div key={i} className="border-r" />
              ))}
            </div>

            {/* today line */}
            {showToday && (
              <div
                className="pointer-events-none absolute top-0 bottom-0 border-r-2 border-red-500"
                style={{ left: `calc(200px + ${todayPct}%)` }}
                title={`Today • ${fmtFull(today)}`}
              />
            )}

            {/* rows + bars */}
            {proj.phases?.map((ph, idx) => {
              const { leftPct, widthPct } = barPos(min, totalDays, ph.startDate, ph.endDate);
              const top = idx * 40;
              return (
                <div key={ph.id} className="absolute left-0 right-0" style={{ top }}>
                  {/* label */}
                  <div className="absolute left-0 flex h-10 w-[200px] items-center border-r bg-background px-3 text-sm">
                    <div className="truncate" title={ph.name}>
                      {ph.name}
                    </div>
                  </div>
                  {/* bar */}
                  <div
                    className="absolute h-4 rounded bg-blue-500/70 ring-1 ring-blue-600/60 hover:brightness-110"
                    style={{
                      left: `calc(200px + ${leftPct}%)`,
                      width: `${widthPct}%`,
                      top: 12,
                    }}
                    title={`${ph.name}\n${fmtFull(new Date(ph.startDate))} – ${fmtFull(new Date(ph.endDate))}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}