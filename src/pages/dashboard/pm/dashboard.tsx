"use client"

import * as React from "react"
import { AppSidebarPm } from "./components/sidebar-pm"
import { PmAnalytics } from "./components/pm-analytics"
import { ProjectOwnerTable } from "./components/project-owner-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { usePmOverview } from "./hooks/use-pm-overview"
import { usePmProjects } from "./hooks/use-pm-projects"

export default function Page() {
  const { data: overview, loading, error } = usePmOverview()
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
  } = usePmProjects()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebarPm variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              

              {loading && (
                <div className="px-4 lg:px-6 grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-lg border p-4 space-y-3"
                    >
                      <div className="h-4 w-24 rounded bg-accent animate-pulse" />
                      <div className="h-7 w-32 rounded bg-accent animate-pulse" />
                      <div className="h-2 w-full rounded bg-accent animate-pulse" />
                    </div>
                  ))}
                </div>
              )}


              {error && (
                <div className="px-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="px-4 lg:px-6 space-y-4">
                {overview && <PmAnalytics overview={overview} />}
                <ProjectOwnerTable
                  projects={projects}
                  loading={projectsLoading}
                  error={projectsError}
                />
              </div>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
