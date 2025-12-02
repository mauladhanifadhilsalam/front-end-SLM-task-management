"use client"

import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"

import { EditTicketForm } from "./edit-ticket-form"
import { useEditTicketFormPm } from "../hooks/use-edit-ticket-form-pm"

export default function EditTicketFormPmPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const ticketId = params.id

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
  } = useEditTicketFormPm(ticketId)

  return (
    <EditTicketForm
      form={form}
      fieldErrors={fieldErrors}
      projects={projects}
      requesters={requesters}
      loading={loading}
      loadingOptions={loadingOptions}
      saving={saving}
      error={error}
      onBack={() => navigate(-1)}
      onChange={handleChange}
      onSubmit={(e) =>
        handleSubmit(e, () => {
          navigate(-1)
        })
      }
      isPm
    />
  )
}
