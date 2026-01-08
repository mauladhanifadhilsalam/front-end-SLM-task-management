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

import type {
  CreateTicketField,
  CreateTicketValues,
} from "@/schemas/tickets.schema"
import type { TicketFormProjectOption } from "@/services/ticket.service"

const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const
const TICKET_STATUSES = [
  "NEW",
  "TO_DO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
  "RESOLVED",
  "CLOSED",
] as const

type Props = {
  form: CreateTicketValues
  fieldErrors: Partial<Record<CreateTicketField, string>>
  projects: TicketFormProjectOption[]
  requesterLabel: string        
  loadingOptions: boolean
  saving: boolean
  error: string | null
  onBack: () => void
  onChange: (field: CreateTicketField, value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function CreateTicketIssueForm({
  form,
  fieldErrors,
  projects,
  requesterLabel,
  loadingOptions,
  saving,
  error,
  onBack,
  onChange,
  onSubmit,
}: Props) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
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
            <h1 className="text-2xl font-semibold">Create Issue Ticket</h1>
            <p className="text-muted-foreground">
              Ticket khusus <span className="font-medium">ISSUE</span>. Requester otomatis user yang sedang login.
            </p>
          </div>

          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Information</CardTitle>
                <CardDescription>Enter the details for the new issue</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-6" noValidate>
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                      {error}
                    </div>
                  )}

                  {/* Project + Type (fixed ISSUE) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Project *</Label>
                      <Select
                        value={form.projectId ? String(form.projectId) : ""}
                        onValueChange={(v) => onChange("projectId", v)}
                        disabled={saving || loadingOptions}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loadingOptions
                                ? "Loading projects..."
                                : "Select a project"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name} (#{p.id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldErrors.projectId && (
                        <p className="text-xs text-red-600 mt-1">
                          {fieldErrors.projectId}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Type *</Label>
                      <Input value="ISSUE" disabled />
                      {fieldErrors.type && (
                        <p className="text-xs text-red-600 mt-1">
                          {fieldErrors.type}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Contoh: Error 500 saat submit form login"
                      value={form.title}
                      onChange={(e) => onChange("title", e.target.value)}
                      disabled={saving}
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
                  <div className="space-y-2">
                    <MarkdownEditor
                      label="Description *"
                      value={form.description}
                      onChange={(v) => onChange("description", v)}
                      error={fieldErrors.description}
                      disabled={saving}
                      placeholder="Use Markdown to format your description..."
                    />
                  </div>

                  {/* Action Plan - TAMBAHAN BARU */}
                  <div className="space-y-2">
                    <MarkdownEditor
                      label="Action Plan"
                      value={form.actionPlan || ""}
                      onChange={(v) => onChange("actionPlan", v)}
                      error={fieldErrors.actionPlan}
                      disabled={saving}
                      placeholder="Describe the action plan to resolve this issue (optional)..."
                    />
                  </div>

                  {/* Priority & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Priority *</Label>
                      <Select
                        value={form.priority || ""}
                        onValueChange={(v) => onChange("priority", v)}
                        disabled={saving}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {TICKET_PRIORITIES.map((p) => (
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
                        value={form.status || ""}
                        onValueChange={(v) => onChange("status", v)}
                        disabled={saving}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {TICKET_STATUSES.map((s) => (
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

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={form.startDate}
                        onChange={(e) =>
                          onChange("startDate", e.target.value)
                        }
                        disabled={saving}
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
                        onChange={(e) =>
                          onChange("dueDate", e.target.value)
                        }
                        disabled={saving}
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
                    <Button type="submit" disabled={saving || loadingOptions}>
                      <IconCheck className="mr-2 h-4 w-4" />
                      {saving ? "Creating..." : "Create Issue Ticket"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}