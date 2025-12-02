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
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-4 mb-4">
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
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-6" noValidate>
                {/* Project & Requester */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Project *</Label>
                    <Select
                      value={form.projectId}
                      onValueChange={(v) => onChange("projectId", v)}
                      disabled={saving || loading}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingOptions
                              ? form.projectId
                                ? `#${form.projectId}`
                                : "Loading projects…"
                              : "Select a project"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingOptions ? (
                          <div className="p-2 text-xs text-muted-foreground">
                            Loading projects…
                          </div>
                        ) : (
                          projects.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name} (#{p.id})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {fieldErrors.projectId && (
                      <p className="text-xs text-red-600 mt-1">
                        {fieldErrors.projectId}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Requester *
                    </Label>
                    <Select
                      value={form.requesterId}
                      onValueChange={(v) => onChange("requesterId", v)}
                      disabled={saving || loading || isPm}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingOptions
                              ? form.requesterId
                                ? `#${form.requesterId}`
                                : "Loading requesters…"
                              : "Select a requester"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingOptions ? (
                          <div className="p-2 text-xs text-muted-foreground">
                            Loading requesters…
                          </div>
                        ) : (
                          requesters.map((r) => (
                            <SelectItem key={r.id} value={String(r.id)}>
                              {r.name} (#{r.id})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {fieldErrors.requesterId && (
                      <p className="text-xs text-red-600 mt-1">
                        {fieldErrors.requesterId}
                      </p>
                    )}
                  </div>
                </div>

                {/* Type / Priority / Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>
                      Type *
                    </Label>
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
                      <p className="text-xs text-red-600 mt-1">
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
                        {(
                          ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const
                        ).map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.priority && (
                      <p className="text-xs text-red-600 mt-1">
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
                      <p className="text-xs text-red-600 mt-1">
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
                    <p className="text-xs text-red-600 mt-1">
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

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <p className="text-xs text-red-600 mt-1">
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
                      <p className="text-xs text-red-600 mt-1">
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
