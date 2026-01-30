import * as React from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "../components/sidebar-admin"
import { SiteHeader } from "@/components/site-header"
import { ProjectTeamUpdateDetail } from "@/features/team-updates/components/project-team-update-detail"

export default function AdminProjectTeamUpdateDetailPage() {
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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <ProjectTeamUpdateDetail
                  title="Team Updates"
                  description="Daily updates per project"
                  basePath="/admin/dashboard/team-updates"
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
