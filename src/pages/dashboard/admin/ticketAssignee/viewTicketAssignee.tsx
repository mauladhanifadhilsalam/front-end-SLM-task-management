"use client"

import * as React from "react"
import { useViewTicketAssignee } from "@/features/ticket-assignee/hooks/use-view-ticket-assignee"
import { ViewTicketAssigneeLayout } from "@/features/ticket-assignee/components/view-ticket-assignee"

export default function ViewTicketAssigneePage() {
  const {
    ticket,
    loading,
    error,
    deleting,
    handleBack,
    handleEdit,
    handleConfirmDelete,
  } = useViewTicketAssignee()

  return (
    <ViewTicketAssigneeLayout
      ticket={ticket}
      loading={loading}
      error={error}
      deleting={deleting}
      onBack={handleBack}
      onEdit={handleEdit}
      onConfirmDelete={handleConfirmDelete}
    />
  )
}
