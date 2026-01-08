"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import { fetchTeamUpdateById } from "@/services/team-update.service"
import { teamUpdateKeys } from "@/lib/query-keys"
import { usePmProjects } from "@/pages/dashboard/pm/hooks/use-pm-projects"

type Props = {
  updateId: number
  onBack: () => void
  title: string
}

const formatDate = (value?: string) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

const statusLabel = (status?: string) => {
  if (!status) return "-"
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (s) => s.toUpperCase())
}

const statusStyles: Record<string, string> = {
  DONE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  NOT_STARTED: "bg-slate-50 text-slate-700 border-slate-200",
}

export function TeamUpdateDetail({ updateId, onBack, title }: Props) {
  const { projects } = usePmProjects()

  const updateQuery = useQuery({
    queryKey: teamUpdateKeys.detail(updateId),
    queryFn: () => fetchTeamUpdateById(updateId),
    enabled: Number.isFinite(updateId) && updateId > 0,
  })

  const projectLabel = React.useMemo(() => {
    if (!updateQuery.data) return "-"
    const match = projects.find(
      (project) => project.id === updateQuery.data?.projectId,
    )
    return match?.name ?? `Project ${updateQuery.data?.projectId}`
  }, [projects, updateQuery.data])

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 cursor-pointer"
          >
            <IconArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </div>
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>

      <div className="px-4 lg:px-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Detail Update</CardTitle>
            <CardDescription>Informasi update harian developer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            {updateQuery.isLoading ? (
              <p className="text-muted-foreground">Memuat data...</p>
            ) : updateQuery.error ? (
              <p className="text-red-600">Gagal memuat data.</p>
            ) : updateQuery.data ? (
              <>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="secondary">{projectLabel}</Badge>
                  <Badge variant="outline">
                    {updateQuery.data.developer.fullName}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      statusStyles[updateQuery.data.status] ??
                      "bg-muted text-foreground border-border"
                    }
                  >
                    {statusLabel(updateQuery.data.status)}
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground">
                    {formatDate(
                      updateQuery.data.updatedAt || updateQuery.data.createdAt,
                    )}
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <section className="rounded-lg border bg-muted/20 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Yesterday
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed">
                      {updateQuery.data.yesterdayWork}
                    </p>
                  </section>
                  <section className="rounded-lg border bg-muted/20 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Today
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed">
                      {updateQuery.data.todayWork}
                    </p>
                  </section>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <section className="rounded-lg border bg-muted/10 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Blocker
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed">
                      {updateQuery.data.blocker || "-"}
                    </p>
                  </section>
                  <section className="rounded-lg border bg-muted/10 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Next Action
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed">
                      {updateQuery.data.nextAction}
                    </p>
                  </section>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Data tidak ditemukan.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
