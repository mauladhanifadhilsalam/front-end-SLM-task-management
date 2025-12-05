// src/components/developer/activity-cards.tsx
import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  CheckCircle2,
  MessageSquare,
  Zap,
  Calendar,
  AlertCircle,
} from "lucide-react"
import type { DeveloperDashboard } from "@/types/developer-dashboard.types"

type Props = {
  dashboard: DeveloperDashboard
}

export function ActivityCards({ dashboard }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Recent Activity */}
      <Card className="hover:shadow-lg transition-all duration-300 border-2 border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <p className="text-xs text-muted-foreground">Last 7 days summary</p>
        </CardHeader>

        <CardContent className="space-y-2 pb-3">
          {/* Completed Tasks */}
          <div className="flex items-center justify-between p-2 rounded-md bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-100 dark:border-blue-900">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-blue-500/20">
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium text-foreground">
                Completed Tasks
              </span>
            </div>
            <Badge className="bg-blue-600 dark:bg-blue-500 text-white text-[10px] px-2 py-0.5">
              {dashboard.completedTasksLast7Days}
            </Badge>
          </div>

          {/* Comments Written */}
          <div className="flex items-center justify-between p-2 rounded-md bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-100 dark:border-green-900">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-green-500/20">
                <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium text-foreground">
                Comments Written
              </span>
            </div>
            <Badge className="bg-green-600 dark:bg-green-500 text-white text-[10px] px-2 py-0.5">
              {dashboard.commentsWrittenLast7Days}
            </Badge>
          </div>

          {/* Completed Issues */}
          <div className="flex items-center justify-between p-2 rounded-md bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-100 dark:border-purple-900">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-purple-500/20">
                <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-medium text-foreground">
                Completed Issues
              </span>
            </div>
            <Badge className="bg-purple-600 dark:bg-purple-500 text-white text-[10px] px-2 py-0.5">
              {dashboard.completedIssuesLast7Days}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming & Priority */}
      <Card className="hover:shadow-lg transition-all duration-300 border-2 border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <Calendar className="h-5 w-5" />
            Priority & Upcoming
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            What needs attention
          </p>
        </CardHeader>

        <CardContent className="space-y-2 pb-3">
          {/* High Priority */}
          <div className="flex items-center justify-between p-2 rounded-md bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-100 dark:border-orange-900">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-orange-500/20">
                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-medium text-foreground">
                High Priority Tasks
              </span>
            </div>
            <Badge className="bg-orange-600 dark:bg-orange-500 text-white text-[10px] px-2 py-0.5">
              {dashboard.openTasksHighPriority}
            </Badge>
          </div>

          {/* Due 7 Days */}
          <div className="flex items-center justify-between p-2 rounded-md bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border border-yellow-100 dark:border-yellow-900">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-yellow-500/20">
                <Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-xs font-medium text-foreground">
                Tasks Due Next 7 Days
              </span>
            </div>
            <Badge className="bg-yellow-600 dark:bg-yellow-500 text-white text-[10px] px-2 py-0.5">
              {dashboard.tasksDueNext7Days}
            </Badge>
          </div>

          {/* Critical Issues */}
          <div className="flex items-center justify-between p-2 rounded-md bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border border-red-100 dark:border-red-900">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-xs font-medium text-foreground">
                Critical Issues
              </span>
            </div>
            <Badge className="bg-red-600 dark:bg-red-500 text-white text-[10px] px-2 py-0.5">
              {dashboard.criticalIssues}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}