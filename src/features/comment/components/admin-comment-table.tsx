import * as React from "react"
import { Link } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { IconEye, IconEdit, IconTrash } from "@tabler/icons-react"
import type { AdminComment } from "@/types/comment.type"
import type { AdminCommentColumnState } from "../hooks/use-admin-comment-list"
import { formatRelativeTime } from "@/utils/format-relative-time.util"
import type { PaginationMeta } from "@/types/pagination"
import { TablePaginationControls } from "@/components/table-pagination-controls"
import { Skeleton } from "@/components/ui/skeleton"

type Props = {
  rows: AdminComment[]
  loading: boolean
  error: string
  cols: AdminCommentColumnState
  pagination: PaginationMeta
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (value: number) => void
  onDelete: (id: number) => void
}

export const AdminCommentTable: React.FC<Props> = ({
  rows,
  loading,
  error,
  cols,
  pagination,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onDelete,
}) => {
  const colSpan = Object.values(cols).filter(Boolean).length || 7

  return (
    <div className="overflow-x-auto rounded border">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              {cols.id && (
                <th className="px-4 py-3 font-medium">ID</th>
              )}
              {cols.ticket && (
                <th className="px-4 py-3 font-medium">Ticket</th>
              )}
              {cols.user && (
                <th className="px-4 py-3 font-medium">User</th>
              )}
              {cols.message && (
                <th className="px-4 py-3 font-medium">Message</th>
              )}
              {cols.created && (
                <th className="px-4 py-3 font-medium">Created</th>
              )}
              {cols.actions && (
                <th className="px-4 py-3 font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} className="align-top">
                  {cols.sel && (
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-4 rounded-sm" />
                    </td>
                  )}
                  {cols.id && (
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-10" />
                    </td>
                  )}
                  {cols.ticket && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-12 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </td>
                  )}
                  {cols.user && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-16 rounded-full" />
                      </div>
                    </td>
                  )}
                  {cols.message && (
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[420px]" />
                      <Skeleton className="h-4 w-3/4 mt-1" />
                    </td>
                  )}
                  {cols.created && (
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                  )}
                  {cols.actions && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className="px-4 py-6 text-center text-red-600"
                >
                  {error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No comments found
                </td>
              </tr>
            ) : (
              rows.map((c) => {
                const userName =
                  c.user?.fullName ||
                  c.user?.name ||
                  c.user?.email ||
                  `User#${c.userId}`
                const userRole = c.user?.role
                const ticketTitle =
                  c.ticket?.title ||
                  (c.ticket?.project?.name
                    ? `${c.ticket?.project?.name}`
                    : undefined)

                return (
                  <tr key={c.id} className="align-top hover:bg-muted/40">
                    {cols.id && (
                      <td className="px-4 py-3 text-sm">{c.id}</td>
                    )}
                    {cols.ticket && (
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">#{c.ticketId}</Badge>
                          {ticketTitle && (
                            <span className="text-muted-foreground">
                              {ticketTitle}
                            </span>
                          )}
                          <Link
                            to={`/admin/dashboard/tickets/view/${
                              c.ticket?.id ?? c.ticketId
                            }`}
                            title="View Ticket"
                            className="inline-flex"
                          >
                            <IconEye className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    )}
                    {cols.user && (
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{userName}</span>
                          {userRole && (
                            <Badge variant="outline" className="uppercase">
                              {userRole}
                            </Badge>
                          )}
                        </div>
                      </td>
                    )}
                    {cols.message && (
                      <td className="px-4 py-3 text-sm whitespace-pre-wrap max-w-[520px]">
                        {c.message}
                      </td>
                    )}
                    {cols.created && (
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatRelativeTime(c.createdAt)}
                      </td>
                    )}
                    {cols.actions && (
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/admin/dashboard/comments/view/${c.id}`}
                          >
                            <IconEye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </Link>
                          <Link
                            to={`/admin/dashboard/comments/edit/${c.id}`}
                          >
                            <IconEdit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className="text-red-600 cursor-pointer"
                                title="Delete"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <IconTrash className="h-4 w-4" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete comment?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Comment{" "}
                                  <span className="font-semibold">
                                    #{c.id}
                                  </span>{" "}
                                  akan dihapus secara permanen. Tindakan ini
                                  tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => onDelete(c.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <TablePaginationControls
        total={pagination.total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        label="comments"
      />
    </div>
  )
}
