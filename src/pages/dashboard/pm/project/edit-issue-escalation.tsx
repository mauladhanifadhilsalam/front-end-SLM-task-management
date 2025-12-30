// src/pages/project-manager/edit-issue.tsx

"use client"

import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"

import { AppSidebarPm } from "../components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useEditTicketFormPm } from "@/features/ticket/hooks/use-edit-ticket-form-pm"
import { EditTicketForm } from "@/features/ticket/components/edit-ticket-form"

export default function EditIssuePage() {
  const navigate = useNavigate()
  const { projectId, issueId } = useParams<{ projectId: string; issueId: string }>()

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
  } = useEditTicketFormPm(issueId)

  const handleBack = () => {
    navigate(`/project-manager/dashboard/projects/${projectId}/issues`)
  }

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, () => navigate(`/project-manager/dashboard/projects/${projectId}/issues`))
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
        <AppSidebarPm variant="inset" />
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
            isPm
          />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}