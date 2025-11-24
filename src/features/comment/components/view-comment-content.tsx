import * as React from "react"
import { Link } from "react-router-dom"
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconArrowLeft, IconEdit, IconTrash, IconEye } from "@tabler/icons-react"
import type { AdminComment } from "@/types/comment.type"

type Props = {
  comment: AdminComment | null
  loading: boolean
  error: string | null
  deleting: boolean
  onBack: () => void
  onDelete: () => void
}

const formatDate = (iso?: string) => {
  if (!iso) return "-"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const ViewCommentContent: React.FC<Props> = ({
  comment,
  loading,
  error,
  deleting,
  onBack,
  onDelete,
}) => {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
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

          {comment && (
            <div className="ml-auto flex items-center gap-2">
              <Link to={`/admin/dashboard/comments/edit/${comment.id}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <IconEdit className="h-4 w-4" />
                  Edit
                </Button>
              </Link>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={deleting}
                    className="flex items-center gap-2"
                  >
                    <IconTrash className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {comment
                        ? `Are you sure you want to delete comment #${comment.id}? This action cannot be undone.`
                        : "Are you sure you want to delete this comment? This action cannot be undone."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      disabled={deleting}
                      className="bg-red-600 focus:ring-red-600 hover:bg-red-700"
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-semibold">Comment Details</h1>
        <p className="text-muted-foreground">
          View ticket comment information
        </p>
      </div>

      <div className="px-4 lg:px-6">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-6 w-48 bg-muted/30 rounded" />
                <div className="h-4 w-full bg-muted/30 rounded" />
                <div className="h-4 w-2/3 bg-muted/30 rounded" />
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <div className="rounded border p-6 text-red-600">
            {error}
          </div>
        ) : !comment ? (
          <div className="rounded border p-6">
            Comment not found
          </div>
        ) : (
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Comment #{comment.id}</CardTitle>
                <CardDescription>Comment Information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Ticket
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{comment.ticketId}</Badge>
                      {comment.ticket?.title && (
                        <span className="text-muted-foreground">
                          {comment.ticket.title}
                        </span>
                      )}
                      <Link
                        to={`/admin/dashboard/tickets/view/${
                          comment.ticket?.id ?? comment.ticketId
                        }`}
                        className="inline-flex ml-1"
                        title="View Ticket"
                      >
                        <IconEye className="h-4 w-4" />
                      </Link>
                    </div>
                    {comment.ticket?.project?.name && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Project: {comment.ticket.project.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">
                      User
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {comment.user?.fullName ||
                          comment.user?.name ||
                          comment.user?.email ||
                          `User#${comment.userId}`}
                      </span>
                      {comment.user?.role && (
                        <Badge variant="outline" className="uppercase">
                          {comment.user.role}
                        </Badge>
                      )}
                    </div>
                    {comment.user?.email && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {comment.user.email}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Message
                  </div>
                  <div className="rounded border bg-muted/20 p-3 whitespace-pre-wrap">
                    {comment.message || "-"}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Created At
                    </div>
                    <div className="font-medium">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
