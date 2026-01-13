"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { AppSidebar } from "@/pages/dashboard/admin/components/sidebar-admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAdminFileAttachments } from "@/features/file-attachments/hooks/use-admin-file-attachment"
import { AdminFileAttachmentsGrid } from "@/features/file-attachments/components/admin-file-attachments-grid"
import { FileAttachmentPreviewDialog } from "@/features/file-attachments/components/file-attachment-preview-dialog"

export default function AdminFileAttachments() {
  const navigate = useNavigate()

  const {
    attachments,
    loading,
    error,
    previewOpen,
    previewItem,
    openPreview,
    closePreview,
    handleDelete,
    handleDownload,
  } = useAdminFileAttachments()

  const handleCreate = () => {
    navigate("/admin/dashboard/file-attachments/create")
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

        <AdminFileAttachmentsGrid
          attachments={attachments}
          loading={loading}
          error={error}
          onCreateClick={handleCreate}
          onPreview={openPreview}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />

        <FileAttachmentPreviewDialog
          open={previewOpen}
          onOpenChange={(open) => {
            if (!open) closePreview()
          }}
          attachment={previewItem}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
