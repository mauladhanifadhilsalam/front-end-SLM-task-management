"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconCheck } from "@tabler/icons-react"
import { useProjectUpdateForm } from "../hooks/use-project-update-form"
import { usePmProjects } from "@/pages/dashboard/pm/hooks/use-pm-projects"
import { useQuery } from "@tanstack/react-query"
import { projectPhaseKeys } from "@/lib/query-keys"
import { fetchProjectPhasesWithPagination } from "@/services/project-phase.service"
import type { ProjectUpdateField, ProjectUpdateValues } from "@/schemas/project-update.schema"

type Props = {
  mode: "create" | "edit"
  updateId?: number
  initialValues?: Partial<ProjectUpdateValues>
  onSuccess?: () => void
}

export const ProjectUpdateForm: React.FC<Props> = ({
  mode,
  updateId,
  initialValues,
  onSuccess,
}) => {
  const { projects, loading: loadingProjects, error: projectError } = usePmProjects()

  const { form, errors, saving, handleChange, handleBlur, handleSubmit } =
    useProjectUpdateForm({
      mode,
      updateId,
      initialValues,
      onSuccess: () => {
        if (onSuccess) onSuccess()
      },
    })

  // Fetch phases filtered by selected project
  const selectedProjectId = form.projectId ? Number(form.projectId) : undefined
  
  const phasesQuery = useQuery({
    queryKey: projectPhaseKeys.list({ projectId: selectedProjectId, pageSize: 100 }),
    queryFn: () => fetchProjectPhasesWithPagination({ projectId: selectedProjectId, pageSize: 100 }),
    staleTime: 60 * 1000,
    enabled: !!selectedProjectId, // Only fetch when project is selected
  })

  const phases = phasesQuery.data?.phases ?? []

  // Handle project change - reset phase when project changes
  const handleProjectChange = React.useCallback((val: string) => {
    handleChange("projectId", val)
    // Reset phase when project changes
    handleChange("phaseId", "")
  }, [handleChange])

  const handleInputChange =
    (field: ProjectUpdateField) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      handleChange(field, e.target.value)
    }

  const handleInputBlur = (field: ProjectUpdateField) => () =>
    handleBlur(field)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create" : "Edit"} Project Update</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Isi update harian untuk project."
            : "Perbarui data project update."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="projectId">Project *</Label>
              <Select
                value={form.projectId}
                onValueChange={handleProjectChange}
                disabled={saving || loadingProjects}
              >
                <SelectTrigger id="projectId" className="w-full">
                  <SelectValue placeholder="Pilih project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      {projectError || "Project belum tersedia"}
                    </SelectItem>
                  ) : (
                    projects.map((project) => (
                      <SelectItem key={project.id} value={String(project.id)}>
                        {project.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.projectId && (
                <p className="text-xs text-red-600 mt-1">{errors.projectId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phaseId">Phase *</Label>
              <Select
                value={form.phaseId ?? ""}
                onValueChange={(val) => handleChange("phaseId", val)}
                disabled={saving || phasesQuery.isLoading || !selectedProjectId}
              >
                <SelectTrigger id="phaseId" className="w-full">
                  <SelectValue placeholder={!selectedProjectId ? "Pilih project terlebih dahulu" : "Pilih phase"} />
                </SelectTrigger>
                <SelectContent>
                  {phases.length === 0 && selectedProjectId ? (
                    <SelectItem value="no-phases" disabled>
                      Tidak ada phase untuk project ini
                    </SelectItem>
                  ) : (
                    phases.map((phase) => (
                      <SelectItem key={phase.id} value={String(phase.id)}>
                        {phase.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.phaseId && (
                <p className="text-xs text-red-600 mt-1">{errors.phaseId}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="reportDate">Tanggal Laporan *</Label>
              <Input
                id="reportDate"
                type="date"
                value={form.reportDate}
                onChange={handleInputChange("reportDate")}
                onBlur={handleInputBlur("reportDate")}
                disabled={saving}
                aria-invalid={!!errors.reportDate}
                required
              />
              {errors.reportDate && (
                <p className="text-xs text-red-600 mt-1">{errors.reportDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamMood">Team Mood *</Label>
              <Input
                id="teamMood"
                value={form.teamMood ?? ""}
                onChange={handleInputChange("teamMood")}
                onBlur={handleInputBlur("teamMood")}
                placeholder="Contoh: Energized, Cautiously optimistic, Focused"
                disabled={saving}
              />
              {errors.teamMood && (
                <p className="text-xs text-red-600 mt-1">{errors.teamMood}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="participant">Participant *</Label>
            <Textarea
              id="participant"
              value={form.participant ?? ""}
              onChange={handleInputChange("participant")}
              onBlur={handleInputBlur("participant")}
              placeholder="Daftar peserta meeting/update"
              disabled={saving}
              className="min-h-[80px] resize-y"
            />
            {errors.participant && (
              <p className="text-xs text-red-600 mt-1">{errors.participant}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="objective">Objective *</Label>
            <Textarea
              id="objective"
              value={form.objective ?? ""}
              onChange={handleInputChange("objective")}
              onBlur={handleInputBlur("objective")}
              placeholder="Objektif yang ingin dicapai"
              disabled={saving}
              className="min-h-[100px] resize-y"
            />
            {errors.objective && (
              <p className="text-xs text-red-600 mt-1">{errors.objective}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="progressHighlight">Progress Highlight *</Label>
            <Textarea
              id="progressHighlight"
              value={form.progressHighlight ?? ""}
              onChange={handleInputChange("progressHighlight")}
              onBlur={handleInputBlur("progressHighlight")}
              placeholder="Highlight progress yang sudah dicapai"
              disabled={saving}
              className="min-h-[100px] resize-y"
            />
            {errors.progressHighlight && (
              <p className="text-xs text-red-600 mt-1">{errors.progressHighlight}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="submit" disabled={saving} className="cursor-pointer">
              <IconCheck className="mr-2 h-4 w-4" />
              {saving ? "Menyimpan..." : mode === "create" ? "Simpan" : "Update"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
