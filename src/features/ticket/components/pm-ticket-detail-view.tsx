"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Separator } from "@/components/ui/separator"
import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import type {
  TicketDetail,
  TicketStatus,
  TicketPriority,
} from "@/types/ticket-type"
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
}

const statusVariant = (
  s?: TicketStatus | string,
):
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "success"
  | "warning"
  | null
  | undefined => {
  switch (s) {
    case "NEW":
    case "TO_DO":
      return "secondary"
    case "IN_PROGRESS":
      return "default"
    case "IN_REVIEW":
      return "outline"
    case "DONE":
    case "RESOLVED":
    case "CLOSED":
      return "default"
    default:
      return "secondary"
  }
}

const priorityVariant = (
  p?: TicketPriority | string | null,
):
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "success"
  | "warning"
  | null
  | undefined => {
  switch (p) {
    case "LOW":
      return "outline"
    case "MEDIUM":
      return "secondary"
    case "HIGH":
      return "default"
    case "CRITICAL":
      return "destructive"
    default:
      return "secondary"
  }
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
  canDelete
}: Props) {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
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
          to={`/project-manager/dashboard/tickets/edit/${ticket.id}`}
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
                ? `Yakin ingin menghapus tiket “${ticket.title}”? Tindakan ini tidak dapat dikembalikan.`
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

      <h1 className="text-2xl font-semibold">Ticket Details</h1>
      <p className="text-muted-foreground mb-4">
        Lihat informasi lengkap ticket yang kamu pegang.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>{loading ? "Loading…" : ticket?.title ?? "-"}</CardTitle>
          {ticket?.projectName && (
            <CardDescription>Project: {ticket.projectName}</CardDescription>
          )}
        </CardHeader>

        <CardContent>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              <div className="h-4 w-40 bg-muted animate-pulse rounded" />
              <div className="h-4 w-64 bg-muted animate-pulse rounded" />
              <div className="h-4 w-56 bg-muted animate-pulse rounded" />
            </div>
          ) : ticket ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Project</div>
                <div className="font-medium">
                  {ticket.projectName || `#${ticket.projectId}`}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Requester</div>
                <div className="font-medium">
                  {ticket.requesterName || `#${ticket.requesterId}`}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Type</div>
                <div>
                  <Badge variant="secondary">
                    {ticket.type || "-"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Priority</div>
                <div>
                  <Badge variant={priorityVariant(ticket.priority)}>
                    {ticket.priority || "-"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Status</div>
                <div>
                  <Badge variant={statusVariant(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Start Date</div>
                <div className="font-medium">
                  {formatDate(ticket.startDate)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Due Date</div>
                <div className="font-medium">
                  {formatDate(ticket.dueDate)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Created</div>
                <div className="font-medium">
                  {formatDate(ticket.createdAt)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Updated</div>
                <div className="font-medium">
                  {formatDate(ticket.updatedAt)}
                </div>
              </div>

              {Array.isArray(ticket.assignees) &&
                ticket.assignees.length > 0 && (
                  <div className="md:col-span-2">
                    <Separator className="my-2" />
                    <div className="text-xs text-muted-foreground mb-2">
                      Assignees
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ticket.assignees.map((a, idx) => {
                        const name =
                          a?.user?.fullName ||
                          a?.user?.name ||
                          a?.user?.email ||
                          `User#${a?.user?.id ?? idx + 1}`
                        return <Badge key={idx}>{name}</Badge>
                      })}
                    </div>
                  </div>
                )}

              <div className="md:col-span-2">
                <Separator className="my-2" />
                <div className="text-xs text-muted-foreground mb-1">
                  Description
                </div>
                {ticket.description ? (
                  <div className="markdown-body !bg-transparent !text-[14px] leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {ticket.description}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>

              <div className="md:col-span-2">
                <Separator className="my-4" />
                <TicketAttachments ticketId={ticket.id} />
              </div>

              <div className="md:col-span-2">
                <Separator className="my-4" />
                <TicketComments ticketId={ticket.id} type="ISSUE" />
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Ticket tidak ditemukan.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
