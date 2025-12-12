"use client"

import * as React from "react"
import {
  IconTrash,
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconUsers,
  IconPaperclip,
} from "@tabler/icons-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import { Badge } from "@/components/ui/badge"

import type {
  AdminTicket,
  TicketPriority,
  TicketStatus,
  TicketType,
} from "@/types/ticket-type"
import { AssignTicketDialog } from "@/features/ticket-assignee/components/assign-ticket-dialog"

type Props = {
  title: string
  subtitle?: string
  emptyMessage?: string
  tickets: AdminTicket[]
  loading: boolean
  error: string
  onDelete: (id: number) => void
  onView: (id: number) => void
  onEdit: (id: number) => void
  formatDate: (iso?: string) => string
  hasFilter: boolean
  canDelete?: boolean
  canEdit?: boolean
  onAddAttachment?: (id: number) => void
  canAssignUser?: boolean
}

const typeLabel: Record<TicketType, string> = {
  TASK: "Task",
  ISSUE: "Issue",
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

export const TicketsCardsTaskBoard: React.FC<Props> = ({
  title,
  subtitle,
  emptyMessage,
  tickets,
  loading,
  error,
  onDelete,
  onView,
  onEdit,
  formatDate,
  hasFilter,
  canDelete = true,
  canEdit = true,
  onAddAttachment,
  canAssignUser = true,
}) => {
  const taskTickets = React.useMemo(
    () => tickets.filter((t) => String(t.type).toUpperCase() === "TASK"),
    [tickets],
  )

  const [assignOpen, setAssignOpen] = React.useState(false)
  const [assignContext, setAssignContext] = React.useState<{
    projectId?: number
    ticketId?: number
    ticketTitle?: string
  }>({})

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
        {error}
      </div>
    )
  }

  return (
    <section className="space-y-3 mr-7 ml-7">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {taskTickets.length === 0 ? (
        <div className="rounded-2xl border bg-background/40 p-6 text-sm text-muted-foreground">
          {loading
            ? "Memuat task..."
            : emptyMessage ?? "Belum ada task yang ditugaskan ke kamu."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {taskTickets.map((ticket) => (
            <AlertDialog key={ticket.id}>
              <article className="flex flex-col justify-between rounded-2xl border bg-card/80 p-4 shadow-sm transition hover:-translate-y-[2px] hover:shadow-md">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold leading-snug">
                    {ticket.title}
                  </h3>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      >
                        <IconDotsVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        className="flex items-center gap-2 text-xs"
                        onClick={() => onView(ticket.id)}
                      >
                        <IconEye className="h-3.5 w-3.5" />
                        View detail
                      </DropdownMenuItem>

                      {canAssignUser && (
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-xs"
                          onClick={() => {
                            setAssignContext({
                              projectId: (ticket as any).projectId ?? undefined,
                              ticketId: ticket.id,
                              ticketTitle: ticket.title ?? "",
                            })
                            setAssignOpen(true)
                          }}
                        >
                          <IconUsers className="h-3.5 w-3.5" />
                          Assign user
                        </DropdownMenuItem>
                      )}

                      {onAddAttachment && (
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-xs"
                          onClick={() => onAddAttachment(ticket.id)}
                        >
                          <IconPaperclip className="h-3.5 w-3.5" />
                          Add attachment
                        </DropdownMenuItem>
                      )}

                      {canDelete && (
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="flex items-center gap-2 text-xs text-destructive">
                            <IconTrash className="h-3.5 w-3.5 text-destructive" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      )}

                      {canEdit && (
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-xs"
                          onClick={() => onEdit(ticket.id)}
                        >
                          <IconEdit className="h-3.5 w-3.5" />
                          Edit
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 mt-2">
                  {ticket.description && (
                    <div className="markdown-body prose prose-xs max-w-none line-clamp-2 text-muted-foreground [&>*]:my-1 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {ticket.description}
                      </ReactMarkdown>
                    </div>
                  )}

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

                <div className="mt-4 flex items-end justify-between text-[11px] text-muted-foreground">
                  <div className="space-y-1">
                    {ticket.projectName && (
                      <p className="font-medium text-foreground">
                        {ticket.projectName}
                      </p>
                    )}

                    {ticket.requesterName && (
                      <p>Requested by {ticket.requesterName}</p>
                    )}

                    <p className="text-[10px]">
                      {ticket.createdAt && (
                        <>Created {formatDate(ticket.createdAt)} · </>
                      )}
                      {ticket.dueDate && <>Due {formatDate(ticket.dueDate)}</>}
                    </p>
                  </div>

                  <span className="font-mono text-[10px] text-muted-foreground">
                    #TASK-{ticket.id}
                  </span>
                </div>

                {canDelete && (
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus task ini?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini tidak bisa dibatalkan.
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
                )}
              </article>
            </AlertDialog>
          ))}
        </div>
      )}

      <AssignTicketDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        initialProjectId={assignContext.projectId}
        initialTicketId={assignContext.ticketId}
        initialTicketTitle={assignContext.ticketTitle}
      />
    </section>
  )
}
