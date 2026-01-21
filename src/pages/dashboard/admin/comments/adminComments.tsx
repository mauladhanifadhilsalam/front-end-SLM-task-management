"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { AppSidebar } from "@/pages/dashboard/admin/components/sidebar-admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminCommentToolbar } from "@/features/comment/components/admin-comment-toolbar"
import { AdminCommentTable } from "@/features/comment/components/admin-comment-table"
import { useAdminCommentList } from "@/features/comment/hooks/use-admin-comment-list"
import {
  CommentsSearchEmptyState,
  CommentsEmptyState,
} from "@/features/comment/components/comments-empty-state"

const AdminComment: React.FC = () => {
  const navigate = useNavigate()

  const {
    rows,
    loading,
    error,
    query,
    setQuery,
    cols,
    setCols,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    selectedIds,
    isRowSelected,
    toggleRow,
    currentPageAllSelected,
    toggleSelectAllOnPage,
    clearSelection,
    handleDelete,
    reload,
    pagination,
  } = useAdminCommentList()

  const handleToggleColumn = (
    key: keyof typeof cols,
    value: boolean,
  ) => {
    setCols((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const hasData = rows.length > 0

  const handleCreateComment = () => {
    navigate("/admin/dashboard/comments/create")
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
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h1 className="text-2xl font-semibold">
                        Ticket Comments
                      </h1>
                      <p className="text-muted-foreground">
                        Manage all ticket comments across projects
                      </p>
                    </div>
                  </div>
                  <AdminCommentToolbar
                    query={query}
                    onQueryChange={setQuery}
                    cols={cols}
                    onToggleColumn={handleToggleColumn}
                    onRefresh={reload}
                    onCreate={handleCreateComment}
                    selectedCount={selectedIds.size}
                    onClearSelection={clearSelection}
                  />
                </div>
                <div className="px-4 lg:px-6">
                  <AdminCommentTable
                    rows={rows}
                    loading={loading}
                    error={error}
                    cols={cols}
                    pagination={pagination}
                    page={page}
                    pageSize={rowsPerPage}
                    onPageChange={setPage}
                    onPageSizeChange={setRowsPerPage}
                    selectedIds={selectedIds}
                    isRowSelected={isRowSelected}
                    toggleRow={toggleRow}
                    currentPageAllSelected={currentPageAllSelected}
                    toggleSelectAllOnPage={toggleSelectAllOnPage}
                    onDelete={handleDelete}
                  />

                  {!loading && !error && !hasData && (
                    query.trim() !== "" ? (
                      <CommentsSearchEmptyState
                        query={query}
                        onClear={() => setQuery("")}
                        onAddComment={handleCreateComment}
                      />
                    ) : (
                      <CommentsEmptyState
                        onAddComment={handleCreateComment}
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

export default AdminComment
