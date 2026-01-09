"use client"

import * as React from "react"
import { AppSidebar } from "@/pages/dashboard/admin/components/sidebar-admin"
import { AppSidebarDev } from "@/pages/dashboard/dev/components/app-sidebardev"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProfileSettings } from "@/features/profile/components/profile-settings"
import { AppSidebarPm } from "@/pages/dashboard/pm/components/sidebar-pm"

const sidebarByRole = (role: string | null) => {
  if (role === "admin") return <AppSidebar variant="inset" />
  if (role === "project_manager") return <AppSidebarPm variant="inset" />
  return <AppSidebarDev variant="inset" />
}

export default function ProfileSettingsPage() {
  const [role, setRole] = React.useState<string | null>(null)

  React.useEffect(() => {
    setRole(localStorage.getItem("role"))
  }, [])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      {sidebarByRole(role)}
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <ProfileSettings />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
