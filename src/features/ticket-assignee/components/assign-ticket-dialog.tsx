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
  projectSchema,
  ticketSchema,
  userSchema,
  type Project,
  type Ticket,
  type User,
} from "@/schemas/ticket-assignee.schema"
import { createTicketAssignees } from "@/services/ticket-assignee.service"

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
  const [existingAssigneeIds, setExistingAssigneeIds] = React.useState<
    number[]
  >([])

  const [projectId, setProjectId] = React.useState<number | undefined>(
    initialProjectId,
  )
  const [ticketId, setTicketId] = React.useState<number | undefined>(
    initialTicketId,
  )
  const [search, setSearch] = React.useState("")
  const [selectedUserIds, setSelectedUserIds] = React.useState<number[]>([])

  const [loading, setLoading] = React.useState(false)
  const [loadingProjects, setLoadingProjects] = React.useState(false)
  const [loadingTicketData, setLoadingTicketData] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // reset ketika modal dibuka / ditutup
  React.useEffect(() => {
    if (!open) {
      setSearch("")
      setSelectedUserIds([])
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

        try {
          const validated = z.array(projectSchema).parse(res.data ?? [])
          setProjects(validated)
        } catch {
          setProjects(res.data ?? [])
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

  // ketika project berubah: load tickets + project assignments
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

        const [ticketRes, projectAssignmentsRes] = await Promise.all([
          axios.get(`${API_BASE}/tickets`, {
            headers,
            params: { projectId },
          }),
          axios.get(`${API_BASE}/project-assignments`, {
            headers,
            params: { projectId },
          }),
        ])

        try {
          const validatedTickets = z
            .array(ticketSchema)
            .parse(ticketRes.data ?? [])
          setTickets(validatedTickets)
        } catch {
          setTickets(ticketRes.data ?? [])
        }

        const extractedUsers = (projectAssignmentsRes.data ?? []).map(
          (item: any) => item.user,
        )

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

  // ketika ticket berubah: cek siapa yang sudah assigned
  React.useEffect(() => {
    if (!open || !ticketId) {
      setExistingAssigneeIds([])
      return
    }

    const loadTicketDetail = async () => {
      try {
        const res = await axios.get(`${API_BASE}/tickets/${ticketId}`, {
          headers: getAuthHeaders(),
        })

        try {
          const validated = ticketSchema.parse(res.data)
          const ids =
            (validated.assignees ?? []).map((a: any) => a.user?.id) ?? []
          setExistingAssigneeIds(ids.filter(Boolean) as number[])
        } catch {
          const raw = res.data
          const ids =
            (raw?.assignees ?? []).map((a: any) => a.user?.id) ?? []
          setExistingAssigneeIds(ids.filter(Boolean) as number[])
        }
      } catch {
        setExistingAssigneeIds([])
      }
    }

    loadTicketDetail()
  }, [open, ticketId])

  const toggleUser = (userId: number) => {
    if (existingAssigneeIds.includes(userId)) return

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
      toast.error("Tidak ada user yang dipilih", {
        description: "Pilih minimal satu user untuk di-assign.",
      })
      return
    }

    try {
      setLoading(true)
      setError(null)

      await createTicketAssignees(ticketId, selectedUserIds)

      toast.success("Ticket berhasil di-assign")

      onAssigned?.()
      onOpenChange(false)
      setSelectedUserIds([])
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
            <select
              className="w-full rounded-md border bg-background px-2 py-1.5 text-xs"
              value={projectId ?? ""}
              disabled={loadingProjects || loading}
              onChange={(e) => {
                const v = e.target.value ? Number(e.target.value) : undefined
                setProjectId(v)
                setTicketId(undefined)
                setSelectedUserIds([])
              }}
            >
              <option value="">{loadingProjects ? "Memuat..." : "Pilih project"}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ticket */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium">
              Ticket <span className="text-destructive">*</span>
            </p>
            <select
              className="w-full rounded-md border bg-background px-2 py-1.5 text-xs"
              value={ticketId ?? ""}
              disabled={!projectId || loadingTicketData || loading}
              onChange={(e) => {
                const v = e.target.value ? Number(e.target.value) : undefined
                setTicketId(v)
                setSelectedUserIds([])
              }}
            >
              {!projectId && (
                <option value="">Pilih project terlebih dahulu</option>
              )}
              {projectId && tickets.length === 0 && !loadingTicketData && (
                <option value="">Tidak ada ticket di project ini</option>
              )}
              {projectId && loadingTicketData && (
                <option value="">Memuat ticket...</option>
              )}
              {projectId &&
                !loadingTicketData &&
                tickets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
            </select>
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
              <p className="text-[10px] text-muted-foreground">
                {selectedUserIds.length} user dipilih
              </p>
            </div>

            <Input
              placeholder="Type or choose a user"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={!projectId || loadingTicketData || loading}
              className="h-8 text-xs"
            />

            <div className="border rounded-md bg-muted/30">
              <ScrollArea className="max-h-56">
                <div className="p-1.5 space-y-1">
                  {!projectId && (
                    <p className="text-[11px] text-muted-foreground px-1 py-2">
                      Pilih project terlebih dahulu.
                    </p>
                  )}

                  {projectId && filteredUsers.length === 0 && (
                    <p className="text-[11px] text-muted-foreground px-1 py-2">
                      Tidak ada user yang cocok.
                    </p>
                  )}

                  {projectId &&
                    filteredUsers.map((u) => {
                      const alreadyAssigned = existingAssigneeIds.includes(
                        u.id,
                      )
                      const checked =
                        selectedUserIds.includes(u.id) || alreadyAssigned

                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => toggleUser(u.id)}
                          disabled={alreadyAssigned || loading}
                          className={[
                            "w-full flex items-center gap-3 rounded-md px-2 py-1.5 text-left text-xs",
                            alreadyAssigned
                              ? "opacity-60 cursor-not-allowed bg-muted/40"
                              : "hover:bg-muted/60 cursor-pointer",
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
                              <span className="font-medium">
                                {u.fullName}
                              </span>
                              {alreadyAssigned && (
                                <span className="text-[9px] rounded-full bg-blue-100 px-2 py-[1px] text-blue-600">
                                  Already assigned
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
