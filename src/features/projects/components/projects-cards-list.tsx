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
import { Skeleton } from "@/components/ui/skeleton"

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

import { ProjectGanttChartDialog } from "@/features/projects/components/gantt-chart-dialog"

import {
  IconEye,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconListDetails,
  IconTimeline,
  IconAlertTriangle,
  IconCalendarEvent,
} from "@tabler/icons-react"

import type { Project } from "@/types/project.type"

type Props = {
  projects: Project[]
  loading: boolean
  error: string
  onDelete: (id: number) => void
}

export const ProjectsCardsList: React.FC<Props> = ({
  projects,
  loading,
  error,
  onDelete,
}) => {
  const [ganttProject, setGanttProject] = React.useState<Project | null>(null)

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (projects.length === 0) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <AlertDialog key={project.id}>
          <Card className="flex h-full flex-col justify-between border bg-card/80 shadow-sm">
            <CardHeader className="relative pb-3">
              <div className="absolute right-4 top-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <IconDotsVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem asChild>
                      <Link to={`/project-manager/dashboard/projects/view/${project.id}`}>
                        <IconEye className="h-3.5 w-3.5 mr-2" />
                        Detail project
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/project-manager/dashboard/projects/edit/${project.id}`}>
                        <IconEdit className="h-3.5 w-3.5 mr-2" />
                        Edit project
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setGanttProject(project)}>
                      <IconTimeline className="h-3.5 w-3.5 mr-2" />
                      View Gantt Chart
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/project-manager/dashboard/projects/tasks/${project.id}`}>
                        <IconListDetails className="h-3.5 w-3.5 mr-2" />
                        View task
                      </Link>
                    </DropdownMenuItem>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-destructive">
                        <IconTrash className="h-3.5 w-3.5 mr-2" />
                        Delete project
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-col gap-2 pr-10">
                <CardTitle className="line-clamp-1 text-base">
                  {project.name}
                </CardTitle>
                <Badge variant="outline" className="w-fit text-[10px]">
                  {project.status}
                </Badge>
                <CardDescription className="line-clamp-2 text-xs">
                  {project.notes}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-2 border-t bg-muted/20 px-4 py-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owner</span>
                <span className="font-medium">{project.owner?.name}</span>
              </div>
            </CardContent>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus project ini?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini tidak bisa dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-white"
                  onClick={() => onDelete(project.id)}
                >
                  Ya, hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </Card>
        </AlertDialog>
      ))}

      <ProjectGanttChartDialog
        project={ganttProject}
        onClose={() => setGanttProject(null)}
      />
    </div>
  )
}

function ProjectCardSkeleton() {
  return (
    <Card className="flex h-full flex-col justify-between border bg-card/80">
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </CardHeader>
      <CardContent className="space-y-2 border-t bg-muted/20 px-4 py-3">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-3 w-3/4" />
      </CardContent>
    </Card>
  )
}
