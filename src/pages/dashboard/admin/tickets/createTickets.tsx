
"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useCreateTicketForm } from "@/features/ticket/hooks/use-create-ticket-form"
import { CreateTicketForm } from "@/features/ticket/components/create-ticket-form"

export default function CreateTicketPage() {
  const navigate = useNavigate()
  const {
    form,
    fieldErrors,
    projects,
    requesters,
    loadingOptions,
    saving,
    error,
    handleChange,
    handleSubmit,
  } = useCreateTicketForm()

  const handleBack = () => {
    navigate("/admin/dashboard/tickets")
  }

  const onSubmit = handleSubmit(() => {
    navigate("/admin/dashboard/tickets")
  })

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
          <CreateTicketForm
            form={form}
            fieldErrors={fieldErrors}
            projects={projects}
            requesters={requesters}
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
