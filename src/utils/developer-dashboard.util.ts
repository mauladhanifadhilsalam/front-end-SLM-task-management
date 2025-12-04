// src/utils/developer.utils.ts
import type { DeveloperDashboard, PerformanceLevel } from "@/types/developer-dashboard.types"

export const safeNumber = (v: any, fallback = 0): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export const clamp = (v: number, min = 0, max = 100): number => 
  Math.max(min, Math.min(max, v))

export const calculatePerformanceRating = (dashboard: DeveloperDashboard): number => {
  let score = 0

  const totalAssignedTasks = safeNumber(dashboard.totalAssignedTasks)
  const overdueTasks = safeNumber(dashboard.overdueTasks)
  const taskCompletionPercentage = safeNumber(dashboard.taskCompletionPercentage)
  const completedTasksLast7Days = safeNumber(dashboard.completedTasksLast7Days)
  const completedIssuesLast7Days = safeNumber(dashboard.completedIssuesLast7Days)
  const totalAssignedIssues = safeNumber(dashboard.totalAssignedIssues)
  const issuesInProgress = safeNumber(dashboard.issuesInProgress)
  const criticalIssues = safeNumber(dashboard.criticalIssues)
  const commentsWrittenLast7Days = safeNumber(dashboard.commentsWrittenLast7Days)

  // Task Completion Rate (50 points)
  score += (taskCompletionPercentage / 100) * 50

  // Overdue Tasks Penalty (30 points)
  const overdueRatio = totalAssignedTasks > 0 ? overdueTasks / totalAssignedTasks : 0
  score += Math.max(0, 30 - overdueRatio * 30)

  // Recent Productivity (10 points)
  const recentProductivity = completedTasksLast7Days + completedIssuesLast7Days
  if (totalAssignedTasks === 0) {
    score += 5
  } else if (recentProductivity > 0) {
    score += Math.min(10, recentProductivity * 2)
  }

  // Issue Resolution (5 points)
  if (totalAssignedIssues > 0) {
    const issueCompletionRate =
      ((totalAssignedIssues - issuesInProgress - criticalIssues) /
        totalAssignedIssues) *
      5
    score += issueCompletionRate
  } else {
    score += 5
  }

  // Engagement (5 points)
  if (commentsWrittenLast7Days > 0) {
    score += Math.min(5, commentsWrittenLast7Days * 0.5)
  } else {
    score += 2.5
  }

  return Math.round(Math.min(100, score))
}

export const getPerformanceLevel = (score: number): PerformanceLevel => {
  if (score >= 90)
    return {
      label: "Excellent",
      color: "text-green-600",
      bgColor:
        "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
      borderColor: "border-green-200 dark:border-green-900",
    }
  if (score >= 75)
    return {
      label: "Great",
      color: "text-blue-600",
      bgColor:
        "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
      borderColor: "border-blue-200 dark:border-blue-900",
    }
  if (score >= 60)
    return {
      label: "Good",
      color: "text-yellow-600",
      bgColor:
        "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20",
      borderColor: "border-yellow-200 dark:border-yellow-900",
    }
  if (score >= 40)
    return {
      label: "Fair",
      color: "text-orange-600",
      bgColor:
        "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
      borderColor: "border-orange-200 dark:border-orange-900",
    }
  return {
    label: "Needs Improvement",
    color: "text-red-600",
    bgColor:
      "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20",
    borderColor: "border-red-200 dark:border-red-900",
  }
}