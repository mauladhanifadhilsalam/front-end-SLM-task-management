"use client"

import * as React from "react"
import { IconTrash } from "@tabler/icons-react"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

import { Badge } from "@/components/ui/badge"

import type {
  AdminTicket,
  TicketPriority,
  TicketStatus,
  TicketType,
} from "@/types/ticket-type"

type Props = {
  title: string
  subtitle?: string
  emptyMessage?: string
  tickets: AdminTicket[]
  loading: boolean
  error: string
  onDelete: (id: number) => void
  formatDate: (iso?: string) => string
  hasFilter: boolean
}

const typeLabel: Record<TicketType, string> = {
  TASK: "Task",
  ISSUE: "Issue",
  BUG: "Bug",
}

const statusLabel: Record<TicketStatus, string> = {
  NEW: "New",
  TO_DO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
}

const priorityLabel: Record<TicketPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
}

function normalizeType(type: AdminTicket["type"]): string {
  if (!type) return "Unknown"
  const t = type as TicketType
  return typeLabel[t] ?? String(type).toUpperCase()
}

function normalizeStatus(status: AdminTicket["status"]): string {
  if (!status) return "Unknown"
  const s = status as TicketStatus
  return statusLabel[s] ?? String(status)
}

function normalizePriority(priority: AdminTicket["priority"]): string {
  if (!priority) return "—"
  const p = priority as TicketPriority
  return priorityLabel[p] ?? String(priority)
}

function priorityClass(priority: AdminTicket["priority"]): string {
  const p = priority as TicketPriority | undefined

  switch (p) {
    case "CRITICAL":
      return "border-red-500/70 text-red-500"
    case "HIGH":
      return "border-orange-500/70 text-orange-500"
    case "MEDIUM":
      return "border-yellow-500/70 text-yellow-500"
    case "LOW":
      return "border-emerald-500/70 text-emerald-500"
    default:
      return "border-muted-foreground/40 text-muted-foreground"
  }
}

export const TicketsCardsBoard: React.FC<Props> = ({
  title,
  subtitle,
  emptyMessage,
  tickets,
  loading,
  error,
  onDelete,
  formatDate,
  hasFilter,
}) => {
  const issueTickets = React.useMemo(
    () =>
      tickets.filter(
        (t) => String(t.type).toUpperCase() === "ISSUE",
      ),
    [tickets],
  )

  if (loading) {
    return (
      <div className="rounded-2xl border bg-background/40 p-6">
        Memuat tiket...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
        {error}
      </div>
    )
  }

  return (
    <section className="space-y-3 mr-7 ml-7">
      {/* Header board (tanpa search & new issue) */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">
          {subtitle ??
            "Issue dari project yang kamu pegang sebagai Project Manager."}
        </p>
      </div>

      {hasFilter && (
        <p className="text-[11px] text-muted-foreground">
          Filter aktif. Beberapa issue mungkin tidak ditampilkan.
        </p>
      )}

      {/* Grid kartu */}
      {issueTickets.length === 0 ? (
        <div className="rounded-2xl border bg-background/40 p-6 text-sm text-muted-foreground">
          {emptyMessage ?? "Belum ada issue yang ditugaskan ke kamu."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {issueTickets.map((ticket) => (
            <article
              key={ticket.id}
              className="flex flex-col justify-between rounded-2xl border bg-card/80 p-4 shadow-sm transition hover:-translate-y-[2px] hover:shadow-md"
            >
              {/* Judul + deskripsi */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold leading-snug">
                  {ticket.title}
                </h3>

                {ticket.description && (
                  <p className="line-clamp-3 text-xs text-muted-foreground">
                    {ticket.description}
                  </p>
                )}

                {/* Badges type / status / priority */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                  <Badge variant="outline" className="border-primary/60">
                    {normalizeType(ticket.type)}
                  </Badge>

                  <Badge variant="outline" className="border-primary/40">
                    {normalizeStatus(ticket.status)}
                  </Badge>

                  <Badge
                    variant="outline"
                    className={priorityClass(ticket.priority)}
                  >
                    {normalizePriority(ticket.priority)}
                  </Badge>
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-4 flex items-end justify-between text-[11px] text-muted-foreground">
                <div className="space-y-1">
                  {ticket.projectName && (
                    <p className="font-medium text-foreground">
                      {ticket.projectName}
                    </p>
                  )}

                  {ticket.requesterName && (
                    <p>Reported by {ticket.requesterName}</p>
                  )}

                  <p className="text-[10px]">
                    {ticket.createdAt && (
                      <>Created {formatDate(ticket.createdAt)} · </>
                    )}
                    {ticket.dueDate && <>Due {formatDate(ticket.dueDate)}</>}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    #ISU-{ticket.id}
                  </span>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/5 px-2 py-0.5 text-[10px] text-destructive transition hover:bg-destructive/10"
                      >
                        <IconTrash className="h-3 w-3" />
                        Delete
                      </button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus tiket ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini tidak bisa dibatalkan. Tiket akan dihapus
                          secara permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(ticket.id)}
                          className="bg-destructive text-white hover:bg-destructive/90"
                        >
                          Ya, hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
