"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { AppSidebarPm } from "../components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAdminProjects } from "@/features/projects/hooks/use-admin-projects"
import { ProjectsToolbar } from "@/features/projects/components/projects-toolbar"
import { ProjectsCardsList } from "@/features/projects/components/projects-cards-list"
import { ProjectsEmptyState, ProjectsSearchEmptyState } from "../../../../features/projects/components/projecs-empty-state"
import { ProjectSummaryCharts } from "../components/project-summary-charts"
import { downloadProjectReport } from "@/services/project.service"

export default function AdminProjects() {
  const navigate = useNavigate()

  const {
    projects,
    loading,
    error,
    search,
    statusFilter,
    columns,
    setSearch,
    setStatusFilter,
    toggleColumn,
    deleteProject,
    setPageSize,
  } = useAdminProjects()

  const [downloadingReport, setDownloadingReport] = React.useState(false)

  const hasData = projects.length > 0

  React.useEffect(() => {
    setPageSize(50)
  }, [setPageSize])

  const handleCreateProject = () => {
    navigate("/project-manager/dashboard/projects/create")
  }

  const handleDownloadReport = React.useCallback(async () => {
    if (downloadingReport) return

    setDownloadingReport(true)
    try {
      const { blob, fileName } = await downloadProjectReport()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("Laporan berhasil diunduh", {
        description: "File Excel laporan proyek siap digunakan.",
      })
    } catch (e: any) {
      const msg =
        e?.message ||
        e?.response?.data?.message ||
        "Gagal mengunduh laporan proyek."
      toast.error("Gagal mengunduh laporan", {
        description: msg,
      })
    } finally {
      setDownloadingReport(false)
    }
  }, [downloadingReport])

  return (
    <div className="overflow-x-hidden">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebarPm variant="inset" />
        <SidebarInset className="overflow-x-hidden">
          <SiteHeader />

          <main className="flex flex-col flex-1 p-6 space-y-6 max-w-full overflow-x-hidden">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold">
                  Daftar Project
                </h1>
                <p className="text-muted-foreground">
                  Lihat dan kelola semua project aktif.
                </p>
              </div>
            </div>

            <div className="w-full overflow-x-hidden">
              <ProjectSummaryCharts projects={projects} />
            </div>

            <div className="w-full overflow-x-hidden">
              <ProjectsToolbar
                search={search}
                statusFilter={statusFilter}
                columns={columns}
                onSearchChange={setSearch}
                onStatusFilterChange={setStatusFilter}
                onToggleColumn={toggleColumn}
                onDownloadReport={handleDownloadReport}
                downloadDisabled={downloadingReport}
                showColumnToggle={false}
                onAddProject={handleCreateProject}
              />
            </div>

            <div className="w-full overflow-x-hidden">
              <ProjectsCardsList
                projects={projects}
                loading={loading}
                error={error}
                onDelete={deleteProject}
              />
            </div>

            {!loading && !error && !hasData && (
              search.trim() !== "" ? (
                <ProjectsSearchEmptyState
                  query={search}
                  onClear={() => setSearch("")}
                  onCreateProject={handleCreateProject}
                />
              ) : (
                <ProjectsEmptyState
                  onCreateProject={handleCreateProject}
                />
              )
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
