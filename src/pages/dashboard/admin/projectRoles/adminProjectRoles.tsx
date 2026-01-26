"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { AppSidebar } from "../components/sidebar-admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminProjectRoleToolbar } from "@/features/project-roles/components/admin-project-role-toolbar"
import { AdminProjectRoleTable } from "@/features/project-roles/components/admin-project-role-table"
import { useAdminProjectRoles } from "@/features/project-roles/hooks/use-admin-project-roles"
import {
  ProjectRolesSearchEmptyState,
  ProjectRolesEmptyState,
} from "@/features/project-roles/components/project-roles-empty-state"

const AdminProjectRolesPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    projectRoles,
    loading,
    error,
    search,
    setSearch,
    columns,
    toggleColumn,
    handleDeleteProjectRole,
    pagination,
    page,
    pageSize,
    setPage,
    setPageSize,
  } = useAdminProjectRoles()

  const hasData = projectRoles.length > 0

  const handleCreateRole = () => {
    navigate("/admin/dashboard/project-roles/create")
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
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold">Project Roles</h1>
                      <p className="text-muted-foreground">
                        Manage developer project roles
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-4 lg:px-6">
                  <AdminProjectRoleToolbar
                    query={search}
                    onQueryChange={setSearch}
                    cols={columns}
                    onToggleColumn={toggleColumn}
                    onCreateClick={handleCreateRole}
                  />
                  <AdminProjectRoleTable
                    projectRoles={projectRoles}
                    loading={loading}
                    error={error}
                    columns={columns}
                    onDeleteProjectRole={handleDeleteProjectRole}
                    pagination={pagination}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                  />

                  {!loading && !error && !hasData && (
                    search.trim() !== "" ? (
                      <ProjectRolesSearchEmptyState
                        query={search}
                        onClear={() => setSearch("")}
                        onAddRole={handleCreateRole}
                      />
                    ) : (
                      <ProjectRolesEmptyState onAddRole={handleCreateRole} />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default AdminProjectRolesPage
