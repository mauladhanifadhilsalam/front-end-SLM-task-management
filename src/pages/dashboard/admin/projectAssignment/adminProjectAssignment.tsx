"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAdminProjectAssignments } from "@/features/project-assignments/hooks/use-admin-project-assignments"
import { ProjectAssignmentsTable } from "@/features/project-assignments/components/project-assignments-table"

export default function AdminProjectAssignments() {
  const navigate = useNavigate()

  const {
    assignments,
    loading,
    error,
    search,
    setSearch,
    columns,
    setColumns,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleting,
    requestDelete,
    confirmDelete,
    pagination,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
  } = useAdminProjectAssignments()

  const handleCreate = () => {
    navigate("/admin/dashboard/project-assignments/create")
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold">
                      Project Assignments
                    </h1>
                    <p className="pt-2 text-muted-foreground">
                      Daftar penugasan anggota ke proyek.
                    </p>
                  </div>
                </div>
              </div>

              <ProjectAssignmentsTable
                assignments={assignments}
                loading={loading}
                error={error}
                search={search}
                setSearch={setSearch}
                columns={columns}
                setColumns={setColumns}
                onCreateClick={handleCreate}
                onRequestDelete={requestDelete}
                pagination={pagination}
                page={page}
                pageSize={pageSize}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
              />
            </div>
          </div>
        </div>

        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus assignment?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Assignment yang dihapus
                tidak bisa dipulihkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? "Menghapus..." : "Hapus"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
