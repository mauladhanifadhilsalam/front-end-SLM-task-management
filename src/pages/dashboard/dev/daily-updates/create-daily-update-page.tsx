"use client"

import * as React from "react"
import { AppSidebarDev } from "../components/app-sidebardev"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"
import { CreateTeamUpdateForm } from "@/features/team-updates/components/create-team-update-form"

export default function CreateDailyUpdatePage() {
  const navigate = useNavigate()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebarDev variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate("/developer-dashboard/daily-updates")
                    }
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <IconArrowLeft className="h-4 w-4" />
                    Kembali
                  </Button>
                </div>
                <h1 className="text-2xl font-semibold">Create Daily Update</h1>
              </div>
              <div className="px-4 lg:px-6">
                <CreateTeamUpdateForm
                  onSuccess={() =>
                    navigate("/developer-dashboard/daily-updates")
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
