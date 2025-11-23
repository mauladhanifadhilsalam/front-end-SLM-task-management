"use client"

import * as React from "react"
import { IconCheck } from "@tabler/icons-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { EditTicketAssigneeFormState, EditTicketAssigneeTicket, EditTicketAssigneeUser } from "@/types/ticket-assignee.type"

const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "TO_DO", label: "To do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "DONE", label: "Done" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
]

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
]

type EditTicketAssigneeFormProps = {
  loading: boolean
  saving: boolean
  error: string
  ticket: EditTicketAssigneeTicket | null
  users: EditTicketAssigneeUser[]
  form: EditTicketAssigneeFormState
  onStatusChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onToggleAssignee: (userId: number) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

export function EditTicketAssigneeForm({
  loading,
  saving,
  error,
  ticket,
  users,
  form,
  onStatusChange,
  onPriorityChange,
  onToggleAssignee,
  onSubmit,
  onCancel,
}: EditTicketAssigneeFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Penugasan Tiket</CardTitle>
        <CardDescription>
          Ubah status, priority, dan assignee tiket.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="rounded border p-6">Memuat data tiket...</div>
        ) : error ? (
          <div className="rounded border border-red-300 bg-red-50 p-4 mb-4 text-sm text-red-600">
            {error}
          </div>
        ) : !ticket ? (
          <div className="rounded border p-6">Tiket tidak ditemukan.</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Nama Tiket</Label>
                <Input value={ticket.title} disabled />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Input value={ticket.type} disabled />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={form.status}
                  onValueChange={onStatusChange}
                  disabled={saving}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={form.priority}
                  onValueChange={onPriorityChange}
                  disabled={saving}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Pilih Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assignees *</Label>
              <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer"
                      onClick={() => onToggleAssignee(user.id)}
                    >
                      <input
                        type="checkbox"
                        checked={form.assigneeIds.includes(user.id)}
                        onChange={() => onToggleAssignee(user.id)}
                        className="h-4 w-4"
                        disabled={saving}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {user.fullName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Tidak ada user tersedia
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {form.assigneeIds.length} assignee dipilih
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <IconCheck className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
