"use client"

import * as React from "react"

import { AppSidebarPm } from "../components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DeveloperHighlightsContent } from "../components/developer-highlights"
import { useDeveloperHighlights } from "../hooks/use-developer-highlights"
import { DeveloperSummary } from "../components/developer-summary"

export default function DeveloperHighlightPage() {
  const { data, loading, error } = useDeveloperHighlights()

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
              <div className="px-4 lg:px-6">
                <div className="mb-4 space-y-1">
                  <h1 className="text-xl font-semibold">Developer Highlights</h1>
                </div>
                <div className="grid gap-4">
                  <DeveloperSummary data={data} loading={loading} />
                  <DeveloperHighlightsContent
                    data={data}
                    loading={loading}
                    error={error}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
