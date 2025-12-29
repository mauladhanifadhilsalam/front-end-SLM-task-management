"use client"

import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { AppSidebarPm } from "../components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { fetchTeamUpdateById } from "@/services/team-update.service"
import { teamUpdateKeys } from "@/lib/query-keys"
import { usePmProjects } from "../hooks/use-pm-projects"

const formatDate = (value?: string) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export default function ViewTeamUpdatePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const updateId = Number(id)
  const { projects } = usePmProjects()

  const updateQuery = useQuery({
    queryKey: teamUpdateKeys.detail(updateId),
    queryFn: () => fetchTeamUpdateById(updateId),
    enabled: Number.isFinite(updateId) && updateId > 0,
  })

  const projectLabel = React.useMemo(() => {
    if (!updateQuery.data) return "-"
    const match = projects.find((project) => project.id === updateQuery.data?.projectId)
    return match?.name ?? `Project ${updateQuery.data?.projectId}`
  }, [projects, updateQuery.data])

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
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate("/project-manager/dashboard/team-update")
                    }
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <IconArrowLeft className="h-4 w-4" />
                    Kembali
                  </Button>
                </div>
                <h1 className="text-2xl font-semibold">Team Update Detail</h1>
              </div>

              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detail Update</CardTitle>
                    <CardDescription>
                      Informasi update harian developer.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    {updateQuery.isLoading ? (
                      <p className="text-muted-foreground">Memuat data...</p>
                    ) : updateQuery.error ? (
                      <p className="text-red-600">Gagal memuat data.</p>
                    ) : updateQuery.data ? (
                      <div className="space-y-3">
                        <div>
                          <span className="text-muted-foreground">Project:</span>{" "}
                          <span className="font-medium">{projectLabel}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Developer:</span>{" "}
                          <span className="font-medium">
                            {updateQuery.data.developer.fullName}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>{" "}
                          <span className="font-medium">
                            {updateQuery.data.status.replace("_", " ")}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tanggal:</span>{" "}
                          <span className="font-medium">
                            {formatDate(updateQuery.data.updatedAt || updateQuery.data.createdAt)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Yesterday:</span>
                          <p className="mt-1">{updateQuery.data.yesterdayWork}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Today:</span>
                          <p className="mt-1">{updateQuery.data.todayWork}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Blocker:</span>
                          <p className="mt-1">
                            {updateQuery.data.blocker || "-"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Next Action:</span>
                          <p className="mt-1">{updateQuery.data.nextAction}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Data tidak ditemukan.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
