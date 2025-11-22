"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useCreateFileAttachmentForm } from "@/features/file-attachments/hooks/use-create-file-attachment-form"
import { CreateFileAttachmentForm } from "@/features/file-attachments/components/create-file-attachment-form"

export default function CreateFileAttachmentPage() {
  const {
    ticketOptions,
    loadingTickets,
    saving,
    error,
    progress,
    file,
    preview,
    dragOver,
    fieldErrors,
    form,
    fileInputRef,
    setTicketId,
    handleFileInputChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    clearFile,
    handleSubmit,
    goBack,
  } = useCreateFileAttachmentForm()

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
        <CreateFileAttachmentForm
          ticketOptions={ticketOptions}
          loadingTickets={loadingTickets}
          saving={saving}
          error={error}
          progress={progress}
          ticketId={form.ticketId}
          file={file}
          preview={preview}
          dragOver={dragOver}
          fieldErrors={fieldErrors}
          onBack={goBack}
          onTicketChange={setTicketId}
          onFileInputChange={handleFileInputChange}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClearFile={clearFile}
          onSubmit={handleSubmit}
          fileInputRef={fileInputRef}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
