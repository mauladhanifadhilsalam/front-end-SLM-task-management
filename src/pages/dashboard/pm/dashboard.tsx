"use client"

import * as React from "react"
import { AppSidebarPm } from "./components/sidebar-pm"
import { PmAnalytics } from "./components/pm-analytics"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { usePmOverview } from "./hooks/use-pm-overview"

export default function Page() {
  const { data: overview, loading, error } = usePmOverview()

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
                <div className="px-4 text-sm text-muted-foreground">
                  Loading overview…
                </div>
              )}

              {error && (
                <div className="px-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              {overview && (
                <div className="px-4 lg:px-6 space-y-4">
                  <PmAnalytics overview={overview} />
                </div>
              )}

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
