"use client"

import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { AppSidebarPm } from "../components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { IconArrowLeft, IconEdit } from "@tabler/icons-react"
import { useProjectDetail } from "@/features/projects/hooks/use-project-detail"
import { ProjectDetailCard } from "@/features/projects/components/project-detail-card"
import { ProjectDeleteDialog } from "@/features/projects/components/project-delete-dialog"
import { ProjectPhasesOverview } from "@/features/projects/components/project-phases-overview"
import { ProjectAssignmentsOverview } from "@/features/projects/components/project-assignments-overview"
export default function ViewProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { project, loading, deleting, error, handleDelete, refetch } =
    useProjectDetail(id)

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
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/project-manager/dashboard/projects")}
              className="flex items-center gap-2"
            >
              <IconArrowLeft className="h-4 w-4" />
              Kembali
            </Button>

            <div className="ml-auto flex items-center gap-2">
              {project && (
                <Link
                  to={`/project-manager/dashboard/projects/edit/${project.id}`}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <IconEdit className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
              )}

              {project && (
                <ProjectDeleteDialog
                  projectId={project.id}
                  projectName={project.name}
                  onConfirm={handleDelete}
                  disabled={deleting}
                  variant="button"
                />
              )}
            </div>
          </div>

          <h1 className="text-2xl font-semibold mb-2">Detail Project</h1>
          <p className="text-muted-foreground mb-6">
            Lihat informasi lengkap project yang sedang dikelola.
          </p>

          {loading && <div className="p-6">Memuat data...</div>}
          {!loading && error && (
            <div className="p-6 text-red-600">{error}</div>
          )}
          {!loading && !error && !project && (
            <div className="p-6">Project tidak ditemukan.</div>
          )}

          {!loading && !error && project && (
            <>
              <ProjectDetailCard project={project} />
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <ProjectPhasesOverview phases={project.phases ?? []} />
                <ProjectAssignmentsOverview
                  assignments={project.assignments ?? []}
                />
              </div>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
