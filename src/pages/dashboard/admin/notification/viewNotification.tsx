"use client"

import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminNotificationDetail } from "@/features/notification/components/admin-notification-detail"

export default function ViewNotification() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()

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
        <AdminNotificationDetail
          rawId={params.id}
          onBack={() => navigate("/admin-dashboard/notifications")}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
