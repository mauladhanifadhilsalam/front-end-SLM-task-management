"use client"

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
import type { PmDailyCadence } from "@/types/pm-daily-cadence.type"
import type { ProjectUpdate } from "@/types/project-update.type"

type ProjectUpdateItem = {
  label: string
  value: string
}

type Props = {
  data: PmDailyCadence | null
  loading?: boolean
  error?: string | null
  projectName?: string
  projectUpdate?: ProjectUpdate | null
  projectUpdateLoading?: boolean
  projectUpdateError?: string | null
}

export function PmDailyCadence({
  data,
  loading,
  error,
  projectName,
  projectUpdate,
  projectUpdateLoading,
  projectUpdateError,
}: Props) {
  const historyRows = data?.history ?? []
  const projectUpdates = projectUpdate
    ? buildProjectUpdates(projectUpdate)
    : []

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>PM Daily Cadence</CardTitle>
            <CardDescription>
              <span className="font-medium text-foreground">
                {projectName ?? "Project"}
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">
            Memuat daily cadence...
          </div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Card className="border border-border/60 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">History</CardTitle>
              </CardHeader>
              <CardContent>
                {historyRows.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    History not found.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-border/60 bg-card/60">
                    <Table className="border-separate border-spacing-0 text-sm">
                      <TableHeader className="bg-muted/40">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[28%]">Tanggal</TableHead>
                          <TableHead className="w-[18%]">
                            Jumlah Isu
                          </TableHead>
                          <TableHead>Catatan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyRows.map((row) => (
                          <TableRow
                            key={`${row.date}-${row.note}`}
                            className="transition-colors hover:bg-primary/5"
                          >
                            <TableCell className="font-medium">
                              {formatDate(row.date)}
                            </TableCell>
                            <TableCell className="text-center">
                              {row.totalIssues}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {row.note}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border/60 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Project Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {projectUpdateLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Memuat project updates...
                  </div>
                ) : projectUpdateError ? (
                  <div className="text-sm text-destructive">
                    {projectUpdateError}
                  </div>
                ) : projectUpdates.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Project updates not found.
                  </div>
                ) : (
                  projectUpdates.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start justify-between gap-4 border-b border-dashed border-border/70 pb-2 last:border-b-0 last:pb-0"
                    >
                      <span className="text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="text-right font-medium">{item.value}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function buildProjectUpdates(update: ProjectUpdate): ProjectUpdateItem[] {
  return [
    { label: "Tanggal", value: formatDate(update.reportDate) },
    { label: "Phase", value: update.phase?.name ?? "-" },
    { label: "Fasilitator", value: update.facilitator?.fullName ?? "-" },
    { label: "Peserta", value: update.participant || "-" },
    { label: "Tujuan Daily", value: update.objective || "-" },
    { label: "Highlight Progress", value: update.progressHighlight || "-" },
    { label: "Mood Team", value: update.teamMood || "-" },
  ]
}

function formatDate(value?: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}
