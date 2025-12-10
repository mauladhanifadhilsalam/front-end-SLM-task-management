"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAdminNotifications } from "@/features/notification/hooks/use-admin-notifications"
import { AdminNotificationsTable } from "@/features/notification/components/admin-notifications-table"
  
export default function AdminNotificationPage() {
  const {
    search,
    setSearch,
    stateFilter,
    setStateFilter,
    cols,
    toggleColumn,
    loading,
    error,
    notifications,
    formatDate,
    stateBadgeVariant,
    stateLabel,
    notifyStatusVariant,
    notifyStatusLabel,
    targetLabel,
    deleteDialogOpen,
    deleting,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    handleResend,
    pagination,
    page,
    pageSize,
    setPage,
    setPageSize,
  } = useAdminNotifications()

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
        <AdminNotificationsTable
          search={search}
          onSearchChange={setSearch}
          stateFilter={stateFilter}
          onStateFilterChange={setStateFilter}
          cols={cols}
          onToggleColumn={toggleColumn}
          loading={loading}
          error={error}
          notifications={notifications}
          pagination={pagination}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          formatDate={formatDate}
          stateBadgeVariant={stateBadgeVariant}
          stateLabel={stateLabel}
          notifyStatusVariant={notifyStatusVariant}
          notifyStatusLabel={notifyStatusLabel}
          targetLabel={targetLabel}
          onDeleteClick={openDeleteDialog}
          deleteDialogOpen={deleteDialogOpen}
          deleting={deleting}
          onDeleteConfirm={confirmDelete}
          onDeleteDialogChange={(open) => {
            if (!open) {
              closeDeleteDialog()
            }
          }}
          onResend={handleResend}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
