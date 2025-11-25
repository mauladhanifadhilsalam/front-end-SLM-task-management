"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconEye, IconEdit, IconTrash } from "@tabler/icons-react"

// TODO: sesuaikan dengan path tipe Project kamu
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
      return { label: "Belum mulai", variant: "outline" as const }
    case "IN_PROGRESS":
      return { label: "Berjalan", variant: "default" as const }
    case "ON_HOLD":
      return { label: "Ditahan", variant: "secondary" as const }
    case "COMPLETED":
      return { label: "Selesai", variant: "default" as const }
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
      <div className="rounded border p-6">
        Memuat data project...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Terjadi kesalahan saat memuat project: {error}
      </div>
    )
  }

  if (projects.length === 0) {
    return null // biar tetap pakai empty state di page
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => {
        const status = getStatusVariant(project.status)

        return (
          <Card key={project.id} className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="line-clamp-1">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {project.notes || "Tidak ada catatan tambahan."}
                  </CardDescription>
                </div>
                <Badge variant={status.variant} className="shrink-0">
                  {status.label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-2 text-sm">
              {project.owner && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Owner</span>
                  <span className="font-medium">
                    {project.owner.name}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tanggal</span>
                <span className="font-medium">
                  {formatDate(project.startDate)} &mdash; {formatDate(project.endDate)}
                </span>
              </div>

              {typeof project.completion === "number" && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {project.completion}%
                  </span>
                </div>
              )}

              {Array.isArray(project.categories) && project.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {project.categories.map((cat) => (
                    <Badge key={cat} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to={`/project-manager/dashboard/projects/view/${project.id}`}>
                    <IconEye className="mr-1 h-4 w-4" />
                    Detail
                  </Link>
                </Button>

                <Button asChild size="sm" variant="outline">
                  <Link to={`/project-manager/dashboard/projects/edit/${project.id}`}>
                    <IconEdit className="mr-1 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              </div>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(project.id)}
              >
                <IconTrash className="mr-1 h-4 w-4" />
                Hapus
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
