"use client"

import * as React from "react"
import { useLocation, useParams } from "react-router-dom"
import { AppSidebarPm } from "../components/sidebar-pm"
import { PmDailyCadence } from "../components/pm-daily-cadence"
import { PmDailyCadenceCharts } from "../components/pm-daily-cadence-charts"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { usePmDailyCadence } from "../hooks/use-pm-daily-cadence"

type LocationState = {
  projectName?: string
}

export default function DailyCadencePage() {
  const { projectId } = useParams()
  const location = useLocation()
  const state = location.state as LocationState | null
  const { data, loading, error } = usePmDailyCadence(projectId)

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
                <PmDailyCadenceCharts data={data} loading={loading} error={error}/>
                <PmDailyCadence
                  data={data}
                  loading={loading}
                  error={error}
                  projectName={state?.projectName}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
