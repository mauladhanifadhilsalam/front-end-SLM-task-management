"use client"

import * as React from "react"
import {
  useEditTicketForm,
  type UiEditTicketForm,
} from "./use-edit-ticket-form"


export function useEditTicketFormPm(ticketId?: string) {
  const base = useEditTicketForm(ticketId)

  const handleChangePm = React.useCallback(
    (field: keyof UiEditTicketForm, value: string) => {

      if (field === "requesterId" || field === "type") {
        return
      }
      base.handleChange(field, value)
    },
    [base.handleChange],
  )

  return {
    ...base,
    handleChange: handleChangePm,
  }
}
