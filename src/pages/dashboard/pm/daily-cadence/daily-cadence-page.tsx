"use client"

import * as React from "react"
import { useLocation, useParams } from "react-router-dom"
import { AppSidebarPm } from "../components/sidebar-pm"
import { PmDailyCadence } from "../components/pm-daily-cadence"
import { PmDailyCadenceCharts } from "../components/pm-daily-cadence-charts"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { usePmDailyCadence } from "../hooks/use-pm-daily-cadence"
import { useProjectUpdates } from "../hooks/use-project-updates"

type LocationState = {
  projectName?: string
}

export default function DailyCadencePage() {
  const { projectId } = useParams()
  const location = useLocation()
  const state = location.state as LocationState | null
  const { data, loading, error } = usePmDailyCadence(projectId)
  const {
    updates: projectUpdates,
    loading: updatesLoading,
    error: updatesError,
  } = useProjectUpdates({
    projectId: projectId ? Number(projectId) : undefined,
  })

  const latestUpdate = getLatestProjectUpdate(projectUpdates)

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
              <div className="px-4 lg:px-6 flex flex-col gap-5">
                <PmDailyCadenceCharts data={data} loading={loading} error={error} />
                <PmDailyCadence
                  data={data}
                  loading={loading}
                  error={error}
                  projectName={state?.projectName}
                  projectUpdate={latestUpdate}
                  projectUpdateLoading={updatesLoading}
                  projectUpdateError={updatesError}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function getLatestProjectUpdate(
  updates: { reportDate?: string; updatedAt?: string; createdAt?: string }[],
) {
  if (!updates.length) return null
  return [...updates].sort((a, b) => {
    const aTime = Date.parse(a.reportDate || a.updatedAt || a.createdAt || "")
    const bTime = Date.parse(b.reportDate || b.updatedAt || b.createdAt || "")
    return bTime - aTime
  })[0]
}
