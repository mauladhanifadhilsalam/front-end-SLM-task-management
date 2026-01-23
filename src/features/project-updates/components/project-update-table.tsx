"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
} from "@/components/ui/alert-dialog"
import { TablePaginationControls } from "@/components/table-pagination-controls"
import {
  IconEdit,
  IconEye,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react"
import { useProjectUpdates } from "@/pages/dashboard/pm/hooks/use-project-updates"
import { deleteProjectUpdate } from "@/services/project-update.service"
import { projectUpdateKeys } from "@/lib/query-keys"
import type { ProjectUpdate } from "@/types/project-update.type"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

type Props = {
  title?: string
  description?: string
  createPath?: string
  basePath?: string
  showCreateButton?: boolean
}

export function ProjectUpdateTable({
  title = "Project Updates",
  description = "List update harian project yang dikirimkan tim.",
  createPath = "/admin/dashboard/project-updates/create",
  basePath = "/admin/dashboard/project-updates",
  showCreateButton = true,
}: Props) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [deleteTarget, setDeleteTarget] = React.useState<ProjectUpdate | null>(null)

  const { updates, pagination, loading, error } = useProjectUpdates({
    page,
    pageSize,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProjectUpdate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectUpdateKeys.all })
      toast.success("Project update berhasil dihapus")
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        "Gagal menghapus project update. Coba lagi."
      toast.error("Gagal menghapus project update", { description: msg })
    },
  })

  const handleViewUpdate = (id: number) => {
    navigate(`${basePath}/view/${id}`)
  }

  const handleEditUpdate = (id: number) => {
    navigate(`${basePath}/edit/${id}`)
  }

  const handleDeleteUpdate = (item: ProjectUpdate) => {
    setDeleteTarget(item)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    })
  }

  const formatDate = (value?: string) => {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date)
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3    ">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {showCreateButton && (
            <Button
              size="sm"
              onClick={() => navigate(createPath)}
              className="shrink-0 w-full sm:w-auto"
            >
              <IconPlus className="mr-1 h-4 w-4" />
              Create Project Update
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Report Date</TableHead>
                <TableHead>Project ID</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Fasilitator</TableHead>
                <TableHead>Peserta</TableHead>
                <TableHead>Objective</TableHead>
                <TableHead>Progress Highlight</TableHead>
                <TableHead>Mood</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-44" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-44" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )
                : error ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-destructive"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : updates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    Tidak ada data ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                updates.map((update) => (
                  <TableRow key={update.id}>
                    <TableCell className="font-medium">
                      {formatDate(update.reportDate)}
                    </TableCell>
                    <TableCell>{update.projectId}</TableCell>
                    <TableCell>{update.phase?.name ?? "-"}</TableCell>
                    <TableCell>
                      {update.facilitator?.fullName ?? "-"}
                    </TableCell>
                    <TableCell className={cn("whitespace-normal max-w-[150px]")}>
                      <p className="truncate" title={update.participant || "-"}>
                        {update.participant || "-"}
                      </p>
                    </TableCell>
                    <TableCell className={cn("whitespace-normal max-w-[150px]")}>
                      <p className="truncate" title={update.objective || "-"}>
                        {update.objective || "-"}
                      </p>
                    </TableCell>
                    <TableCell className={cn("whitespace-normal max-w-[150px]")}>
                      <p className="truncate" title={update.progressHighlight || "-"}>
                        {update.progressHighlight || "-"}
                      </p>
                    </TableCell>
                    <TableCell className={cn("whitespace-normal max-w-[150px]")}>
                      <p className="truncate" title={update.teamMood || "-"}>
                        {update.teamMood || "-"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewUpdate(update.id)}
                          aria-label="View update"
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditUpdate(update.id)}
                          aria-label="Edit update"
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteUpdate(update)}
                          aria-label="Delete update"
                          disabled={deleteMutation.isPending}
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <TablePaginationControls
          total={pagination.total}
          page={pagination.page}
          pageSize={pagination.pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          label="project updates"
        />
      </CardContent>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => (!open ? setDeleteTarget(null) : undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus project update?</AlertDialogTitle>
            <AlertDialogDescription>
              Project update #{deleteTarget?.id} akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
