"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAdminProjects } from "./project/hooks/use-admin-projects"
import { ProjectsToolbar } from "./project/components/projects-toolbar"
import { ProjectsTable } from "./project/components/projects-table"
import { ProjectsEmptyState, ProjectsSearchEmptyState } from "./project/components/projecs-empty-state"
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

  const hasData = filteredProjects.length > 0

  const handleCreateProject = () => {
    navigate("/admin/dashboard/projects/create")
  }

  return (
    <div>
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

          <main className="flex flex-col flex-1 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">
                  Daftar Project
                </h1>
                <p className="text-muted-foreground">
                  Lihat dan kelola semua project aktif.
                </p>
              </div>
            </div>

            <ProjectsToolbar
              search={search}
              statusFilter={statusFilter}
              columns={columns}
              onSearchChange={setSearch}
              onStatusFilterChange={setStatusFilter}
              onToggleColumn={toggleColumn}
              onCreateProject={handleCreateProject}
            />

            <ProjectsTable
              projects={filteredProjects}
              loading={loading}
              error={error}
              columns={columns}
              colSpan={colSpan}
              onDelete={deleteProject}
            />

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
