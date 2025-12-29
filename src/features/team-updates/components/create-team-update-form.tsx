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
import { useCreateTeamUpdateForm } from "../hooks/use-create-team-update-form"
import { usePmProjects } from "@/pages/dashboard/pm/hooks/use-pm-projects"
import type {
  TeamUpdateField,
  TeamUpdateStatusOption,
} from "@/schemas/team-update.schema"

type Props = {
  onSuccess?: () => void
}

const statusOptions: { value: TeamUpdateStatusOption; label: string }[] = [
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "DONE", label: "Done" },
]

export const CreateTeamUpdateForm: React.FC<Props> = ({ onSuccess }) => {
  const { projects, loading: loadingProjects, error: projectError } =
    usePmProjects()
  const { form, errors, saving, handleChange, handleBlur, handleSubmit } =
    useCreateTeamUpdateForm({
      onSuccess: () => {
        if (onSuccess) onSuccess()
      },
    })

  const handleInputChange =
    (field: TeamUpdateField) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      handleChange(field, e.target.value)
    }

  const handleInputBlur = (field: TeamUpdateField) => () =>
    handleBlur(field)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Update</CardTitle>
        <CardDescription>
          Isi update harian untuk project yang sedang kamu kerjakan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-2">
            <Label htmlFor="projectId">Project *</Label>
            <Select
              value={form.projectId}
              onValueChange={(val) => handleChange("projectId", val)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="yesterdayWork">Yesterday Work *</Label>
              <Textarea
                id="yesterdayWork"
                value={form.yesterdayWork}
                onChange={handleInputChange("yesterdayWork")}
                onBlur={handleInputBlur("yesterdayWork")}
                placeholder="Apa yang kamu kerjakan kemarin?"
                disabled={saving}
                aria-invalid={!!errors.yesterdayWork}
                required
                className="min-h-[120px] resize-y"
              />
              {errors.yesterdayWork && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.yesterdayWork}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="todayWork">Today Work *</Label>
              <Textarea
                id="todayWork"
                value={form.todayWork}
                onChange={handleInputChange("todayWork")}
                onBlur={handleInputBlur("todayWork")}
                placeholder="Apa yang akan kamu kerjakan hari ini?"
                disabled={saving}
                aria-invalid={!!errors.todayWork}
                required
                className="min-h-[120px] resize-y"
              />
              {errors.todayWork && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.todayWork}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="blocker">Blocker</Label>
              <Input
                id="blocker"
                value={form.blocker}
                onChange={handleInputChange("blocker")}
                onBlur={handleInputBlur("blocker")}
                placeholder="Hambatan yang dihadapi (jika ada)"
                disabled={saving}
              />
              {errors.blocker && (
                <p className="text-xs text-red-600 mt-1">{errors.blocker}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextAction">Next Action *</Label>
              <Input
                id="nextAction"
                value={form.nextAction}
                onChange={handleInputChange("nextAction")}
                onBlur={handleInputBlur("nextAction")}
                placeholder="Langkah berikutnya"
                disabled={saving}
                aria-invalid={!!errors.nextAction}
                required
              />
              {errors.nextAction && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.nextAction}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={form.status}
              onValueChange={(val) =>
                handleChange("status", val as TeamUpdateStatusOption)
              }
              disabled={saving}
            >
              <SelectTrigger id="status" className="w-full md:w-[240px]">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-xs text-red-600 mt-1">{errors.status}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="submit" disabled={saving} className="cursor-pointer">
              <IconCheck className="mr-2 h-4 w-4" />
              {saving ? "Menyimpan..." : "Simpan Update"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
