"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAdminProjects } from "@/features/projects/hooks/use-admin-projects"
import { ProjectsToolbar } from "@/features/projects/components/projects-toolbar"
import { ProjectsTable } from "@/features/projects/components/projects-table"
import {
  ProjectsEmptyState,
  ProjectsSearchEmptyState,
} from "@/features/projects/components/projecs-empty-state"
import { downloadProjectReport } from "@/services/project.service"
import { Button } from "@/components/ui/button"
import { IconPlus } from "@tabler/icons-react"

export default function AdminProjects() {
  const navigate = useNavigate()

  const {
    filteredProjects,
    loading,
    error,
    search,
    statusFilter,
    columns,
    colSpan,
    setSearch,
    setStatusFilter,
    toggleColumn,
    deleteProject,
  } = useAdminProjects()

  const [downloadingReport, setDownloadingReport] = React.useState(false)

  const hasData = filteredProjects.length > 0

  const handleCreateProject = () => {
    navigate("/admin/dashboard/projects/create")
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
    <div className="w-full overflow-x-hidden">
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

          {/* Prevent content overflow */}
          <div className="flex flex-1 flex-col overflow-x-hidden">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6 overflow-x-hidden">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold">Daftar Project</h1>
                    <p className="text-muted-foreground pt-2">
                      Lihat dan kelola semua project aktif.
                    </p>
                  </div>
                  <Button
                    onClick={handleCreateProject}
                    className="shrink-0 w-full sm:w-auto"
                  >
                    <IconPlus className="mr-2 h-4 w-4" />
                    Tambah Project
                  </Button>
                </div>

                {/* Toolbar */}
                <ProjectsToolbar
                  search={search}
                  statusFilter={statusFilter}
                  columns={columns}
                  onSearchChange={setSearch}
                  onStatusFilterChange={setStatusFilter}
                  onToggleColumn={toggleColumn}
                  onDownloadReport={handleDownloadReport}
                  downloadDisabled={downloadingReport}
                />

                {/* Table wrapper to avoid horizontal scroll */}
                <div className="w-full overflow-x-auto">
                  <ProjectsTable
                    projects={filteredProjects}
                    loading={loading}
                    error={error}
                    columns={columns}
                    colSpan={colSpan}
                    onDelete={deleteProject}
                  />
                </div>

                {/* Empty state */}
                {!loading && !error && !hasData &&
                  (search.trim() !== "" ? (
                    <ProjectsSearchEmptyState
                      query={search}
                      onClear={() => setSearch("")}
                      onCreateProject={handleCreateProject}
                    />
                  ) : (
                    <ProjectsEmptyState
                      onCreateProject={handleCreateProject}
                    />
                  ))}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
