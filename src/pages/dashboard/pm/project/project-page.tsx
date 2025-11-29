"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { AppSidebarPm } from "../components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAdminProjects } from "@/features/projects/hooks/use-admin-projects"
import { ProjectsToolbar } from "@/features/projects/components/projects-toolbar"
import { ProjectsCardsList } from "@/features/projects/components/projects-cards-list"
import { ProjectsEmptyState, ProjectsSearchEmptyState } from "../../../../features/projects/components/projecs-empty-state"
import { ProjectSummaryCharts } from "./project-summary-charts"

export default function AdminProjects() {
  const navigate = useNavigate()

  const {
    projects,
    filteredProjects,
    loading,
    error,
    search,
    statusFilter,
    columns,
    setSearch,
    setStatusFilter,
    toggleColumn,
    deleteProject,
  } = useAdminProjects()

  const hasData = filteredProjects.length > 0

  const handleCreateProject = () => {
    navigate("/project-manager/dashboard/projects/create")
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
        <AppSidebarPm variant="inset" />
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

            <ProjectSummaryCharts projects={projects} />

            <ProjectsToolbar
              search={search}
              statusFilter={statusFilter}
              columns={columns}
              onSearchChange={setSearch}
              onStatusFilterChange={setStatusFilter}
              onToggleColumn={toggleColumn}
              onCreateProject={handleCreateProject}
            />

            <ProjectsCardsList
                projects={filteredProjects}
                loading={loading}
                error={error}
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
