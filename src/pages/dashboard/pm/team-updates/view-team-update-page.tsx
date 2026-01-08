"use client"

import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AppSidebarPm } from "../components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TeamUpdateDetail } from "@/features/team-updates/components/team-update-detail"

export default function ViewTeamUpdatePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const updateId = Number(id)

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
            <TeamUpdateDetail
              updateId={updateId}
              title="Team Update Detail"
              onBack={() => navigate("/project-manager/dashboard/team-update")}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
