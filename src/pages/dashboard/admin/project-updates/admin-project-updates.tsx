"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TablePaginationControls } from "@/components/table-pagination-controls"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useProjectUpdates } from "@/pages/dashboard/pm/hooks/use-project-updates"
import { cn } from "@/lib/utils"

export default function AdminProjectUpdates() {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const { updates, pagination, loading, error } = useProjectUpdates({
    page,
    pageSize,
  })

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
              <div>
                <h1 className="text-2xl font-semibold">Project Updates</h1>
                <p className="text-muted-foreground">
                  List update harian project yang dikirimkan tim.
                </p>
              </div>

              <div className="overflow-x-auto rounded border">
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          Memuat data...
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center text-destructive"
                        >
                          {error}
                        </TableCell>
                      </TableRow>
                    ) : updates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
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
                          <TableCell className={cn("whitespace-normal")}>
                            {update.participant || "-"}
                          </TableCell>
                          <TableCell className={cn("whitespace-normal")}>
                            {update.objective || "-"}
                          </TableCell>
                          <TableCell className={cn("whitespace-normal")}>
                            {update.progressHighlight || "-"}
                          </TableCell>
                          <TableCell>{update.teamMood || "-"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <TablePaginationControls
                  total={pagination.total}
                  page={pagination.page}
                  pageSize={pagination.pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  label="project updates"
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
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
