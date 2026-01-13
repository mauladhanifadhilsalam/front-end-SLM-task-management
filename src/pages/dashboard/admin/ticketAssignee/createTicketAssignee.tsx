"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { AppSidebar } from "@/pages/dashboard/admin/components/sidebar-admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

import { useCreateTicketAssigneeForm } from "@/features/ticket-assignee/hooks/use-create-ticket-assignee-form"
import { CreateTicketAssigneeForm } from "@/features/ticket-assignee/components/create-ticket-assignee-form"

export default function CreateTicketAssignee() {
  const navigate = useNavigate()
  const {
    loading,
    errorMsg,
    validationErrors,
    formData,
    projects,
    tickets,
    projectUsers,
    isUserAssigned,
    handleProjectChange,
    handleTicketChange,
    toggleUser,
    handleSubmit,
  } = useCreateTicketAssigneeForm()

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
        <div className="flex flex-col px-4 lg:px-8 py-8 space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/dashboard/ticket-assignees")}
              className="flex items-center gap-2 hover:bg-accent/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">
              Assign Ticket
            </h1>
            <p className="text-muted-foreground text-sm">
              Pilih project, ticket & user untuk menerima tugas.
            </p>
          </div>

          <CreateTicketAssigneeForm
            loading={loading}
            errorMsg={errorMsg}
            validationErrors={validationErrors}
            formData={formData}
            projects={projects}
            tickets={tickets}
            projectUsers={projectUsers}
            isUserAssigned={isUserAssigned}
            onProjectChange={handleProjectChange}
            onTicketChange={handleTicketChange}
            onToggleUser={toggleUser}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/admin/dashboard/ticket-assignees")}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
