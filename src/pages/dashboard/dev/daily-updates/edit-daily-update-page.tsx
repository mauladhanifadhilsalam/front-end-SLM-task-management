"use client"

import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { AppSidebarDev } from "../components/app-sidebardev"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import { EditTeamUpdateForm } from "@/features/team-updates/components/edit-team-update-form"
import { fetchTeamUpdateById } from "@/services/team-update.service"
import { teamUpdateKeys } from "@/lib/query-keys"
import type { TeamUpdateValues } from "@/schemas/team-update.schema"

export default function EditDailyUpdatePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const updateId = Number(id)

  const updateQuery = useQuery({
    queryKey: teamUpdateKeys.detail(updateId),
    queryFn: () => fetchTeamUpdateById(updateId),
    enabled: Number.isFinite(updateId) && updateId > 0,
  })

  const initialValues = React.useMemo<TeamUpdateValues | undefined>(() => {
    if (!updateQuery.data) return undefined
    return {
      projectId: String(updateQuery.data.projectId),
      yesterdayWork: updateQuery.data.yesterdayWork ?? "",
      todayWork: updateQuery.data.todayWork ?? "",
      blocker: updateQuery.data.blocker ?? "",
      nextAction: updateQuery.data.nextAction ?? "",
      status: updateQuery.data.status,
    }
  }, [updateQuery.data])

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
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <IconArrowLeft className="h-4 w-4" />
                    Kembali
                  </Button>
                </div>
                <h1 className="text-2xl font-semibold">Edit Daily Update</h1>
              </div>

              <div className="px-4 lg:px-6">
                {updateQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">Memuat data...</p>
                ) : updateQuery.error ? (
                  <p className="text-sm text-red-600">Gagal memuat data.</p>
                ) : updateQuery.data ? (
                  <EditTeamUpdateForm
                    updateId={updateId}
                    initialValues={initialValues}
                    onSuccess={() =>
                      navigate("/developer-dashboard/daily-updates")
                    }
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Data tidak ditemukan.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
