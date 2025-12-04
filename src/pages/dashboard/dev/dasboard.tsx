// src/app/developer/dashboard/page.tsx
"use client"

import * as React from "react"
import { AppSidebarDev } from "@/components/app-sidebardev"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useDeveloperDashboard } from "@/pages/dashboard/dev/hook/useDeveloperDashboard"
import { PerformanceCard } from "@/pages/dashboard/dev/components/performance-card"
import { QuickStats } from "@/pages/dashboard/dev/components/quick-stats"
import { DevCharts } from "@/pages/dashboard/dev/components/dev-charts"
import { ActivityCards } from "@/pages/dashboard/dev/components/activity-cards"
import { ProjectsOverview } from "@/pages/dashboard/dev/components/projects-overview"
import {
  calculatePerformanceRating,
  getPerformanceLevel,
  safeNumber,
} from "@/utils/developer-dashboard.util"

export default function DeveloperDashboardPage() {
  const { dashboard, loading, error } = useDeveloperDashboard()

  // Loading state
  if (loading) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebarDev />
        <SidebarInset>
          <SiteHeader />
          <div className="flex items-center justify-center h-[calc(100vh-var(--header-height))]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Error state
  if (error) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebarDev />
        <SidebarInset>
          <SiteHeader />
          <div className="flex items-center justify-center h-[calc(100vh-var(--header-height))]">
            <div className="text-center space-y-4">
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors text-sm"
              >
                Muat Ulang
              </button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // No data state
  if (!dashboard) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebarDev />
        <SidebarInset>
          <SiteHeader />
          <div className="flex items-center justify-center h-[calc(100vh-var(--header-height))]">
            <p className="text-muted-foreground text-sm">
              Tidak ada data dashboard.
            </p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Calculate performance
  const performanceScore = calculatePerformanceRating(dashboard)
  const performanceLevel = getPerformanceLevel(performanceScore)

  // Safe values
  const totalAssignedTasks = safeNumber(dashboard.totalAssignedTasks)
  const tasksInProgress = safeNumber(dashboard.tasksInProgress)
  const overdueTasks = safeNumber(dashboard.overdueTasks)
  const taskCompletionPercentage = safeNumber(dashboard.taskCompletionPercentage)
  const completedTasksLast7Days = safeNumber(dashboard.completedTasksLast7Days)
  const completedIssuesLast7Days = safeNumber(dashboard.completedIssuesLast7Days)
  const totalAssignedProjects = safeNumber(dashboard.totalAssignedProjects)
  const projectsInProgress = safeNumber(dashboard.projectsInProgress)

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebarDev />
      <SidebarInset>
        <SiteHeader />

        <div className="p-4 space-y-4 bg-background">
          {/* Welcome Header */}
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back, {dashboard.fullName ?? "User"}!
            </h1>
            <p className="text-sm text-muted-foreground">
              Here's an overview of your tasks and progress
            </p>
          </div>

          {/* Performance & Key Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <PerformanceCard
              performanceScore={performanceScore}
              performanceLevel={performanceLevel}
              weeklyTasks={completedTasksLast7Days}
              weeklyIssues={completedIssuesLast7Days}
            />

            <QuickStats
              totalAssignedTasks={totalAssignedTasks}
              tasksInProgress={tasksInProgress}
              taskCompletionPercentage={taskCompletionPercentage}
              overdueTasks={overdueTasks}
            />
          </div>

          {/* Charts */}
          <DevCharts dashboard={dashboard} />

          {/* Activity & Upcoming */}
          <ActivityCards dashboard={dashboard} />

          {/* Projects Overview */}
          <ProjectsOverview
            totalAssignedProjects={totalAssignedProjects}
            projectsInProgress={projectsInProgress}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}