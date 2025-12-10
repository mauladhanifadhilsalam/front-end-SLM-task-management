"use client"

import * as React from "react"
import axios from "axios"
import { toast } from "sonner"
import { z } from "zod"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  projectSchema,
  ticketSchema,
  userSchema,
  type Project,
  type Ticket,
  type User,
} from "@/schemas/ticket-assignee.schema"
import {
  createTicketAssignees,
  deleteTicketAssignee,
} from "@/services/ticket-assignee.service"

// --- helpers ---------------------------------------------------

const API_BASE = import.meta.env.VITE_API_BASE as string

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

type AssignTicketDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void

  initialProjectId?: number
  initialTicketId?: number
  initialTicketTitle?: string

  onAssigned?: () => void
}

export function AssignTicketDialog({
  open,
  onOpenChange,
  initialProjectId,
  initialTicketId,
  initialTicketTitle,
  onAssigned,
}: AssignTicketDialogProps) {
  const [projects, setProjects] = React.useState<Project[]>([])
  const [tickets, setTickets] = React.useState<Ticket[]>([])
  const [projectUsers, setProjectUsers] = React.useState<User[]>([])
  const [existingAssignees, setExistingAssignees] = React.useState<
    { assignmentId: number; user: User }[]
  >([])

  const [projectId, setProjectId] = React.useState<number | undefined>(
    initialProjectId,
  )
  const [ticketId, setTicketId] = React.useState<number | undefined>(
    initialTicketId,
  )
  const [search, setSearch] = React.useState("")
  const [selectedUserIds, setSelectedUserIds] = React.useState<number[]>([])
  const [removedAssigneeIds, setRemovedAssigneeIds] = React.useState<number[]>(
    [],
  )

  const [loading, setLoading] = React.useState(false)
  const [loadingProjects, setLoadingProjects] = React.useState(false)
  const [loadingTicketData, setLoadingTicketData] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // reset ketika modal dibuka / ditutup
  React.useEffect(() => {
    if (!open) {
      setSearch("")
      setSelectedUserIds([])
      setRemovedAssigneeIds([])
      setError(null)
      return
    }

    setProjectId(initialProjectId)
    setTicketId(initialTicketId)
  }, [open, initialProjectId, initialTicketId])

  // load projects sekali saat modal pertama kali dipakai
  React.useEffect(() => {
    if (!open) return

    const loadProjects = async () => {
      try {
        setLoadingProjects(true)
        const res = await axios.get(`${API_BASE}/projects`, {
          headers: getAuthHeaders(),
        })
        const payload = res?.data?.data ?? res?.data ?? []

        try {
          const validated = z.array(projectSchema).parse(payload ?? [])
          setProjects(validated)
        } catch {
          setProjects(payload ?? [])
        }
      } catch {
        toast.error("Gagal memuat project", {
          description: "Tidak dapat mengambil data project.",
        })
      } finally {
        setLoadingProjects(false)
      }
    }

    loadProjects()
  }, [open])

  React.useEffect(() => {
    if (!open || !projectId) {
      setTickets([])
      setProjectUsers([])
      return
    }

    const loadTicketsAndUsers = async () => {
      try {
        setLoadingTicketData(true)
        setError(null)

        const headers = getAuthHeaders()

        const [ticketRes, projectDetailRes] = await Promise.all([
          axios.get(`${API_BASE}/tickets`, {
            headers,
            params: { projectId },
          }),
          axios.get(`${API_BASE}/projects/${projectId}`, {
            headers,
          }),
        ])

        const ticketPayload = ticketRes?.data?.data ?? ticketRes?.data ?? []
        try {
          const validatedTickets = z
            .array(ticketSchema)
            .parse(ticketPayload ?? [])
          setTickets(validatedTickets)
        } catch {
          setTickets(ticketPayload ?? [])
        }

        let extractedUsers =
          (projectDetailRes.data?.assignments ?? projectDetailRes.data?.data?.assignments ?? [])
            .map((item: any) => item?.user)
            .filter(Boolean)

        if (!extractedUsers.length) {
          extractedUsers =
            (projectDetailRes.data?.members ?? projectDetailRes.data?.data?.members ?? [])
              .map((item: any) => item?.user ?? item)
              .filter(Boolean)
        }

        try {
          const validatedUsers = z.array(userSchema).parse(extractedUsers)
          setProjectUsers(validatedUsers)
        } catch {
          setProjectUsers(extractedUsers)
        }
      } catch {
        setError("Gagal memuat ticket atau anggota project.")
      } finally {
        setLoadingTicketData(false)
      }
    }

    loadTicketsAndUsers()
  }, [open, projectId])

  React.useEffect(() => {
    if (!open || !ticketId) {
      setExistingAssignees([])
      setRemovedAssigneeIds([])
      return
    }

    const loadTicketDetail = async () => {
      try {
        const res = await axios.get(`${API_BASE}/tickets/${ticketId}`, {
          headers: getAuthHeaders(),
        })

        const payload = res?.data?.data ?? res?.data
        try {
          const validated = ticketSchema.parse(payload)
          const list =
            (validated.assignees ?? []).map((a: any) => ({
              assignmentId: Number(a.id),
              user: a.user,
            })) ?? []
          setExistingAssignees(list)
          setRemovedAssigneeIds([])
        } catch {
          const raw = payload ?? {}
          const list =
            (raw?.assignees ?? []).map((a: any) => ({
              assignmentId: Number(a.id),
              user: a.user,
            })) ?? []
          setExistingAssignees(list.filter((x: any) => x.assignmentId && x.user))
          setRemovedAssigneeIds([])
        }
      } catch {
        setExistingAssignees([])
        setRemovedAssigneeIds([])
      }
    }

    loadTicketDetail()
  }, [open, ticketId])

  const toggleUser = (userId: number) => {
    const existing = existingAssignees.find(
      (a) => Number(a.user.id) === Number(userId),
    )

    if (existing) {
      setRemovedAssigneeIds((prev) =>
        prev.includes(existing.assignmentId)
          ? prev.filter((id) => id !== existing.assignmentId)
          : [...prev, existing.assignmentId],
      )
      return
    }

    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    )
  }

  const filteredUsers = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return projectUsers
    return projectUsers.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    )
  }, [projectUsers, search])

  const handleAssign = async () => {
    if (!projectId) {
      toast.error("Project belum dipilih")
      return
    }
    if (!ticketId) {
      toast.error("Ticket belum dipilih")
      return
    }
    if (selectedUserIds.length === 0) {
      const willRemove = removedAssigneeIds.length > 0
      if (!willRemove) {
        toast.error("Tidak ada perubahan assignee", {
          description: "Pilih atau hapus minimal satu user.",
        })
        return
      }
    }

    const toRemove = existingAssignees.filter((a) =>
      removedAssigneeIds.includes(a.assignmentId),
    )
    const toAdd = selectedUserIds

    try {
      setLoading(true)
      setError(null)

      for (const assignee of toRemove) {
        await deleteTicketAssignee(assignee.assignmentId)
      }

      if (toAdd.length > 0) {
        await createTicketAssignees(ticketId, toAdd)
      }

      toast.success("Perubahan assignee tersimpan")

      onAssigned?.()
      onOpenChange(false)
      setSelectedUserIds([])
      setRemovedAssigneeIds([])
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Gagal assign ticket."
      setError(msg)
      toast.error("Gagal assign ticket", { description: msg })
    } finally {
      setLoading(false)
    }
  }

  const selectedTicketTitle =
    tickets.find((t) => t.id === ticketId)?.title || initialTicketTitle || ""

  const projectSelectValue = projectId ? String(projectId) : undefined
  const ticketSelectValue = ticketId ? String(ticketId) : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Ticket</DialogTitle>
          <DialogDescription>
            Pilih project, ticket, dan user yang akan di-assign.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <p className="text-xs text-destructive bg-destructive/5 border border-destructive/40 rounded-md p-2">
              {error}
            </p>
          )}

          {/* Project */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium">
              Project <span className="text-destructive">*</span>
            </p>

            <Select
              value={projectSelectValue}
              onValueChange={(value) => {
                const v = value ? Number(value) : undefined
                setProjectId(v)
                setTicketId(undefined)
                setSelectedUserIds([])
              }}
              disabled={loadingProjects || loading}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue
                  placeholder={
                    loadingProjects ? "Memuat project..." : "Pilih project"
                  }
                />
              </SelectTrigger>
              <SelectContent side="bottom" align="start" className="max-h-64">
                {projects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ticket */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium">
              Ticket <span className="text-destructive">*</span>
            </p>

            <Select
              value={ticketSelectValue}
              onValueChange={(value) => {
                const v = value ? Number(value) : undefined
                setTicketId(v)
                setSelectedUserIds([])
              }}
              disabled={
                !projectId || loadingTicketData || loading || tickets.length === 0
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue
                  placeholder={
                    !projectId
                      ? "Pilih project terlebih dahulu"
                      : loadingTicketData
                        ? "Memuat ticket..."
                        : tickets.length === 0
                          ? "Tidak ada ticket di project ini"
                          : "Pilih ticket"
                  }
                />
              </SelectTrigger>
              <SelectContent  side="bottom" align="start" className="max-h-64">
                {tickets.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTicketTitle && (
              <p className="text-[10px] text-muted-foreground">
                Ticket: {selectedTicketTitle}
              </p>
            )}
          </div>

          {/* User search + list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium">
                Assignees <span className="text-destructive">*</span>
              </p>
              <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                <span>{selectedUserIds.length} akan ditambahkan</span>
                {removedAssigneeIds.length > 0 && (
                  <span className="text-destructive">
                    {removedAssigneeIds.length} akan dihapus
                  </span>
                )}
              </div>
            </div>

            <Input
              placeholder="Type or choose a user"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={!projectId || loadingTicketData || loading}
              className="h-8 text-xs"
            />

            <div className="border rounded-md bg-muted/30 overflow-hidden">
              <ScrollArea className="h-64">
                <div className="p-1.5 space-y-1 pr-2">
                  {!projectId && (
                    <p className="px-1 py-2 text-[11px] text-muted-foreground">
                      Pilih project terlebih dahulu.
                    </p>
                  )}

                  {projectId && filteredUsers.length === 0 && (
                    <p className="px-1 py-2 text-[11px] text-muted-foreground">
                      Tidak ada user yang cocok.
                    </p>
                  )}

                  {projectId &&
                    filteredUsers.map((u) => {
                      const existing = existingAssignees.find(
                        (a) => Number(a.user.id) === Number(u.id),
                      )
                      const willRemove = existing
                        ? removedAssigneeIds.includes(existing.assignmentId)
                        : false
                      const checked = existing
                        ? !willRemove
                        : selectedUserIds.includes(u.id)

                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            toggleUser(u.id)
                          }}
                          className={[
                            "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-xs",
                            existing
                              ? willRemove
                                ? "cursor-pointer bg-destructive/5 hover:bg-destructive/10"
                                : "cursor-pointer bg-muted/30 hover:bg-muted/50"
                              : "cursor-pointer hover:bg-muted/60",
                          ].join(" ")}
                        >
                          <input
                            type="checkbox"
                            className="h-3.5 w-3.5"
                            checked={checked}
                            readOnly
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={[
                                  "font-medium",
                                  existing && willRemove
                                    ? "line-through text-destructive"
                                    : "",
                                ].join(" ")}
                              >
                                {u.fullName}
                              </span>
                              {existing && !willRemove && (
                                <span className="rounded-full bg-blue-100 px-2 py-[1px] text-[9px] text-blue-600">
                                  Assigned
                                </span>
                              )}
                              {existing && willRemove && (
                                <span className="rounded-full bg-destructive/10 px-2 py-[1px] text-[9px] text-destructive border border-destructive/30">
                                  Akan dihapus
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              {u.email}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleAssign}
            disabled={loading}
          >
            {loading ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
