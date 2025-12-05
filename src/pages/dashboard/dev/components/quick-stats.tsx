// src/components/developer/quick-stats.tsx
import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  ListTodo,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { clamp } from "@/utils/developer-dashboard.util"

type Props = {
  totalAssignedTasks: number
  tasksInProgress: number
  taskCompletionPercentage: number
  overdueTasks: number
}

export function QuickStats({
  totalAssignedTasks,
  tasksInProgress,
  taskCompletionPercentage,
  overdueTasks,
}: Props) {
  return (
    <div className="lg:col-span-2 grid grid-cols-2 gap-3">
      {/* Total Tasks */}
      <Card className="hover:shadow-md transition-all duration-300 border border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Total Tasks
          </CardTitle>
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
            <ListTodo className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {totalAssignedTasks}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            All assigned to you
          </p>
        </CardContent>
      </Card>

      {/* In Progress */}
      <Card className="hover:shadow-md transition-all duration-300 border border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            In Progress
          </CardTitle>
          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md">
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {tasksInProgress}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Active work items
          </p>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
          <CardTitle className="text-xs font-medium text-green-700 dark:text-green-400">
            Completion Task
          </CardTitle>
          <div className="p-1.5 bg-green-200 dark:bg-green-900/50 rounded-md">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">
            {taskCompletionPercentage}%
          </div>
          <Progress
            value={clamp(taskCompletionPercentage)}
            className="h-1.5 mt-1.5"
          />
        </CardContent>
      </Card>

      {/* Overdue */}
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-800 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
          <CardTitle className="text-xs font-medium text-red-700 dark:text-red-400">
            Overdue
          </CardTitle>
          <div className="p-1.5 bg-red-200 dark:bg-red-900/50 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-2xl font-bold text-red-700 dark:text-red-400">
            {overdueTasks}
          </div>
          <p className="text-[10px] text-red-600 dark:text-red-500 mt-0.5">
            Requires attention
          </p>
        </CardContent>
      </Card>
    </div>
  )
}