"use client"

import * as React from "react"
import { ArrowLeft as IconArrowLeft } from "lucide-react"

import { useEditTicketAssignee } from "@/features/ticket-assignee/hooks/use-edit-ticket-assignee"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { EditTicketAssigneeForm } from "@/features/ticket-assignee/components/edit-ticket-assignee-form"

export default function EditTicketAssigneePage() {
  const {
    loading,
    saving,
    error,
    ticket,
    users,
    form,
    handleStatusChange,
    handlePriorityChange,
    toggleAssignee,
    handleSubmit,
    handleBack,
  } = useEditTicketAssignee()

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
        <div className="flex flex-1 flex-col px-4 lg:px-6 py-6 space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <IconArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <div>
            <h1 className="text-2xl font-semibold">Edit Ticket Assignment</h1>
            <p className="text-muted-foreground">
              {ticket ? `Edit: ${ticket.title}` : "Memuat data..."}
            </p>
          </div>

          <EditTicketAssigneeForm
            loading={loading}
            saving={saving}
            error={error}
            ticket={ticket}
            users={users}
            form={form}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onToggleAssignee={toggleAssignee}
            onSubmit={handleSubmit}
            onCancel={handleBack}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
