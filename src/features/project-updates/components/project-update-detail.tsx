"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconArrowLeft, IconEdit } from "@tabler/icons-react"
import { fetchProjectUpdateById } from "@/services/project-update.service"
import { projectUpdateKeys } from "@/lib/query-keys"
import { ProjectUpdateDetailSkeleton } from "./project-update-detail-skeleton"

type Props = {
  updateId: number
  title?: string
  onBack?: () => void
  onEdit?: () => void
}

export const ProjectUpdateDetail: React.FC<Props> = ({
  updateId,
  title = "Project Update Detail",
  onBack,
  onEdit,
}) => {
  const query = useQuery({
    queryKey: projectUpdateKeys.detail(updateId),
    queryFn: () => fetchProjectUpdateById(updateId),
    enabled: Number.isFinite(updateId) && updateId > 0,
  })

  const update = query.data

  const formatDate = (value?: string) => {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2 cursor-pointer"
            >
              <IconArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex items-center gap-2 cursor-pointer"
            >
              <IconEdit className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>

      <div className="px-4 lg:px-6">
        {query.isLoading ? (
          <ProjectUpdateDetailSkeleton />
        ) : query.error ? (
          <p className="text-sm text-red-600">Gagal memuat data.</p>
        ) : !update ? (
          <p className="text-sm text-muted-foreground">Data tidak ditemukan.</p>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                Project Update #{update.id}
              </CardTitle>
              <CardDescription>
                Dibuat pada {formatDate(update.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Project ID
                  </p>
                  <p className="text-sm">{update.projectId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Tanggal Laporan
                  </p>
                  <p className="text-sm">{formatDate(update.reportDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Phase
                  </p>
                  <p className="text-sm">{update.phase?.name ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Fasilitator
                  </p>
                  <p className="text-sm">{update.facilitator?.fullName ?? "-"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Participant
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {update.participant || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Objective
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {update.objective || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Progress Highlight
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {update.progressHighlight || "-"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Team Mood
                  </p>
                  <p className="text-sm">{update.teamMood || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Terakhir Diperbarui
                  </p>
                  <p className="text-sm">{formatDate(update.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
