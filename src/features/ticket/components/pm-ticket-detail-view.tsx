"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconPaperclip,
  IconUser,
} from "@tabler/icons-react"
import { getCurrentUserId } from "@/utils/get-current-user"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import type { TicketDetail } from "@/types/ticket-type"
import TicketComments from "@/features/ticket/components/viewTicketsComment"
import TicketAttachments from "@/features/ticket/components/viewTicketsAttacment"

type Props = {
  ticket: TicketDetail | null
  loading: boolean
  error: string | null
  deleting: boolean
  formatDate: (iso?: string | null) => string
  onBack: () => void
  onDelete: () => void
  canEdit?: boolean
  canDelete?: boolean
  onAddAttachment?: (ticketId: number) => void
  buildEditHref?: (ticketId: number) => string
}

export function PmTicketDetailView({
  ticket,
  loading,
  error,
  deleting,
  formatDate,
  onBack,
  onDelete,
  canEdit,
  canDelete,
  onAddAttachment,
  buildEditHref,
}: Props) {
  const statusMeta: Record<
    string,
    { dot: string; ring: string; label: string }
  > = {
    NEW: {
      dot: "bg-zinc-500 shadow-[0_0_0_4px_rgba(113,113,122,0.18)] dark:bg-zinc-300 dark:shadow-[0_0_0_4px_rgba(113,113,122,0.25)]",
      ring:
        "border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-500/60 dark:bg-zinc-500/10 dark:text-zinc-50",
      label: "New",
    },
    TO_DO: {
      dot: "bg-gray-500 shadow-[0_0_0_4px_rgba(107,114,128,0.18)] dark:bg-gray-300 dark:shadow-[0_0_0_4px_rgba(107,114,128,0.25)]",
      ring:
        "border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-500/60 dark:bg-gray-500/10 dark:text-gray-50",
      label: "To Do",
    },
    IN_PROGRESS: {
      dot: "bg-amber-500 shadow-[0_0_0_4px_rgba(251,191,36,0.2)] dark:bg-amber-300 dark:shadow-[0_0_0_4px_rgba(251,191,36,0.25)]",
      ring:
        "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/70 dark:bg-amber-400/10 dark:text-amber-50",
      label: "In Progress",
    },
    IN_REVIEW: {
      dot: "bg-purple-500 shadow-[0_0_0_4px_rgba(168,85,247,0.18)] dark:bg-purple-300 dark:shadow-[0_0_0_4px_rgba(168,85,247,0.25)]",
      ring:
        "border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-400/60 dark:bg-purple-500/10 dark:text-purple-50",
      label: "In Review",
    },
    DONE: {
      dot: "bg-emerald-500 shadow-[0_0_0_4px_rgba(52,211,153,0.2)] dark:bg-emerald-300 dark:shadow-[0_0_0_4px_rgba(52,211,153,0.25)]",
      ring:
        "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/60 dark:bg-emerald-500/10 dark:text-emerald-50",
      label: "Done",
    },
    RESOLVED: {
      dot: "bg-lime-500 shadow-[0_0_0_4px_rgba(132,204,22,0.2)] dark:bg-lime-300 dark:shadow-[0_0_0_4px_rgba(132,204,22,0.25)]",
      ring:
        "border-lime-200 bg-lime-50 text-lime-800 dark:border-lime-400/60 dark:bg-lime-500/10 dark:text-lime-50",
      label: "Resolved",
    },
    CLOSED: {
      dot: "bg-neutral-500 shadow-[0_0_0_4px_rgba(115,115,115,0.18)] dark:bg-neutral-300 dark:shadow-[0_0_0_4px_rgba(115,115,115,0.2)]",
      ring:
        "border-neutral-200 bg-neutral-50 text-neutral-800 dark:border-neutral-400/60 dark:bg-neutral-500/10 dark:text-neutral-50",
      label: "Closed",
    },
  }

  const priorityMeta: Record<
    string,
    { diamond: string; tone: string; label: string }
  > = {
    LOW: {
      diamond: "bg-emerald-300",
      tone:
        "text-emerald-800 bg-emerald-50 border-emerald-200 dark:text-emerald-100 dark:border-emerald-400/60 dark:bg-emerald-500/10",
      label: "Low",
    },
    MEDIUM: {
      diamond: "bg-amber-300",
      tone:
        "text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-100 dark:border-amber-400/60 dark:bg-amber-500/10",
      label: "Medium",
    },
    HIGH: {
      diamond: "bg-orange-300",
      tone:
        "text-orange-800 bg-orange-50 border-orange-200 dark:text-orange-100 dark:border-orange-400/60 dark:bg-orange-500/10",
      label: "High",
    },
    CRITICAL: {
      diamond: "bg-rose-300",
      tone:
        "text-rose-800 bg-rose-50 border-rose-200 dark:text-rose-100 dark:border-rose-500/60 dark:bg-rose-500/10",
      label: "Critical",
    },
  }

  const statusKey = String(ticket?.status || "NEW").toUpperCase()
  const status = statusMeta[statusKey] ?? statusMeta.NEW

  const priorityKey = String(ticket?.priority || "MEDIUM").toUpperCase()
  const priority = priorityMeta[priorityKey] ?? priorityMeta.MEDIUM

  const currentUserId = React.useMemo(() => getCurrentUserId(), [])
  const isReporter = ticket ? Number(ticket.requesterId) === currentUserId : false
  const isAssignee =
    ticket?.assignees?.some((a) => Number(a?.user?.id) === currentUserId) ?? false
  const isIssue = String(ticket?.type || "").toUpperCase() === "ISSUE"
  const canShowAddAttachment = Boolean(
    onAddAttachment && ticket && isReporter && (!isIssue || !isAssignee),
  )
  const handleAddAttachment = React.useCallback(() => {
    if (onAddAttachment && ticket) {
      onAddAttachment(ticket.id)
    }
  }, [onAddAttachment, ticket])

  const hasAssignees =
    Array.isArray(ticket?.assignees) && (ticket?.assignees?.length ?? 0) > 0

  return (
    <div className="px-4 lg:px-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <IconArrowLeft className="h-4 w-4" />
            Kembali
          </Button>

          {ticket && (canEdit || canDelete) && (
            <div className="flex items-center gap-2">
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="cursor-pointer"
                >
                  <Link
                    to={
                      buildEditHref
                        ? buildEditHref(ticket.id)
                        : `/project-manager/dashboard/ticket-issue/edit/${ticket.id}`
                    }
                  >
                    <IconEdit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                </Button>
              )}

              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-2 cursor-pointer"
                      disabled={deleting}
                    >
                      <IconTrash className="h-4 w-4 mr-1" />
                      {deleting ? "Deleting..." : "Delete"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus ticket?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {ticket
                          ? `Yakin ingin menghapus tiket "${ticket.title}"? Tindakan ini tidak dapat dikembalikan.`
                          : "Yakin ingin menghapus tiket ini? Tindakan ini tidak dapat dikembalikan."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={deleting}>
                        Batal
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onDelete}
                        disabled={deleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleting ? "Menghapus..." : "Ya, hapus"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-border bg-card text-foreground shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(2,6,23,0.35)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-10 -right-16 h-48 w-48 rounded-full bg-neutral-200/50 blur-3xl dark:bg-white/5" />
            <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-neutral-100/40 blur-[120px] dark:bg-white/10" />
          </div>

          <div className="relative p-5 sm:p-8 space-y-6 bg-gradient-to-b from-white via-card to-card dark:from-[#0f172a] dark:via-[#0b1220] dark:to-[#0b1220]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                  {ticket ? `#${ticket.id}` : "#-"}
                </p>
                <h1 className="text-2xl sm:text-3xl font-semibold leading-snug text-foreground">
                  {loading ? "Memuat ticket..." : ticket?.title || "Ticket"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {ticket?.projectName
                    ? `Project: ${ticket.projectName}`
                    : ticket
                      ? `Project ID: ${ticket.projectId}`
                      : "Project tidak diketahui"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-neutral-100 text-neutral-900 border border-neutral-200 text-[11px] uppercase tracking-[0.18em] dark:bg-white/10 dark:text-white dark:border-white/20"
                >
                  {ticket?.type || "ISSUE"}
                </Badge>
              </div>
            </div>

            {error && (
              <div className="text-sm text-rose-900 bg-rose-50 border border-rose-200 rounded-xl p-3 dark:text-rose-100 dark:bg-rose-500/10 dark:border-rose-400/50">
                {error}
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                <div className="h-6 w-3/4 rounded-full bg-muted/60 animate-pulse dark:bg-white/5" />
                <div className="h-4 w-1/2 rounded-full bg-muted/60 animate-pulse dark:bg-white/5" />
                <div className="h-32 w-full rounded-2xl bg-muted/60 animate-pulse dark:bg-white/5" />
              </div>
            ) : ticket ? (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${status.ring}`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
                    <span className="tracking-wide">{ticket.status}</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${priority.tone}`}
                  >
                    <span
                      className={`h-3 w-3 rotate-45 rounded-[4px] shadow-[0_0_0_3px_rgba(0,0,0,0.12)] dark:shadow-[0_0_0_3px_rgba(0,0,0,0.12)] ${priority.diamond}`}
                    />
                    <span className="tracking-wide uppercase">
                      {priority.label}
                    </span>
                  </div>

                  <Badge
                    variant="outline"
                    className="border-border bg-muted/60 text-[11px] uppercase tracking-[0.12em] text-foreground dark:bg-white/5 dark:text-slate-100"
                  >
                    {formatDate(ticket.dueDate)} Due 
                  </Badge>

                  <Badge
                    variant="outline"
                    className="border-border bg-muted/60 text-[11px] uppercase tracking-[0.12em] text-foreground dark:bg-white/5 dark:text-slate-100"
                  >
                    Dibuat {formatDate(ticket.createdAt)}
                  </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-muted/50 p-4 space-y-2 dark:bg-white/5">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      Requester
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/80 border border-border text-sm font-semibold dark:bg-white/10">
                        <IconUser className="h-4 w-4 text-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">
                          {ticket.requesterName || `#${ticket.requesterId}`}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Ticket #{ticket.id}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-muted/50 p-4 space-y-2 dark:bg-white/5">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      Timeline
                    </p>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <span>Mulai:</span>
                      <span className="text-foreground">{formatDate(ticket.startDate)}</span>
                    </div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <span>Due:</span>
                      <span className="text-foreground">{formatDate(ticket.dueDate)}</span>
                    </div>
                  </div>
                </div>

                {hasAssignees && (
                  <div className="rounded-2xl border border-border bg-muted/50 p-4 dark:bg-white/5">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-3">
                      Assignees
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ticket.assignees.map((a, idx) => {
                        const name =
                          a?.user?.fullName ||
                          a?.user?.name ||
                          a?.user?.email ||
                          `User#${a?.user?.id ?? idx + 1}`
                        return (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="border-neutral-300 bg-neutral-100 text-neutral-800 dark:border-white/20 dark:bg-white/5 dark:text-white"
                          >
                            {name}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-3 dark:bg-white/5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      Description
                    </p>
                    <Badge className="bg-muted/80 border-border text-[11px] text-foreground dark:bg-white/10 dark:border-white/15">
                      Detail Ticket
                    </Badge>
                  </div>
                  {ticket.description ? (
                    <div className="markdown-body prose prose-sm max-w-none !bg-transparent !text-foreground leading-relaxed dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {ticket.description}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Tidak ada deskripsi.</span>
                  )}
                </div>
                
                {ticket.actionPlan && (
                  <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-3 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        Action Plan
                      </p>
                      <Badge className="bg-blue-50 border-blue-200 text-blue-800 text-[11px] dark:bg-blue-500/10 dark:border-blue-400/50 dark:text-blue-100">
                        Rencana Aksi
                      </Badge>
                    </div>
                    <div className="markdown-body prose prose-sm max-w-none !bg-transparent !text-foreground leading-relaxed dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {ticket.actionPlan}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-border bg-muted/50 p-5 space-y-3 dark:bg-white/5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      Attachments
                    </p>
                    {canShowAddAttachment && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-[11px] border-border bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                        onClick={handleAddAttachment}
                      >
                        <IconPaperclip className="mr-2 h-4 w-4" />
                        Tambah file
                      </Button>
                    )}
                  </div>
                  <TicketAttachments ticketId={ticket.id} />
                </div>

                <div className="rounded-2xl border border-border bg-muted/50 p-5 dark:bg-white/5">
                  <TicketComments ticketId={ticket.id} type="ISSUE" />
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Ticket tidak ditemukan.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
