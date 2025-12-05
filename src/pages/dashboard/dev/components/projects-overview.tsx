// src/components/developer/projects-overview.tsx
import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, ListTodo, TrendingUp } from "lucide-react"

type Props = {
  totalAssignedProjects: number
  projectsInProgress: number
}

export function ProjectsOverview({
  totalAssignedProjects,
  projectsInProgress,
}: Props) {
  return (
    <Card className="hover:shadow-md transition-all duration-300 border border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <Activity className="h-4 w-4" />
          Projects Overview
        </CardTitle>
        <p className="text-[10px] text-muted-foreground">
          Your assigned projects
        </p>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900 hover:shadow-sm transition-all">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-indigo-500/10">
                <ListTodo className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-xs font-medium text-foreground">
                Total Projects
              </span>
            </div>
            <Badge className="bg-indigo-600 dark:bg-indigo-500 text-white text-xs px-2 py-0.5">
              {totalAssignedProjects}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/20 dark:to-fuchsia-950/20 border border-violet-100 dark:border-violet-900 hover:shadow-sm transition-all">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-violet-500/10">
                <TrendingUp className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-xs font-medium text-foreground">
                In Progress
              </span>
            </div>
            <Badge className="bg-violet-600 dark:bg-violet-500 text-white text-xs px-2 py-0.5">
              {projectsInProgress}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}