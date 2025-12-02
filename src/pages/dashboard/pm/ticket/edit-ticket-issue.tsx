"use client"

import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"

import { AppSidebarPm } from "../components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useEditTicketFormPm } from "@/features/ticket/hooks/use-edit-ticket-form-pm"
import { EditTicketForm } from "@/features/ticket/components/edit-ticket-form"

export default function EditTicketsPm() {
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
  } = useEditTicketFormPm(id)

  const handleBack = () => {

    navigate("/project-manager/dashboard/ticket-issue")
  }

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, () => navigate("/project-manager/dashboard/ticket-issue"))
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
