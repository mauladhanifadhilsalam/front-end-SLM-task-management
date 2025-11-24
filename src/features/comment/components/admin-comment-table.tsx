import * as React from "react"
import { Link } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"
import type { AdminComment } from "@/types/comment.type"
import type { AdminCommentColumnState } from "../hooks/use-admin-comment-list"
import { formatRelativeTime } from "@/utils/format-relative-time.util"

type Props = {
  rows: AdminComment[]
  loading: boolean
  error: string
  cols: AdminCommentColumnState
  page: number
  totalPages: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (value: number) => void
  selectedIds: Set<number>
  isRowSelected: (id: number) => boolean
  toggleRow: (id: number) => void
  currentPageAllSelected: boolean
  toggleSelectAllOnPage: () => void
  onDelete: (id: number) => void
}

export const AdminCommentTable: React.FC<Props> = ({
  rows,
  loading,
  error,
  cols,
  page,
  totalPages,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  selectedIds,
  isRowSelected,
  toggleRow,
  currentPageAllSelected,
  toggleSelectAllOnPage,
  onDelete,
}) => {
  const colSpan = Object.values(cols).filter(Boolean).length || 7

  const handleFirstPage = () => onPageChange(1)
  const handleLastPage = () => onPageChange(totalPages)
  const handlePrevPage = () => onPageChange(Math.max(1, page - 1))
  const handleNextPage = () => onPageChange(Math.min(totalPages, page + 1))

  return (
    <Card className="rounded-md border overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr className="text-left">
            {cols.sel && (
              <th className="px-4 py-3 text-sm font-medium">
                <input
                  type="checkbox"
                  aria-label="Select all on this page"
                  checked={currentPageAllSelected && rows.length > 0}
                  onChange={toggleSelectAllOnPage}
                />
              </th>
            )}
            {cols.id && (
              <th className="px-4 py-3 text-sm font-medium">ID</th>
            )}
            {cols.ticket && (
              <th className="px-4 py-3 text-sm font-medium">Ticket</th>
            )}
            {cols.user && (
              <th className="px-4 py-3 text-sm font-medium">User</th>
            )}
            {cols.message && (
              <th className="px-4 py-3 text-sm font-medium">Message</th>
            )}
            {cols.created && (
              <th className="px-4 py-3 text-sm font-medium">Created</th>
            )}
            {cols.actions && (
              <th className="px-4 py-3 text-sm font-medium">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-background">
          {loading ? (
            <tr>
              <td colSpan={colSpan} className="px-4 py-6 text-center">
                Loading...
              </td>
            </tr>
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
                <tr key={c.id} className="align-top">
                  {cols.sel && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select row ${c.id}`}
                        checked={isRowSelected(c.id)}
                        onChange={() => toggleRow(c.id)}
                      />
                    </td>
                  )}
                  {cols.id && (
                    <td className="px-4 py-3 text-sm">{c.id}</td>
                  )}
                  {cols.ticket && (
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
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
                          className="ml-1 inline-flex"
                        >
                          <IconEye className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  )}
                  {cols.user && (
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 gap-3">
        <div className="text-sm text-muted-foreground text-center sm:text-left">
          {selectedIds.size} row(s) selected.
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm">Rows per page</span>
            <select
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={rowsPerPage}
              onChange={(e) =>
                onRowsPerPageChange(Number(e.target.value) || 10)
              }
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-end w-full sm:w-auto">
            <span className="text-sm">
              Page {totalPages === 0 ? 0 : page} of {totalPages}
            </span>
            <div className="flex">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-r-none"
                title="First page"
                onClick={handleFirstPage}
                disabled={page <= 1}
              >
                «
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-none -ml-px"
                title="Previous page"
                onClick={handlePrevPage}
                disabled={page <= 1}
              >
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-none -ml-px"
                title="Next page"
                onClick={handleNextPage}
                disabled={page >= totalPages}
              >
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-l-none -ml-px"
                title="Last page"
                onClick={handleLastPage}
                disabled={page >= totalPages}
              >
                »
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
