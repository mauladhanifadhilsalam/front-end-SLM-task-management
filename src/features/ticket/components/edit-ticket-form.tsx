"use client"

import * as React from "react"
import { IconArrowLeft, IconCheck } from "@tabler/icons-react"

import { MarkdownEditor } from "@/components/markdown-editor"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { EditTicketField } from "@/schemas/tickets.schema"
import type { UiEditTicketForm } from "../hooks/use-edit-ticket-form"
import type {
  TicketFormProjectOption,
  TicketFormRequesterOption,
} from "@/services/ticket.service"

type Props = {
  form: UiEditTicketForm
  fieldErrors: Partial<Record<EditTicketField, string>>
  projects: TicketFormProjectOption[]
  requesters: TicketFormRequesterOption[]
  loading: boolean
  loadingOptions: boolean
  saving: boolean
  error: string | null
  onBack: () => void
  onChange: (field: keyof UiEditTicketForm, value: string) => void
  onSubmit: (e: React.FormEvent) => void

  /** mode PM: requester + type di-disable */
  isPm?: boolean
}

export function EditTicketForm({
  form,
  fieldErrors,
  projects,
  requesters,
  loading,
  loadingOptions,
  saving,
  error,
  onBack,
  onChange,
  onSubmit,
  isPm = false,
}: Props) {
  // Helper untuk mendapatkan nama project
  const selectedProject = React.useMemo(() => {
    return projects.find((p) => String(p.id) === form.projectId)
  }, [projects, form.projectId])

  // Helper untuk mendapatkan nama requester
  const selectedRequester = React.useMemo(() => {
    return requesters.find((r) => String(r.id) === form.requesterId)
  }, [requesters, form.requesterId])

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="mb-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <IconArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <h1 className="text-2xl font-semibold">
            {loading ? "Loading..." : "Edit Ticket"}
          </h1>
          <p className="text-muted-foreground">
            Ubah detail ticket lalu simpan.
          </p>
        </div>

        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Information</CardTitle>
              <CardDescription>Edit fields you need to update</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-6" noValidate>
                {/* Project & Requester - DISABLED */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Project *</Label>
                    <Select
                      value={form.projectId}
                      onValueChange={(v) => onChange("projectId", v)}
                      disabled={true}
                    >
                      <SelectTrigger className="w-full max-w-full items-start py-2">
                        <SelectValue
                          className="whitespace-normal break-words text-left leading-snug"
                          placeholder={
                            loadingOptions
                              ? "Loading projects…"
                              : loading
                              ? "Loading ticket…"
                              : "Select a project"
                          }
                        >
                          {selectedProject
                            ? `${selectedProject.name} (#${selectedProject.id})`
                            : form.projectId
                            ? `Project #${form.projectId}`
                            : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="min-w-[320px] max-w-[90vw] overflow-auto">
                        {loadingOptions ? (
                          <div className="p-2 text-xs text-muted-foreground">
                            Loading projects…
                          </div>
                        ) : (
                          projects.map((p) => (
                            <SelectItem
                              key={p.id}
                              value={String(p.id)}
                              className="whitespace-normal leading-snug text-left"
                            >
                              {p.name} (#{p.id})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {fieldErrors.projectId && (
                      <p className="mt-1 text-xs text-red-600">
                        {fieldErrors.projectId}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Requester *</Label>
                    <Select
                      value={form.requesterId}
                      onValueChange={(v) => onChange("requesterId", v)}
                      disabled={true}
                    >
                      <SelectTrigger className="w-full max-w-full items-start py-2">
                        <SelectValue
                          className="whitespace-normal break-words text-left leading-snug"
                          placeholder={
                            loadingOptions
                              ? "Loading requesters…"
                              : loading
                              ? "Loading ticket…"
                              : "Select a requester"
                          }
                        >
                          {selectedRequester
                            ? `${selectedRequester.name} (#${selectedRequester.id})`
                            : form.requesterId
                            ? `User #${form.requesterId}`
                            : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="min-w-[320px] max-w-[90vw] max-h-64 overflow-auto">
                        {loadingOptions ? (
                          <div className="p-2 text-xs text-muted-foreground">
                            Loading requesters…
                          </div>
                        ) : (
                          requesters.map((r) => (
                            <SelectItem
                              key={r.id}
                              value={String(r.id)}
                              className="whitespace-normal leading-snug text-left"
                            >
                              {r.name} (#{r.id})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {fieldErrors.requesterId && (
                      <p className="mt-1 text-xs text-red-600">
                        {fieldErrors.requesterId}
                      </p>
                    )}
                  </div>
                </div>

                {/* Type / Priority / Status */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select
                      value={form.type}
                      onValueChange={(v) => onChange("type", v)}
                      disabled={saving || loading || isPm}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {(["ISSUE", "TASK"] as const).map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.type && (
                      <p className="mt-1 text-xs text-red-600">
                        {fieldErrors.type}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Priority *</Label>
                    <Select
                      value={form.priority}
                      onValueChange={(v) => onChange("priority", v)}
                      disabled={saving || loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map(
                          (p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    {fieldErrors.priority && (
                      <p className="mt-1 text-xs text-red-600">
                        {fieldErrors.priority}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) => onChange("status", v)}
                      disabled={saving || loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          [
                            "NEW",
                            "TO_DO",
                            "IN_PROGRESS",
                            "IN_REVIEW",
                            "DONE",
                            "RESOLVED",
                            "CLOSED",
                          ] as const
                        ).map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.status && (
                      <p className="mt-1 text-xs text-red-600">
                        {fieldErrors.status}
                      </p>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Contoh: Fix login redirect issue"
                    value={form.title}
                    onChange={(e) => onChange("title", e.target.value)}
                    disabled={saving || loading}
                    aria-invalid={!!fieldErrors.title}
                    required
                  />
                  {fieldErrors.title && (
                    <p className="mt-1 text-xs text-red-600">
                      {fieldErrors.title}
                    </p>
                  )}
                </div>

                {/* Description */}
                <MarkdownEditor
                  label="Description *"
                  value={form.description}
                  onChange={(v) => onChange("description", v)}
                  helperText="Supports GitHub-style Markdown: **bold**, _italic_, ## heading, - list, `code`, dll."
                  error={fieldErrors.description}
                  disabled={saving || loading}
                  placeholder="Use Markdown to format your description..."
                />

                {/* Action Plan */}
                <div className="space-y-2">
                  <MarkdownEditor
                    label="Action Plan"
                    value={form.actionPlan || ""}
                    onChange={(v) => onChange("actionPlan", v)}
                    error={fieldErrors.actionPlan}
                    disabled={saving || loading}
                    placeholder="Describe the action plan to resolve this issue (optional)..."
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={form.startDate}
                      onChange={(e) => onChange("startDate", e.target.value)}
                      disabled={saving || loading}
                      aria-invalid={!!fieldErrors.startDate}
                      required
                    />
                    {fieldErrors.startDate && (
                      <p className="mt-1 text-xs text-red-600">
                        {fieldErrors.startDate}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={form.dueDate}
                      onChange={(e) => onChange("dueDate", e.target.value)}
                      disabled={saving || loading}
                      aria-invalid={!!fieldErrors.dueDate}
                      min={form.startDate || undefined}
                      required
                    />
                    {fieldErrors.dueDate && (
                      <p className="mt-1 text-xs text-red-600">
                        {fieldErrors.dueDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving || loading}>
                    <IconCheck className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}