"use client"

import * as React from "react"
import { AppSidebar } from "@/pages/dashboard/admin/components/sidebar-admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useActivityLogs } from "@/features/activity-logs/hooks/use-activity-logs"
import { ActivityLogsToolbar } from "@/features/activity-logs/components/activity-logs-toolbar"
import { ActivityLogsTable } from "@/features/activity-logs/components/activity-logs-table"
import { DeleteActivityLogDialog } from "@/features/activity-logs/components/delete-activity-log-dialog"
import {
  ActivityLogsSearchEmptyState,
  ActivityLogsEmptyState,
} from "@/features/activity-logs/components/activity-logs-empty-state"

const AdminActivityLogsPage: React.FC = () => {
  const {
    loading,
    error,
    search,
    cols,
    isDeleteDialogOpen,
    logToDelete,
    isDeleting,
    filteredLogs,
    visibleColCount,
    refetch,
    handleSearchChange,
    handleToggleColumn,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteLog,
    pagination,
    page,
    pageSize,
    setPage,
    setPageSize,
  } = useActivityLogs()

  const hasData = filteredLogs.length > 0

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
                        Activity Logs
                      </h1>
                      <p className="text-muted-foreground">
                        Riwayat aktivitas pengguna di seluruh
                        sistem.
                      </p>
                    </div>
                  </div>
                </div>

                <ActivityLogsToolbar
                  search={search}
                  cols={cols}
                  onSearchChange={handleSearchChange}
                  onToggleColumn={handleToggleColumn}
                  onRefresh={refetch}
                />

                <ActivityLogsTable
                  filteredLogs={filteredLogs}
                  loading={loading}
                  error={error}
                  cols={cols}
                  visibleColCount={visibleColCount}
                  onDeleteClick={openDeleteDialog}
                  pagination={pagination}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />

                {!loading && !error && !hasData && (
                  search.trim() !== "" ? (
                    <ActivityLogsSearchEmptyState
                      query={search}
                      onClear={() => handleSearchChange("")}
                    />
                  ) : (
                    <ActivityLogsEmptyState />
                  )
                )}
              </div>
            </div>
          </div>

          <DeleteActivityLogDialog
            open={isDeleteDialogOpen}
            isDeleting={isDeleting}
            logToDelete={logToDelete}
            onOpenChange={(open) =>
              open ? null : closeDeleteDialog()
            }
            onConfirm={handleDeleteLog}
          />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default AdminActivityLogsPage
