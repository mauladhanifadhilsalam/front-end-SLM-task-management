"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAdminUsers } from "@/features/users/hooks/use-admin-user"
import { UsersToolbar } from "@/features/users/components/users-toolbar"
import { UsersTable } from "@/features/users/components/users-table"

export default function AdminUsers() {
  const navigate = useNavigate()

  const {
    users,
    loading,
    error,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    columns,
    toggleColumn,
    handleDeleteUser,
    pagination,
    page,
    pageSize,
    setPage,
    setPageSize,
  } = useAdminUsers()

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
                      <h1 className="text-2xl font-semibold">Data Users</h1>
                      <p className="text-muted-foreground">
                        Kelola users di sini.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-4 lg:px-6">
                  <UsersToolbar
                    search={search}
                    onSearchChange={setSearch}
                    roleFilter={roleFilter}
                    onRoleFilterChange={setRoleFilter}
                    columns={columns}
                    onToggleColumn={toggleColumn}
                    onAddUser={() =>
                      navigate("/admin/dashboard/users/create")
                    }
                  />

                  <UsersTable
                    users={users}
                    columns={columns}
                    loading={loading}
                    error={error}
                    onDeleteUser={handleDeleteUser}
                    pagination={pagination}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                  />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
