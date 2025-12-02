
"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"

import { AppSidebarPm } from "../components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useCreateTicketIssueForm } from "@/features/ticket/hooks/use-create-ticket-issue-form"
import { CreateTicketIssueForm } from "@/features/ticket/components/create-ticket-issue-form"

export default function CreateTicketPage() {
  const navigate = useNavigate()
  const {
    form,
    fieldErrors,
    projects,
    requesterLabel,
    loadingOptions,
    saving,
    error,
    handleChange,
    handleSubmit,
  } = useCreateTicketIssueForm()

  const handleBack = () => {
    navigate("/project-manager/dashboard/ticket-issue")
  }

  const onSubmit = handleSubmit(() => {
    navigate("/project-manager/dashboard/ticket-issue")
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
        <AppSidebarPm variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <CreateTicketIssueForm
            form={form}
            fieldErrors={fieldErrors}
            projects={projects}
            requesterLabel={requesterLabel}
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
