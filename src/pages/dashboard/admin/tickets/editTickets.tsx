
"use client"

import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"

import { AppSidebar } from "@/pages/dashboard/admin/components/sidebar-admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useEditTicketForm } from "@/features/ticket/hooks/use-edit-ticket-form"
import { EditTicketForm } from "@/features/ticket/components/edit-ticket-form"

export default function EditTickets() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const {
    form,
    fieldErrors,
    projects,
    requesters,
    loading,
    loadingOptions,
    saving,
    error,
    handleChange,
    handleSubmit,
  } = useEditTicketForm(id)

  const handleBack = () => {
    navigate("/admin/dashboard/tickets")
  }

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, () => navigate("/admin/dashboard/tickets"))
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
          <EditTicketForm
            form={form}
            fieldErrors={fieldErrors}
            projects={projects}
            requesters={requesters}
            loading={loading}
            loadingOptions={loadingOptions}
            saving={saving}
            error={error}
            onBack={handleBack}
            onChange={handleChange}
            onSubmit={onSubmit}
          />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
