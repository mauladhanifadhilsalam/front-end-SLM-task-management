import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  IconFolder,
  IconClockHour4,
  IconTicket,
  IconAlertTriangle,
  IconBell,
  IconMessageCircle,
} from "@tabler/icons-react"

export type PmOverview = {
  userId: number
  fullName: string
  email: string

  totalProjects: number
  activeProjects: number
  onHoldProjects: number
  completedProjects: number
  projectsDueNext7Days: number
  projectsDueNext30Days: number
  overdueProjects: number

  activePhases: number
  phasesDueNext30Days: number
  overduePhases: number

  totalTickets: number
  openTickets: number
  inReviewTickets: number
  overdueTickets: number
  openHighPriorityTickets: number
  openCriticalTickets: number
  completedTicketsLast7Days: number
  completedTicketsLast30Days: number
  oldestOpenTicketDays: number

  ticketsByStatus: { count: number; status: string }[]
  ticketsByPriority: { count: number; priority: string }[]
  ticketsByProject: {
    name: string
    projectId: number
    openTickets: number
    totalTickets: number
  }[]

  primaryProjectId: number
  commentsLast7Days: number
  commentsLast30Days: number
  unreadNotificationsCount: number
}

type SectionCardsProps = {
  overview: PmOverview
}

export function SectionCards({ overview }: SectionCardsProps) {
  const notStarted = Math.max(
    overview.totalProjects -
      overview.activeProjects -
      overview.completedProjects -
      overview.onHoldProjects,
    0,
  )

  const projectOverduePct = percent(
    overview.overdueProjects,
    overview.totalProjects,
  )
  const ticketOpenPct = percent(
    overview.openTickets,
    overview.totalTickets,
  )
  const ticketOverduePct = percent(
    overview.overdueTickets,
    overview.totalTickets,
  )

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Projects */}
      <Card className="@container/card overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary/70 via-primary to-primary/60" />
        <CardHeader className="space-y-3 pt-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                <IconFolder size={16} className="text-primary" />
              </div>
              <CardDescription className="text-xs">
                Projects
              </CardDescription>
            </div>
            <CardAction />
          </div>

          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {overview.totalProjects}
          </CardTitle>

          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <MetricPill label="Active" value={overview.activeProjects} />
            <MetricPill label="Done" value={overview.completedProjects} />
            {notStarted > 0 && (
              <MetricPill
                label="Not started"
                value={notStarted}
                variant="muted"
              />
            )}
            {overview.overdueProjects > 0 && (
              <MetricPill
                label="Overdue"
                value={`${overview.overdueProjects}${
                  projectOverduePct > 0 ? ` (${projectOverduePct}%)` : ""
                }`}
                variant="danger"
              />
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Phases / timeline */}
      <Card className="@container/card overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-sky-500/70 via-sky-500 to-sky-400/70" />
        <CardHeader className="space-y-3 pt-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/10">
                <IconClockHour4 size={16} className="text-sky-500" />
              </div>
              <CardDescription className="text-xs">
                Phases & Timeline
              </CardDescription>
            </div>
            <CardAction />
          </div>

          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {overview.activePhases}
          </CardTitle>

          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <MetricPill
              label="Due next 30 days"
              value={overview.phasesDueNext30Days}
            />
            {overview.overduePhases > 0 && (
              <MetricPill
                label="Overdue phases"
                value={overview.overduePhases}
                variant="danger"
              />
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Tickets */}
      <Card className="@container/card overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500/70 via-emerald-500 to-emerald-400/70" />
        <CardHeader className="space-y-3 pt-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10">
                <IconTicket size={16} className="text-emerald-500" />
              </div>
              <CardDescription className="text-xs">
                Tickets
              </CardDescription>
            </div>
            <CardAction />
          </div>

          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {overview.openTickets}/{overview.totalTickets}
          </CardTitle>

          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <MetricPill
              label="Open"
              value={
                ticketOpenPct > 0
                  ? `${overview.openTickets} (${ticketOpenPct}%)`
                  : overview.openTickets
              }
            />
            <MetricPill
              label="In review"
              value={overview.inReviewTickets}
              variant="muted"
            />
            {overview.completedTicketsLast7Days > 0 && (
              <MetricPill
                label="Done / 7d"
                value={overview.completedTicketsLast7Days}
              />
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Risk & activity */}
      <Card className="@container/card overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-rose-500/80 via-rose-500 to-amber-400/80" />
        <CardHeader className="space-y-3 pt-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10">
                <IconAlertTriangle size={16} className="text-rose-500" />
              </div>
              <CardDescription className="text-xs">
                Risk & Signals
              </CardDescription>
            </div>
            <CardAction />
          </div>

          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {overview.overdueTickets}
          </CardTitle>

          <div className="flex flex-wrap gap-1.5 text-[11px] mb-1">
            <MetricPill
              label="Overdue tickets"
              value={
                ticketOverduePct > 0
                  ? `${overview.overdueTickets} (${ticketOverduePct}%)`
                  : overview.overdueTickets
              }
              variant="danger"
            />
            <MetricPill
              label="High"
              value={overview.openHighPriorityTickets}
              variant="warn"
            />
            <MetricPill
              label="Critical"
              value={overview.openCriticalTickets}
              variant="dangerSolid"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <Badge
              variant="outline"
              className="h-5 px-2 gap-1 text-[10px] flex items-center"
            >
              <IconMessageCircle size={12} />
              {overview.commentsLast7Days} comments / 7d
            </Badge>
            <Badge
              variant={overview.unreadNotificationsCount > 0 ? "default" : "outline"}
              className="h-5 px-2 gap-1 text-[10px] flex items-center"
            >
              <IconBell size={12} />
              {overview.unreadNotificationsCount > 0
                ? `${overview.unreadNotificationsCount} unread`
                : "Inbox clear"}
            </Badge>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}

/* Helpers */

function percent(part: number, total: number): number {
  if (!total || total <= 0) return 0
  return Math.round((part / total) * 100)
}

type MetricPillVariant = "default" | "muted" | "danger" | "warn" | "dangerSolid"

function MetricPill({
  label,
  value,
  variant = "default",
}: {
  label: string
  value: number | string
  variant?: MetricPillVariant
}) {
  let base =
    "inline-flex items-center gap-1 rounded-full px-2 py-[3px] border text-[10px]"
  let cls =
    "border-border bg-muted/40 text-foreground"

  if (variant === "muted") {
    cls = "border-border/60 bg-muted/30 text-muted-foreground"
  } else if (variant === "danger") {
    cls = "border-rose-400/70 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200"
  } else if (variant === "warn") {
    cls = "border-amber-400/70 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200"
  } else if (variant === "dangerSolid") {
    cls = "border-rose-500 bg-rose-500 text-white dark:bg-rose-600"
  }

  return (
    <span className={`${base} ${cls}`}>
      <span className="font-medium">{value}</span>
      <span className="opacity-80">{label}</span>
    </span>
  )
}
