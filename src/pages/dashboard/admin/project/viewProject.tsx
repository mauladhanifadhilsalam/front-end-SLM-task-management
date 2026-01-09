"use client"

import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { AppSidebar } from "@/pages/dashboard/admin/components/sidebar-admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { IconArrowLeft, IconEdit } from "@tabler/icons-react"
import { RoleInProject } from "@/types/project-assignment.type"

import { useProjectDetail } from "@/features/projects/hooks/use-project-detail"
import { ProjectDetailCard } from "@/features/projects/components/project-detail-card"
import { ProjectDeleteDialog } from "@/features/projects/components/project-delete-dialog"
import { ProjectPhasesOverview } from "@/features/projects/components/project-phases-overview"
import { ProjectAssignmentsOverview } from "@/features/projects/components/project-assignments-overview"

import type { UserLite } from "@/types/user.types"
import { fetchUsers } from "@/services/user.service"
import {
  addAssignmentToProject,
} from "@/services/project.service"


import { deleteProjectAssignmentById } from "@/services/project-assignment.service"

export default function ViewProject() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const navigate = useNavigate()

  const { project, loading, deleting, error, handleDelete, refetch } =
    useProjectDetail(id)

  const [allUsers, setAllUsers] = React.useState<UserLite[]>([])
  const [savingAssignment, setSavingAssignment] = React.useState(false)

  const loadUsers = React.useCallback(async () => {
    try {
      const users = await fetchUsers()
      setAllUsers(users)
    } catch (err) {
      console.error(err)
    }
  }, [])

  React.useEffect(() => {
    loadUsers()
  }, [loadUsers])

const handleAddAssignment = async (userId: number, roleInProject: RoleInProject) => {
  try {
    setSavingAssignment(true)
    await addAssignmentToProject(projectId, userId, roleInProject)
    await refetch()
  } finally {
    setSavingAssignment(false)
  }
}


const handleRemove = async (assignmentId: number) => {
    try {
      setSavingAssignment(true)
      await deleteProjectAssignmentById(assignmentId)
      await refetch()
    } catch (err) {
      console.error(err)
    } finally {
      setSavingAssignment(false)
    }
  }

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
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/dashboard/projects")}
              className="flex items-center gap-2"
            >
              <IconArrowLeft className="h-4 w-4" />
              Kembali
            </Button>

            <div className="ml-auto flex items-center gap-2">
              {project && (
                <Link to={`/admin/dashboard/projects/edit/${project.id}`}>
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
