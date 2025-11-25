"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ProjectDetail } from "@/types/project.type"
import { ProjectStatusBadge } from "./project-status-bagde"
import { formatDateTime } from "@/utils/format-date-time"

type ProjectDetailCardProps = {
  project: ProjectDetail
}

export const ProjectDetailCard: React.FC<ProjectDetailCardProps> = ({
  project,
}) => {
  return (
        <Card>
        <CardHeader>
            <CardTitle>{project.name}</CardTitle>
            <CardDescription>
            Dimiliki oleh {project.owner?.name ?? "-"} (
            {project.owner?.company ?? "Tidak diketahui"})
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <div className="text-sm text-muted-foreground">ID</div>
                <div className="font-medium">{project.id}</div>
            </div>

            <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <ProjectStatusBadge status={project.status} />
            </div>

            <div>
                <div className="text-sm text-muted-foreground">Progress</div>
                <div className="font-medium">{project.completion}%</div>
            </div>

            <div>
                <div className="text-sm text-muted-foreground">Kategori</div>
                <div className="font-medium">
                {project.categories?.join(", ") || "-"}
                </div>
            </div>

            <div>
                <div className="text-sm text-muted-foreground">Tanggal Mulai</div>
                <div className="font-medium">
                {formatDateTime(project.startDate)}
                </div>
            </div>

            <div>
                <div className="text-sm text-muted-foreground">Tanggal Selesai</div>
                <div className="font-medium">
                {formatDateTime(project.endDate)}
                </div>
            </div>
            </div>

            <div>
            <div className="text-sm text-muted-foreground mb-1">Catatan</div>
            <div className="font-medium">{project.notes || "-"}</div>
            </div>

            <div>
            <div className="text-sm text-muted-foreground mb-1">
                Informasi Pemilik
            </div>
            <div className="font-medium">
                {project.owner?.name} - {project.owner?.company}
            </div>
            <div className="text-sm text-muted-foreground">
                {project.owner?.email}
            </div>
            </div>

            <div>

            </div>
        </CardContent>
        </Card>
    )
}
