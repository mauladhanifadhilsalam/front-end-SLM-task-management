"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type {
  CreateTicketAssigneeInput,
  Project,
  Ticket,
  User,
} from "@/schemas/ticket-assignee.schema"
import { FormErrorAlert } from "./form-error-alert"

type ValidationErrors = Partial<Record<keyof CreateTicketAssigneeInput, string>>

type FormState = {
  projectId?: number
  ticketId?: number
  userIds: number[]
}

type CreateTicketAssigneeFormProps = {
  loading: boolean
  errorMsg: string | null
  validationErrors: ValidationErrors
  formData: FormState
  projects: Project[]
  tickets: Ticket[]
  projectUsers: User[]
  isUserAssigned: (userId: number) => boolean
  onProjectChange: (projectId: number) => void
  onTicketChange: (ticketId: number) => void
  onToggleUser: (userId: number) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

export function CreateTicketAssigneeForm({
  loading,
  errorMsg,
  validationErrors,
  formData,
  projects,
  tickets,
  projectUsers,
  isUserAssigned,
  onProjectChange,
  onTicketChange,
  onToggleUser,
  onSubmit,
  onCancel,
}: CreateTicketAssigneeFormProps) {
  return (
    <Card className="shadow-sm border rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl">Ticket Assignee</CardTitle>
        <CardDescription>
          Pilih project, lalu ticket dan user yang ingin ditugaskan.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <FormErrorAlert message={errorMsg} />

          <div className="space-y-2">
            <Label>Project *</Label>
            <Select
              value={formData.projectId?.toString()}
              onValueChange={(value) => onProjectChange(parseInt(value, 10))}
              disabled={loading}
            >
              <SelectTrigger className="w-[500px] rounded-lg">
                <SelectValue placeholder="Pilih Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.projectId && (
              <p className="text-xs text-red-600 mt-1">
                {validationErrors.projectId}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Ticket *</Label>
            <Select
              value={formData.ticketId?.toString()}
              onValueChange={(value) => onTicketChange(parseInt(value, 10))}
              disabled={!formData.projectId || loading || tickets.length === 0}
            >
              <SelectTrigger className="w-[500px] rounded-lg">
                <SelectValue
                  placeholder={
                    !formData.projectId
                      ? "Pilih project terlebih dahulu"
                      : tickets.length === 0
                      ? "Tidak ada ticket di project ini"
                      : "Pilih Ticket"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {tickets.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    Tidak ada ticket di project ini
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <SelectItem key={ticket.id} value={ticket.id.toString()}>
                      {ticket.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {validationErrors.ticketId && (
              <p className="text-xs text-red-600 mt-1">
                {validationErrors.ticketId}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Assignees *</Label>

            <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto bg-background/40 shadow-inner">
              {projectUsers.length === 0 && formData.projectId && (
                <p className="text-xs text-muted-foreground">
                  Tidak ada user yang terdaftar dalam project ini.
                </p>
              )}

              {projectUsers.map((user) => {
                const alreadyAssigned = isUserAssigned(user.id)
                const checked =
                  formData.userIds.includes(user.id) || alreadyAssigned

                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition ${
                      alreadyAssigned
                        ? "opacity-60 cursor-not-allowed bg-muted/60"
                        : "hover:bg-muted/40 cursor-pointer"
                    }`}
                    onClick={() => onToggleUser(user.id)}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleUser(user.id)}
                      disabled={alreadyAssigned || loading}
                      className="h-4 w-4"
                    />

                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {user.fullName}
                        {alreadyAssigned && (
                          <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-[2px] rounded-full">
                            Already Assigned
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="text-xs text-muted-foreground">
              {formData.userIds.length} user dipilih.
            </p>
            {validationErrors.userIds && (
              <p className="text-xs text-red-600 mt-1">
                {validationErrors.userIds}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-lg">
              <Check className="mr-2 h-4 w-4" />
              {loading ? "Menyimpan..." : "Assign Ticket"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
