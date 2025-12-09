"use client"

import * as React from "react"
import { useParams } from "react-router-dom"

import { AppSidebarDev } from "@/pages/dashboard/dev/components/app-sidebardev"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { CreateFileAttachmentForm } from "@/features/file-attachments/components/create-file-attachment-form"
import { useCreatePmFileAttachmentForm } from "@/features/file-attachments/hooks/use-create-pm-file-attachment-form"

export default function DevAddTicketAttachment() {
  const { id } = useParams<{ id: string }>()
  const initialTicketId = id ?? ""

  const {
    ticketOptions,
    loadingTickets,
    saving,
    error,
    progress,
    file,
    preview,
    form,
    fieldErrors,
    dragOver,
    fileInputRef,
    setTicketId,
    handleFileInputChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    clearFile,
    handleSubmit,
    goBack,
  } = useCreatePmFileAttachmentForm({
    initialTicketId,
    successPath: `/developer-dashboard/ticket-issue/view/${initialTicketId}`,
    backPath: `/developer-dashboard/ticket-issue/view/${initialTicketId}`,
  })

  const handleBack = () => {
    goBack()
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
      <AppSidebarDev variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <CreateFileAttachmentForm
          ticketOptions={ticketOptions}
          loadingTickets={loadingTickets}
          saving={saving}
          error={error}
          progress={progress}
          file={file}
          preview={preview}
          dragOver={dragOver}
          fieldErrors={fieldErrors}
          onBack={handleBack}
          onTicketChange={setTicketId}
          onFileInputChange={handleFileInputChange}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClearFile={clearFile}
          onSubmit={handleSubmit}
          fileInputRef={fileInputRef}
          ticketId={form.ticketId}
          canChangeTicket={false}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
