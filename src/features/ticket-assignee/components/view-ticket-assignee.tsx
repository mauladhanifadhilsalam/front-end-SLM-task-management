"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

import type { TicketAssigneeTicketDetail, TicketPriority, TicketStatus, TicketType } from "@/types/ticket-assignee.type"

type Props = {
  ticket: TicketAssigneeTicketDetail | null
  loading: boolean
  error: string
  deleting: boolean
  onBack: () => void
  onEdit: () => void
  onConfirmDelete: () => void
}

const statusVariant = (status?: TicketStatus) => {
  switch (status) {
    case "OPEN":
    case "PENDING":
      return "secondary"
    case "IN_PROGRESS":
      return "default"
    case "RESOLVED":
    case "CLOSED":
      return "default"
    default:
      return "secondary"
  }
}

const priorityVariant = (priority?: TicketPriority) => {
  switch (priority) {
    case "LOW":
      return "outline"
    case "MEDIUM":
      return "secondary"
    case "HIGH":
      return "default"
    case "URGENT":
      return "destructive"
    default:
      return "secondary"
  }
}

const typeVariant = (type?: TicketType) => {
  switch (type) {
    case "TASK":
      return "secondary"
    case "ISSUE":
    case "BUG":
      return "destructive"
    default:
      return "outline"
  }
}

const formatDate = (iso?: string | null) => {
  if (!iso) return "-"
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export function ViewTicketAssigneeLayout({
  ticket,
  loading,
  error,
  deleting,
  onBack,
  onEdit,
  onConfirmDelete,
}: Props) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6">
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

            <div className="ml-auto flex items-center gap-2">
              {ticket && (
                <Link to={`/admin/dashboard/ticket-assignee/edit/${ticket.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={onEdit}
                  >
                    <IconEdit className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex items-center gap-2"
                    disabled={!ticket || deleting}
                  >
                    <IconTrash className="h-4 w-4" />
                    {deleting ? "Deleting..." : "Delete"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus tiket?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {ticket
                        ? `Yakin ingin menghapus tiket "${ticket.title}"? Tindakan ini tidak dapat dibatalkan.`
                        : "Yakin ingin menghapus tiket ini? Tindakan ini tidak dapat dibatalkan."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>
                      Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onConfirmDelete}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleting ? "Menghapus..." : "Ya, hapus"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <h1 className="text-2xl font-semibold mb-2">
            Detail Ticket Assignment
          </h1>
          <p className="text-muted-foreground mb-6">
            Lihat informasi lengkap dan detail assignment tiket ini.
          </p>

          {loading ? (
            <div className="p-6">Memuat data tiket...</div>
          ) : error ? (
            <div className="p-6 text-red-600">{error}</div>
          ) : !ticket ? (
            <div className="p-6">Tiket tidak ditemukan.</div>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{ticket.title}</CardTitle>
                  <CardDescription>
                    Dilaporkan oleh{" "}
                    <strong>
                      {ticket.requester?.fullName ||
                        ticket.requester?.email ||
                        "Requester Tidak Diketahui"}
                    </strong>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        ID Tiket
                      </div>
                      <div className="font-medium">#{ticket.id}</div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">Type</div>
                      <Badge variant={typeVariant(ticket.type)}>
                        {ticket.type}
                      </Badge>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">
                        Status
                      </div>
                      <Badge variant={statusVariant(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">
                        Priority
                      </div>
                      <Badge variant={priorityVariant(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">
                        Project ID
                      </div>
                      <div className="font-medium">#{ticket.projectId}</div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">
                        Requester
                      </div>
                      <div className="font-medium">
                        {ticket.requester?.fullName ||
                          ticket.requester?.email ||
                          "Requester Tidak Diketahui"}
                      </div>
                      {ticket.requester?.email && (
                        <div className="text-xs text-muted-foreground">
                          {ticket.requester.email}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">
                        Start Date
                      </div>
                      <div className="font-medium">
                        {formatDate(ticket.startDate)}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">
                        Due Date
                      </div>
                      <div className="font-medium">
                        {formatDate(ticket.dueDate)}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">
                        Created
                      </div>
                      <div className="font-medium">
                        {formatDate(ticket.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Deskripsi
                    </div>
                    <div className="font-medium whitespace-pre-wrap">
                      {ticket.description || "-"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Assignees</CardTitle>
                  <CardDescription>
                    Daftar user yang ditugaskan untuk ticket ini
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ticket.assignees.length > 0 ? (
                    <div className="space-y-3">
                      {ticket.assignees.map((assignee) => (
                        <div
                          key={assignee.id}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                            {assignee.user?.fullName
                              ?.charAt(0)
                              ?.toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium">
                              {assignee.user?.fullName ||
                                assignee.user?.email ||
                                "Unknown Assignee"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {assignee.user?.email || "-"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Belum ada assignee untuk ticket ini
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
