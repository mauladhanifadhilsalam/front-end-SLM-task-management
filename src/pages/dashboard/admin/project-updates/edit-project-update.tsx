"use client"

import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { AppSidebar } from "@/pages/dashboard/admin/components/sidebar-admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import { ProjectUpdateForm } from "@/features/project-updates/components/project-update-form"
import { fetchProjectUpdateById } from "@/services/project-update.service"
import { projectUpdateKeys } from "@/lib/query-keys"
import type { ProjectUpdateValues } from "@/schemas/project-update.schema"

export default function AdminEditProjectUpdate() {
  const navigate = useNavigate()
  const { id } = useParams()
  const updateId = Number(id)

  const updateQuery = useQuery({
    queryKey: projectUpdateKeys.detail(updateId),
    queryFn: () => fetchProjectUpdateById(updateId),
    enabled: Number.isFinite(updateId) && updateId > 0,
  })

  const initialValues = React.useMemo<Partial<ProjectUpdateValues> | undefined>(() => {
    if (!updateQuery.data) return undefined
    return {
      projectId: String(updateQuery.data.projectId),
      phaseId: updateQuery.data.phaseId ? String(updateQuery.data.phaseId) : "",
      reportDate: updateQuery.data.reportDate
        ? updateQuery.data.reportDate.split("T")[0]
        : "",
      participant: updateQuery.data.participant ?? "",
      objective: updateQuery.data.objective ?? "",
      progressHighlight: updateQuery.data.progressHighlight ?? "",
      teamMood: updateQuery.data.teamMood ?? "",
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
      <AppSidebar variant="inset" />
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
                      navigate("/admin/dashboard/project-updates")
                    }
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <IconArrowLeft className="h-4 w-4" />
                    Kembali
                  </Button>
                </div>
                <h1 className="text-2xl font-semibold">Edit Project Update</h1>
              </div>

              <div className="px-4 lg:px-6">
                {updateQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">Memuat data...</p>
                ) : updateQuery.error ? (
                  <p className="text-sm text-red-600">Gagal memuat data.</p>
                ) : updateQuery.data ? (
                  <ProjectUpdateForm
                    mode="edit"
                    updateId={updateId}
                    initialValues={initialValues}
                    onSuccess={() =>
                      navigate("/admin/dashboard/project-updates")
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
