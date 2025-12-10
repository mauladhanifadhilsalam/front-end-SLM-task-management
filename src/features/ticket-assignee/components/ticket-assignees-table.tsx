import * as React from "react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { IconEye, IconTrash } from "@tabler/icons-react"
import type {
  TicketAssignee,
  TicketAssigneeColumns,
} from "@/types/ticket-assignee.type"

type Props = {
  assignees: TicketAssignee[]
  filteredAssignees: TicketAssignee[]
  loading: boolean
  error: string
  cols: TicketAssigneeColumns
  visibleColCount: number
  onDelete: (id: number) => void
}

const statusVariant = (status?: string) => {
  switch (status) {
    case "NEW":
    case "TO_DO":
    case "OPEN":
      return "secondary"
    case "IN_PROGRESS":
      return "default"
    case "IN_REVIEW":
      return "outline"
    case "DONE":
    case "RESOLVED":
    case "CLOSED":
      return "default"
    case "BLOCKED":
    case "PENDING":
      return "destructive"
    default:
      return "secondary"
  }
}

const priorityVariant = (p?: string) => {
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

const typeVariant = (type?: string) => {
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

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

export const TicketAssigneesTable: React.FC<Props> = ({
  assignees,
  filteredAssignees,
  loading,
  error,
  cols,
  visibleColCount,
  onDelete,
}) => {
  const colSpan = visibleColCount || 1

  return (
    <div className="rounded-md border overflow-x-auto">
      {loading ? (
        <div className="p-6">
          Memuat data dari server...
        </div>
      ) : error ? (
        <div className="p-6 text-red-600">
          Error: {error}
        </div>
      ) : filteredAssignees.length === 0 ? (
        <div className="p-6">
          Tidak ada data ticket assignment ditemukan.
        </div>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50 text-center">
            <tr>
              {cols.id && (
                <th className="px-4 py-3 font-medium">ID</th>
              )}
              {cols.ticket && (
                <th className="px-4 py-3 font-medium">
                  Ticket
                </th>
              )}
              {cols.assignee && (
                <th className="px-4 py-3 font-medium">
                  Assignee
                </th>
              )}
              {cols.type && (
                <th className="px-4 py-3 font-medium">
                  Type
                </th>
              )}
              {cols.priority && (
                <th className="px-4 py-3 font-medium">
                  Priority
                </th>
              )}
              {cols.status && (
                <th className="px-4 py-3 font-medium">
                  Status
                </th>
              )}
              {cols.createdAt && (
                <th className="px-4 py-3 font-medium">
                  Assigned At
                </th>
              )}
              {cols.actions && (
                <th className="px-4 py-3 font-medium">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredAssignees.map((a) => (
              <tr
                key={a.id}
                className="border-t text-center hover:bg-muted/50 transition-colors"
              >
                {cols.id && (
                  <td className="px-4 py-3">{a.id}</td>
                )}
                {cols.ticket && (
                  <td className="px-4 py-3 text-left">
                    <div className="font-medium">
                      {a.ticket.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ticket #{a.ticket.id}
                    </div>
                  </td>
                )}
                {cols.assignee && (
                  <td className="px-4 py-3 text-left">
                    <div className="font-medium">
                      {a.user.fullName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {a.user.email}
                    </div>
                  </td>
                )}
                {cols.type && (
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        typeVariant(a.ticket.type) as any
                      }
                    >
                      {a.ticket.type || "-"}
                    </Badge>
                  </td>
                )}
                {cols.priority && (
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        priorityVariant(
                          a.ticket.priority,
                        ) as any
                      }
                    >
                      {a.ticket.priority || "-"}
                    </Badge>
                  </td>
                )}
                {cols.status && (
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        statusVariant(
                          a.ticket.status,
                        ) as any
                      }
                    >
                      {a.ticket.status}
                    </Badge>
                  </td>
                )}
                {cols.createdAt && (
                  <td className="px-4 py-3">
                    {formatDate(a.createdAt)}
                  </td>
                )}
                {cols.actions && (
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-3">
                      <Link
                        to={`/admin/dashboard/ticket-assignees/view/${a.ticket.id}`}
                      >
                        <IconEye className="h-4 w-4" />
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="text-red-600 hover:text-red-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Hapus assignment #{a.id}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Assignee{" "}
                              <span className="font-semibold">
                                {a.user.fullName}
                              </span>{" "}
                              akan dihapus dari ticket{" "}
                              <span className="font-semibold">
                                “{a.ticket.title}”
                              </span>
                              . Tindakan ini tidak dapat
                              dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              Batal
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() =>
                                onDelete(a.id)
                              }
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
