// src/components/developer/dev-charts.tsx
import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts"
import type { DeveloperDashboard } from "@/types/developer-dashboard.types"
import { safeNumber } from "@/utils/developer-dashboard.util"

type Props = {
  dashboard: DeveloperDashboard
}

const COLORS = ["#3b82f6", "#f97316", "#10b981", "#ef4444"]

export function DevCharts({ dashboard }: Props) {
  const totalAssignedTasks = safeNumber(dashboard.totalAssignedTasks)
  const tasksInProgress = safeNumber(dashboard.tasksInProgress)
  const overdueTasks = safeNumber(dashboard.overdueTasks)
  const taskCompletionPercentage = safeNumber(dashboard.taskCompletionPercentage)

  const totalAssignedIssues = safeNumber(dashboard.totalAssignedIssues)
  const issuesInProgress = safeNumber(dashboard.issuesInProgress)
  const criticalIssues = safeNumber(dashboard.criticalIssues)
  const openIssuesHighPriority = safeNumber(dashboard.openIssuesHighPriority)
  const issuesDueNext7Days = safeNumber(dashboard.issuesDueNext7Days)

  const taskOverviewData = [
    { name: "In Progress", value: tasksInProgress },
    { name: "Overdue", value: overdueTasks },
    {
      name: "Completed",
      value: Math.max(
        0,
        Math.min(
          totalAssignedTasks,
          Math.round((totalAssignedTasks * taskCompletionPercentage) / 100),
        ),
      ),
    },
  ]

  const ticketsByProjectData = Array.isArray(dashboard.ticketsByProject)
    ? dashboard.ticketsByProject.map((p: any) => ({
        project: `#${p.projectId}`,
        open: safeNumber(p.openTickets, 0),
        closed: Math.max(
          0,
          safeNumber(p.totalTickets, 0) - safeNumber(p.openTickets, 0)
        ),
      }))
    : []

  const TicketsTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    const colorFor = (entry: any, index: number) => {
      if (entry && entry.color) return entry.color
      if (entry && entry.dataKey) {
        if (entry.dataKey === "open") return COLORS[1]
        if (entry.dataKey === "closed") return COLORS[2]
      }
      return COLORS[index] || COLORS[0]
    }

    return (
      <div
        style={{
          background: "#0b1220",
          color: "#fff",
          borderRadius: 8,
          padding: 10,
          minWidth: 140,
          boxShadow: "0 10px 30px rgba(2,6,23,0.6)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 8,
            color: "#d1d5db",
          }}
        >
          {label}
        </div>
        {payload.map((p: any, i: number) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: i === payload.length - 1 ? 0 : 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  background: colorFor(p, i),
                  borderRadius: 4,
                  display: "inline-block",
                }}
              />
              <span style={{ color: "#cbd5e1", fontSize: 12 }}>
                {p.name ?? p.dataKey}
              </span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 12 }}>{p.value ?? 0}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Charts & Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Task Overview Chart */}
        <Card className="hover:shadow-md transition-all duration-300 border border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Task Distribution
            </CardTitle>
            <p className="text-[10px] text-muted-foreground">
              Current task states overview
            </p>
          </CardHeader>
          <CardContent className="pb-3">
            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={taskOverviewData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={60}
                    innerRadius={35}
                    paddingAngle={4}
                  >
                    {taskOverviewData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              {taskOverviewData.map((d, idx) => (
                <div
                  key={d.name}
                  className="text-center p-1.5 rounded-lg bg-muted/30 hover:bg-muted transition-colors"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: COLORS[idx] }}
                  />
                  <div className="font-bold text-sm text-foreground">
                    {d.value}
                  </div>
                  <div className="text-muted-foreground text-[9px] mt-0.5">
                    {d.name}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Issue Status */}
        <Card className="hover:shadow-md transition-all duration-300 border border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Issue
            </CardTitle>
            <p className="text-[10px] text-muted-foreground">
              Current issues breakdown
            </p>
          </CardHeader>
          <CardContent className="space-y-2 pb-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-100 dark:border-blue-900 hover:shadow-sm transition-all">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {issuesInProgress}
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  In Progress
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border border-red-100 dark:border-red-900 hover:shadow-sm transition-all">
                <div className="text-xl font-bold text-red-600 dark:text-red-400">
                  {criticalIssues}
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  Critical
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-100 dark:border-orange-900 hover:shadow-sm transition-all">
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {openIssuesHighPriority}
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  High Priority
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-100 dark:border-amber-900 hover:shadow-sm transition-all">
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {issuesDueNext7Days}
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  Due 7 Days
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Total Issues
                </span>
                <Badge
                  variant="outline"
                  className="text-sm font-bold border-border text-foreground"
                >
                  {totalAssignedIssues}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Tickets Chart */}
      <Card className="hover:shadow-md transition-all duration-300 border border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Project Tickets Overview
          </CardTitle>
          <p className="text-[10px] text-muted-foreground">
            Open vs Closed tickets per project
          </p>
        </CardHeader>
        <CardContent className="pb-3">
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={ticketsByProjectData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="project"
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                />
                <Tooltip
                  content={<TicketsTooltip />}
                  wrapperStyle={{ overflow: "visible", zIndex: 9999 }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: "8px" }}
                />
                <Bar
                  dataKey="open"
                  fill={COLORS[1]}
                  radius={[6, 6, 0, 0]}
                  name="Open Tickets"
                />
                <Bar
                  dataKey="closed"
                  fill={COLORS[2]}
                  radius={[6, 6, 0, 0]}
                  name="Closed Tickets"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  )
}