"use client"

import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppSidebar } from "@/pages/dashboard/admin/components/sidebar-admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProjectUpdateDetail } from "@/features/project-updates/components/project-update-detail"

export default function AdminViewProjectUpdate() {
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
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <ProjectUpdateDetail
              updateId={updateId}
              title="Project Update Detail"
              onBack={() => navigate("/admin/dashboard/project-updates")}
              onEdit={() => navigate(`/admin/dashboard/project-updates/edit/${updateId}`)}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
