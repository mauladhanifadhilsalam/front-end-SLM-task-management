// src/components/developer/performance-card.tsx
import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award } from "lucide-react"
import type { PerformanceLevel } from "@/types/developer-dashboard.types"

type Props = {
  performanceScore: number
  performanceLevel: PerformanceLevel
  weeklyTasks: number
  weeklyIssues: number
}

export function PerformanceCard({
  performanceScore,
  performanceLevel,
  weeklyTasks,
  weeklyIssues,
}: Props) {
  return (
    <Card
      className={`${performanceLevel.bgColor} ${performanceLevel.borderColor} border-2 shadow-sm`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
          <Award className={`h-4 w-4 ${performanceLevel.color}`} />
          Performance Rating
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-3">
        <div className="flex items-center justify-center">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="56"
                cy="56"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${
                  2 * Math.PI * 50 * (1 - performanceScore / 100)
                }`}
                className={performanceLevel.color}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${performanceLevel.color}`}>
                {performanceScore}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                / 100
              </span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Badge
            className={`${performanceLevel.color} bg-opacity-20 dark:bg-opacity-20 text-xs px-3 py-0.5 font-semibold`}
          >
            {performanceLevel.label}
          </Badge>
        </div>

        <div className="pt-2 border-t border-gray-300 dark:border-gray-700 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">
              Weekly Output
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {weeklyTasks > 0 || weeklyIssues > 0
                ? `${weeklyTasks} task${weeklyTasks !== 1 ? "s" : ""} | ${weeklyIssues} issue${weeklyIssues !== 1 ? "s" : ""}`
                : "0 tasks | 0 issue"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}