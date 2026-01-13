"use client"

import * as React from "react"
import { AppSidebar } from "@/pages/dashboard/admin/components/sidebar-admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProjectUpdateTable } from "@/features/project-updates/components/project-update-table"

export default function AdminProjectUpdates() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
              <ProjectUpdateTable
                title="Project Updates"
                description="List update harian project yang dikirimkan tim."
                createPath="/admin/dashboard/project-updates/create"
                basePath="/admin/dashboard/project-updates"
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
