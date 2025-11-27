"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
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
  IconDotsVertical,
  IconListDetails,
} from "@tabler/icons-react"
import type { Project } from "@/types/project.type"

type Props = {
  projects: Project[]
  loading: boolean
  error: string
  onDelete: (id: number) => void
}

const formatDate = (value?: Date | string | null) => {
  if (!value) return "-"
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const getStatusVariant = (status: Project["status"]) => {
  switch (status) {
    case "NOT_STARTED":
      return { label: "NOT STARTED", variant: "outline" as const }
    case "IN_PROGRESS":
      return { label: "IN PROGRESS", variant: "default" as const }
    case "ON_HOLD":
      return { label: "ON HOLD", variant: "secondary" as const }
    case "COMPLETED":
      return { label: "COMPLETED", variant: "default" as const }
    default:
      return { label: String(status ?? "Unknown"), variant: "outline" as const }
  }
}

export const ProjectsCardsList: React.FC<Props> = ({
  projects,
  loading,
  error,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl border bg-background/40 p-6 text-sm">
        Memuat data project...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Terjadi kesalahan saat memuat project: {error}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border bg-background/40 p-6 text-sm text-muted-foreground">
        Belum ada project yang terdaftar.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => {
        const status = getStatusVariant(project.status)

        return (
          <AlertDialog key={project.id}>
            <Card className="flex h-full flex-col justify-between border bg-card/80 shadow-sm transition hover:-translate-y-[2px] hover:shadow-md">
              <CardHeader className="relative pb-3">
                {/* TITIK TIGA - POSISI KANAN ATAS */}
                <div className="absolute right-4 top-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <IconDotsVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem asChild>
                        <Link className="flex items-center gap-2 text-xs" to={`/project-manager/dashboard/projects/view/${project.id}`}>
                          <IconEye className="h-3.5 w-3.5" />
                          Detail project
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link className="flex items-center gap-2 text-xs" to={`/project-manager/dashboard/projects/edit/${project.id}`}>
                          <IconEdit className="h-3.5 w-3.5" />
                          Edit project
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link className="flex items-center gap-2 text-xs" to={`/project-manager/dashboard/projects/tasks/${project.id}`}>
                          <IconListDetails className="h-3.5 w-3.5" />
                          View task
                        </Link>
                      </DropdownMenuItem>

                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="flex items-center gap-2 text-xs text-destructive focus:text-destructive">
                          <IconTrash className="h-3.5 w-3.5 text-destructive" />
                          Delete project
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* TITLE + STATUS */}
                <div className="flex flex-col gap-2 pr-10">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1 text-base">
                      {project.name}
                    </CardTitle>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={status.variant} className="text-[10px]">
                      {status.label}
                    </Badge>
                    {typeof project.completion === "number" && (
                      <span className="text-[11px] text-muted-foreground">
                        {project.completion}% complete
                      </span>
                    )}
                  </div>

                  <CardDescription className="mt-1 line-clamp-2 text-xs">
                    {project.notes || "Tidak ada catatan tambahan."}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-2 border-t bg-muted/20 px-4 py-3 text-xs">
                {project.owner && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Owner</span>
                    <span className="font-medium truncate">
                      {project.owner.name}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Project duration</span>
                  <span className="font-medium text-right">
                    {formatDate(project.startDate)} — {formatDate(project.endDate)}
                  </span>
                </div>

                {Array.isArray(project.categories) && project.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {project.categories.map((cat) => (
                      <Badge key={cat} variant="outline" className="text-[10px]">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>

              {/* Dialog konfirmasi delete */}
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus project ini?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak bisa dibatalkan. Project dan data terkait
                    mungkin tidak bisa dipulihkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-white hover:bg-destructive/90"
                    onClick={() => onDelete(project.id)}
                  >
                    Ya, hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </Card>
          </AlertDialog>
        )
      })}
    </div>
  )
}
