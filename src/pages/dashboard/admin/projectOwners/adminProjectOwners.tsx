"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { AppSidebar } from "@/pages/dashboard/admin/components/sidebar-admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAdminProjectOwners } from "@/features/project-owners/hooks/use-admin-project-owners"
import { ProjectOwnersToolbar } from "@/features/project-owners/components/project-owners-toolbar"
import { ProjectOwnersTable } from "@/features/project-owners/components/project-owners-table"
import { 
  ProjectOwnersSearchEmptyState,
  ProjectOwnersEmptyState } from "@/features/project-owners/components/project-owners-empty-state"

export default function AdminProjectOwners() {
  const navigate = useNavigate()

  const {
    owners,
    loading,
    error,
    search,
    setSearch,
    columns,
    colSpan,
    toggleColumn,
    deleteOwner,
    pagination,
    page,
    pageSize,
    setPage,
    setPageSize,
  } = useAdminProjectOwners()

  const hasData = owners.length > 0

  const handleAddOwner = () => {
    navigate("/admin/dashboard/project-owners/create")
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
                      <h1 className="text-2xl font-semibold">
                        Project Owners
                      </h1>
                      <p className="text-muted-foreground pt-2">
                        Daftar pemilik/project owner
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-4 lg:px-6">
                  <ProjectOwnersToolbar
                    search={search}
                    onSearchChange={setSearch}
                    columns={columns}
                    onToggleColumn={toggleColumn}
                    onAddOwner={handleAddOwner}
                  />

                  <ProjectOwnersTable
                    owners={owners}
                    loading={loading}
                    error={error}
                    columns={columns}
                    colSpan={colSpan}
                    onDeleteOwner={deleteOwner}
                    pagination={pagination}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                  />

                  {!loading && !error && !hasData && (
                    search.trim() !== "" ? (
                      <ProjectOwnersSearchEmptyState
                        query={search}
                        onClear={() => setSearch("")}
                        onAddOwner={handleAddOwner}
                      />
                    ) : (
                      <ProjectOwnersEmptyState
                        onAddOwner={handleAddOwner}
                      />
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
