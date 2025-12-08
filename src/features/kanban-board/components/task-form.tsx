import { useEffect, useMemo, useState } from "react"
import { X, Loader2 } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { TicketStatus } from "@/types/project-tasks.types"
import type { UserLite } from "@/types/user.types"

export type TaskFormValues = {
  title: string
  description: string
  status: TicketStatus
  startDate: string
  dueDate: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  assigneeIds?: string[]
}

type TaskFormProps = {
  projectName?: string
  defaultStatus?: TicketStatus
  assignees?: UserLite[]
  loadingAssignees?: boolean
  submitting?: boolean
  errorMessage?: string | null
  assigneeError?: string | null
  statusLocked?: boolean
  initialValues?: Partial<TaskFormValues>
  submitLabel?: string
  onCancel: () => void
  onSubmit: (values: TaskFormValues) => Promise<void> | void
}

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "TO_DO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "DONE", label: "Done" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
]

const PRIORITY_OPTIONS: TaskFormValues["priority"][] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

function toDateTimeLocal(value?: string | null) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

type TaskFormBaseProps = TaskFormProps & {
  heading: string
  eyebrow: string
}

function TaskFormBase({
  heading,
  eyebrow,
  projectName,
  defaultStatus = "TO_DO",
  assignees = [],
  loadingAssignees = false,
  submitting = false,
  errorMessage,
  assigneeError,
  statusLocked,
  initialValues,
  submitLabel,
  onCancel,
  onSubmit,
}: TaskFormBaseProps) {
  const initialState: TaskFormValues = {
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    status: initialValues?.status ?? defaultStatus,
    startDate: initialValues?.startDate ? toDateTimeLocal(initialValues.startDate) : "",
    dueDate: initialValues?.dueDate ? toDateTimeLocal(initialValues.dueDate) : "",
    priority: initialValues?.priority ?? "MEDIUM",
    assigneeIds: initialValues?.assigneeIds ?? [],
  }

  const [values, setValues] = useState<TaskFormValues>(initialState)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof TaskFormValues, string>>>({})

  useEffect(() => {
    if (!initialValues) {
      setValues((prev) => ({ ...prev, status: defaultStatus }))
    }
  }, [defaultStatus, initialValues])

  useEffect(() => {
    if (initialValues) {
      setValues({
        title: initialValues.title ?? "",
        description: initialValues.description ?? "",
        status: initialValues.status ?? defaultStatus,
        startDate: initialValues.startDate ? toDateTimeLocal(initialValues.startDate) : "",
        dueDate: initialValues.dueDate ? toDateTimeLocal(initialValues.dueDate) : "",
        priority: initialValues.priority ?? "MEDIUM",
        assigneeIds: initialValues.assigneeIds ?? [],
      })
    }
  }, [initialValues, defaultStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: Partial<Record<keyof TaskFormValues, string>> = {}

    if (!values.title.trim()) errors.title = "Judul wajib diisi."
    if (values.description.trim().length < 10) errors.description = "Deskripsi minimal 10 karakter."
    if (!values.startDate) errors.startDate = "Tanggal mulai wajib diisi."
    if (!values.dueDate) errors.dueDate = "Deadline wajib diisi."

    if (values.startDate && values.dueDate) {
      const start = new Date(values.startDate).getTime()
      const due = new Date(values.dueDate).getTime()
      if (!Number.isNaN(start) && !Number.isNaN(due) && due < start) {
        errors.dueDate = "Deadline tidak boleh sebelum tanggal mulai."
      }
    }

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    await onSubmit(values)
  }

  const selectedAssigneeIds = useMemo(() => new Set(values.assigneeIds ?? []), [values.assigneeIds])

  return (
    <div className="rounded-2xl border border-border/70 bg-card shadow-sm max-h-[90vh] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p>
          <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
          {projectName ? <p className="text-sm text-muted-foreground">Project: {projectName}</p> : null}
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Tutup form">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 px-5 py-6 lg:grid-cols-[1.6fr_1fr] overflow-y-auto">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Judul Task</Label>
            <Input
              id="task-title"
              placeholder="Contoh: Integrasi API pembayaran"
              value={values.title}
              onChange={(e) => setValues((prev) => ({ ...prev, title: e.target.value }))}
              disabled={submitting}
              aria-invalid={!!fieldErrors.title}
            />
            {fieldErrors.title ? <p className="text-xs text-destructive">{fieldErrors.title}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Deskripsi</Label>
            <Textarea
              id="task-description"
              placeholder="Tuliskan detail task atau checklist yang perlu dikerjakan."
              rows={8}
              value={values.description}
              onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
              disabled={submitting}
              aria-invalid={!!fieldErrors.description}
              className="min-h-[180px] resize-vertical"
            />
            {fieldErrors.description ? <p className="text-xs text-destructive">{fieldErrors.description}</p> : null}
          </div>

          {errorMessage ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={onCancel} disabled={submitting}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {submitLabel}
            </Button>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border/60 bg-muted/40 p-4">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Project</p>
            <Input value={projectName || "Pilih project"} disabled />
          </div>

          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Grup/Status</p>
            <Select
              value={values.status}
              onValueChange={(v) => setValues((prev) => ({ ...prev, status: v as TicketStatus }))}
              disabled={submitting || statusLocked}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Tanggal Mulai</p>
              <Input
                type="datetime-local"
                value={values.startDate}
                onChange={(e) => setValues((prev) => ({ ...prev, startDate: e.target.value }))}
                disabled={submitting}
                aria-invalid={!!fieldErrors.startDate}
              />
              {fieldErrors.startDate ? <p className="text-[11px] text-destructive">{fieldErrors.startDate}</p> : null}
            </div>

            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Deadline</p>
              <Input
                type="datetime-local"
                min={values.startDate || undefined}
                value={values.dueDate}
                onChange={(e) => setValues((prev) => ({ ...prev, dueDate: e.target.value }))}
                disabled={submitting}
                aria-invalid={!!fieldErrors.dueDate}
              />
              {fieldErrors.dueDate ? <p className="text-[11px] text-destructive">{fieldErrors.dueDate}</p> : null}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Prioritas</p>
            <Select
              value={values.priority}
              onValueChange={(v) => setValues((prev) => ({ ...prev, priority: v as TaskFormValues["priority"] }))}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih prioritas" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Tugaskan</p>
            <div className="rounded-xl border border-border/60 bg-card/60 p-3 max-h-56 overflow-y-auto">
              {assignees.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada assignment pada project.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {assignees.map((user) => {
                    const id = String(user.id)
                    const checked = selectedAssigneeIds.has(id)
                    return (
                      <label
                        key={user.id}
                        className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-muted/60 cursor-pointer border border-border/50"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            setValues((prev) => {
                              const prevList = prev.assigneeIds ?? []
                              if (v) {
                                return { ...prev, assigneeIds: Array.from(new Set([...prevList, id])) }
                              }
                              return { ...prev, assigneeIds: prevList.filter((x) => x !== id) }
                            })
                          }}
                          disabled={submitting || loadingAssignees}
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">
                            {user.fullName || user.email || `User #${user.id}`}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{user.email || "—"}</span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
            {assigneeError ? <p className="text-[11px] text-destructive">{assigneeError}</p> : null}
          </div>
        </div>
      </form>
    </div>
  )
}

export function TaskForm(props: TaskFormProps) {
  const { submitLabel, statusLocked, ...rest } = props

  return (
    <TaskFormBase
      {...rest}
      submitLabel={submitLabel ?? "Buat Item Baru"}
      statusLocked={statusLocked ?? true}
      heading="Tambah Task Baru"
      eyebrow="Form Task"
    />
  )
}

export function TaskEditForm(props: TaskFormProps) {
  const { submitLabel, statusLocked, ...rest } = props

  return (
    <TaskFormBase
      {...rest}
      submitLabel={submitLabel ?? "Update Task"}
      statusLocked={statusLocked ?? false}
      heading="Edit Task"
      eyebrow="Edit Kanban Task"
    />
  )
}
