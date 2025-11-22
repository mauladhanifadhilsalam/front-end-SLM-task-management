"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Loader2 } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useCreateProjectForm } from "@/features/projects/hooks/use-create-project-form"
import { ProjectBasicSection } from "@/features/projects/components/project-basic-section"
import { ProjectClientSection } from "@/features/projects/components/project-client-section"
import { ProjectDatesSection } from "@/features/projects/components/project-dates-section"
import { ProjectPhasesSection } from "@/features/projects/components/project-phases-section"
import { ProjectAssignmentsSection } from "@/features/projects/components/project-assignments-section"

export default function CreateProjectPage() {
  const navigate = useNavigate()

  const {
    form,
    owners,
    users,
    openOwner,
    setOpenOwner,
    loading,
    isInvalidDateRange,
    isAnyPhaseInvalid,
    hasIncompleteAssignment,
    updateField,
    addCategory,
    removeCategory,
    addPhase,
    removePhase,
    updatePhase,
    addAssignment,
    removeAssignment,
    updateAssignment,
    handleSubmit,
  } = useCreateProjectForm({
    onSuccess: () => navigate("/admin/dashboard/projects"),
    onUnauthorized: () => navigate("/login"),
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
        <div className="flex flex-1 flex-col px-4 lg:px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigate("/admin/dashboard/projects")
              }
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </div>

          <h1 className="text-2xl font-semibold">
            Tambah Project Baru
          </h1>
          <p className="text-muted-foreground mb-6">
            Tambah informasi project, phases, dan assignment tim di
            sini.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Project</CardTitle>
              <CardDescription>
                Isi semua data project dengan lengkap.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                <ProjectBasicSection
                  name={form.name}
                  categories={form.categories}
                  notes={form.notes}
                  loading={loading}
                  onNameChange={(v) =>
                    updateField("name", v)
                  }
                  onAddCategory={addCategory}
                  onRemoveCategory={removeCategory}
                  onNotesChange={(v) =>
                    updateField("notes", v)
                  }
                />

                <ProjectClientSection
                  owners={owners}
                  ownerId={form.ownerId}
                  openOwner={openOwner}
                  setOpenOwner={setOpenOwner}
                  loading={loading}
                  onOwnerChange={(id) =>
                    updateField("ownerId", id)
                  }
                />

                <ProjectDatesSection
                  startDate={form.startDate}
                  endDate={form.endDate}
                  loading={loading}
                  isInvalidDateRange={isInvalidDateRange}
                  onStartDateChange={(date) =>
                    updateField("startDate", date)
                  }
                  onEndDateChange={(date) =>
                    updateField("endDate", date)
                  }
                />

                <ProjectPhasesSection
                  phases={form.phases}
                  startDate={form.startDate}
                  endDate={form.endDate}
                  loading={loading}
                  onAddPhase={addPhase}
                  onRemovePhase={removePhase}
                  onUpdatePhase={updatePhase}
                />

                <ProjectAssignmentsSection
                  assignments={form.assignments}
                  users={users}
                  loading={loading}
                  onAddAssignment={addAssignment}
                  onRemoveAssignment={removeAssignment}
                  onUpdateAssignment={updateAssignment}
                />

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    className="w-full md:w-auto"
                    disabled={
                      loading ||
                      isAnyPhaseInvalid ||
                      isInvalidDateRange ||
                      hasIncompleteAssignment
                    }
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Project"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
