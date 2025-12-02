"use client"

import * as React from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconTimeline } from "@tabler/icons-react"
import type { ProjectPhase } from "@/types/project.type" 

type Props = {
  phases: ProjectPhase[]
}

const formatDate = (value?: string | null) => {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "-"
  try {
    return format(d, "dd MMM yyyy", { locale: id })
  } catch {
    return "-"
  }
}

export const ProjectPhasesOverview: React.FC<Props> = ({ phases }) => {
  if (!phases || phases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Phase Project</CardTitle>
          <CardDescription>
            Belum ada phase yang dibuat untuk project ini.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const sorted = [...phases].sort((a, b) => {
    const da = a.startDate ? new Date(a.startDate).getTime() : 0
    const db = b.startDate ? new Date(b.startDate).getTime() : 0
    return da - db
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle>Phase Project</CardTitle>
          <CardDescription>
            Timeline fase dari awal sampai akhir project.
          </CardDescription>
        </div>
        <IconTimeline className="h-5 w-5 text-muted-foreground" />
      </CardHeader>

      <CardContent className="space-y-4">
        <ol className="relative ms-3 border-s border-border space-y-4">
          {sorted.map((phase, index) => (
            <li key={phase.id ?? index} className="ms-4">
              <div className="absolute -start-[7px] mt-1 h-3 w-3 rounded-full border border-border bg-background" />
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium leading-none">
                    {phase.name || `Phase ${index + 1}`}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(phase.startDate)} &mdash;{" "}
                    {formatDate(phase.endDate)}
                  </p>
                </div>

                <Badge variant="outline">
                  {phase.startDate && phase.endDate
                    ? "Terjadwal"
                    : "Belum lengkap"}
                </Badge>
              </div>

            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
