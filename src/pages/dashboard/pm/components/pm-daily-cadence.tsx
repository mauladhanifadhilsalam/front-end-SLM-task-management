"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { useProjectUpdates } from "@/pages/dashboard/pm/hooks/use-project-updates"
import {
  useCreateProjectUpdate,
  useUpdateProjectUpdate,
  useDeleteProjectUpdate,
} from "@/pages/dashboard/pm/hooks/use-project-update-mutations"
import type { PmDailyCadence } from "@/types/pm-daily-cadence.type"
import type { ProjectUpdate } from "@/types/project-update.type"
import { fetchProjectPhases } from "@/services/project-phase.service"
import { projectPhaseKeys } from "@/lib/query-keys"
import { HistorySection } from "@/pages/dashboard/pm/components/history-section"
import { ProjectUpdatesSection } from "@/pages/dashboard/pm/components/project-updates-section"
import { DeleteConfirmDialog } from "@/pages/dashboard/pm/components/project-update-delete-confirm-dialog"
import { ProjectUpdateDialog } from "@/pages/dashboard/pm/components/project-update-form"

type Phase = {
  id: number
  name: string
  startDate: string
  endDate: string
}

type Props = {
  data: PmDailyCadence | null
  loading?: boolean
  error?: string | null
  projectName?: string
  projectId?: number
  projectUpdate?: ProjectUpdate | null
  projectUpdateLoading?: boolean
  projectUpdateError?: string | null
  phases?: Phase[]
}

export type ProjectUpdateFormData = {
  reportDate: string
  phaseId: string
  participant: string
  objective: string
  progressHighlight: string
  teamMood: string
}

export function PmDailyCadence({
  data,
  loading,
  error,
  projectName,
  projectId,
  phases = [],
}: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUpdate, setEditingUpdate] = useState<ProjectUpdate | null>(null)
  const [deleteUpdateId, setDeleteUpdateId] = useState<number | null>(null)
  const [formData, setFormData] = useState<ProjectUpdateFormData>({
    reportDate: new Date().toISOString().split('T')[0],
    phaseId: "",
    participant: "",
    objective: "",
    progressHighlight: "",
    teamMood: "",
  })
  const [formError, setFormError] = useState<string | null>(null)

  const historyRows = data?.history ?? []

  const { 
    updates: projectUpdates = [], 
    loading: projectUpdateLoadingHook, 
    error: projectUpdateErrorHook, 
    reload 
  } = useProjectUpdates(projectId ? { projectId } : undefined)

  // Filter project updates untuk hari ini saja
  const today = new Date().toISOString().split('T')[0]
  const todayUpdates = projectUpdates.filter(update => {
    const updateDate = new Date(update.reportDate).toISOString().split('T')[0]
    return updateDate === today
  })

  const phasesQuery = useQuery({
    queryKey: projectPhaseKeys.list(projectId ? { projectId } : undefined),
    queryFn: () => fetchProjectPhases(projectId ? { projectId } : undefined),
    enabled: !!projectId,
  })

  const createMutation = useCreateProjectUpdate()
  const updateMutation = useUpdateProjectUpdate()
  const deleteMutation = useDeleteProjectUpdate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!projectId) {
      setFormError("Project tidak tersedia untuk membuat update")
      return
    }
    const payload = {
      projectId,
      reportDate: new Date(formData.reportDate).toISOString(),
      phaseId: parseInt(formData.phaseId),
      participant: formData.participant,
      objective: formData.objective,
      progressHighlight: formData.progressHighlight,
      teamMood: formData.teamMood,
    }

    try {
      if (editingUpdate) {
        await updateMutation.mutateAsync({ id: editingUpdate.id, payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      await reload()
      setIsDialogOpen(false)
      resetForm()
    } catch (err) {
      console.error("Error saving project update:", err)
    }
  }

  const handleEdit = (update: ProjectUpdate) => {
    setEditingUpdate(update)
    setFormData({
      reportDate: new Date(update.reportDate).toISOString().split('T')[0],
      phaseId: update.phaseId?.toString() || "",
      participant: update.participant || "",
      objective: update.objective || "",
      progressHighlight: update.progressHighlight || "",
      teamMood: update.teamMood || "",
    })
    setIsDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteUpdateId) return
    
    try {
      await deleteMutation.mutateAsync(deleteUpdateId)
      await reload()
      setDeleteUpdateId(null)
    } catch (err) {
      console.error("Error deleting project update:", err)
    }
  }

  const resetForm = () => {
    setEditingUpdate(null)
    setFormData({
      reportDate: new Date().toISOString().split('T')[0],
      phaseId: "",
      participant: "",
      objective: "",
      progressHighlight: "",
      teamMood: "",
    })
  }

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  return (
    <>
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
            <div className="grid gap-4 lg:grid-cols-2">
              <HistorySection historyRows={historyRows} />
              
              <ProjectUpdatesSection
                todayUpdates={todayUpdates}
                loading={projectUpdateLoadingHook}
                error={projectUpdateErrorHook}
                onEdit={handleEdit}
                onDelete={setDeleteUpdateId}
                onOpenDialog={() => setIsDialogOpen(true)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <ProjectUpdateDialog
        open={isDialogOpen}
        onOpenChange={handleDialogChange}
        editingUpdate={editingUpdate}
        formData={formData}
        setFormData={setFormData}
        phases={phases}
        phasesQuery={phasesQuery}
        onSubmit={handleSubmit}
        formError={formError}
      />

      <DeleteConfirmDialog
        open={deleteUpdateId !== null}
        onOpenChange={(open) => !open && setDeleteUpdateId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}