"use client"

import { Badge } from "@/components/ui/badge"
import type { ProjectStatus } from "@/types/project.type"

type ProjectStatusBadgeProps = {
    status: ProjectStatus
}

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({
    status,
}) => {
    if (status === "NOT_STARTED") {
        return <Badge variant="outline">Belum Dimulai</Badge>
    }

    if (status === "IN_PROGRESS") {
        return <Badge variant="secondary">Sedang Berjalan</Badge>
    }

    if (status === "DONE") {
        return <Badge variant="success">Selesai</Badge>
    }

    return <Badge variant="outline">{status}</Badge>
}
