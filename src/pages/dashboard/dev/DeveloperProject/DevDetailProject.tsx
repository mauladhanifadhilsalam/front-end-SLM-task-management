"use client"

import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppSidebarDev } from "../components/app-sidebardev"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"

import { useProjectDetail } from "@/features/projects/hooks/use-project-detail"
import { ProjectDetailCard } from "@/features/projects/components/project-detail-card"
import { ProjectPhasesOverview } from "@/features/projects/components/project-phases-overview"
import { ProjectAssignmentsOverview } from "@/features/projects/components/project-assignments-overview"

import { ProjectDetailCardSkeleton } from "@/features/projects/components/project-detail-card-skeleton"
import { ProjectPhasesOverviewSkeleton } from "@/features/projects/components/project-phase-overview-skeleton"
import { ProjectAssignmentsOverviewSkeleton } from "@/features/projects/components/project-assignment-overview-skeleton"

export default function DevDetailProject() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { project, loading, error } = useProjectDetail(id)

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebarDev variant="inset" />
      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-1 flex-col p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigate("/developer-dashboard/projects")
              }
              className="flex items-center gap-2"
            >
              <IconArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold mb-2">
            Detail Project
          </h1>
          <p className="text-muted-foreground mb-6">
            Informasi lengkap project yang sedang kamu kerjakan.
          </p>

          {/* Loading */}
          {loading && (
            <div className="p-6">
              <ProjectDetailCardSkeleton />
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <ProjectPhasesOverviewSkeleton />
                <ProjectAssignmentsOverviewSkeleton />
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="p-6 text-red-600">{error}</div>
          )}

          {/* Empty */}
          {!loading && !error && !project && (
            <div className="p-6">Project tidak ditemukan.</div>
          )}

          {/* Content */}
          {!loading && !error && project && (
            <>
              <ProjectDetailCard project={project} />
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <ProjectPhasesOverview phases={project.phases ?? []} />
                <ProjectAssignmentsOverview
                  assignments={project.assignments ?? []}
                />
              </div>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
