"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { IconArrowLeft, IconCheck } from "@tabler/icons-react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import type { ProjectLite, UserLite, RoleInProject } from "@/types/project-assignment.type"
import type {
  CreateAssignmentFormState,
  CreateAssignmentFormError,
} from "@/features/project-assignments/hooks/use-create-project-assignment-form"

type Props = {
  projects: ProjectLite[]
  users: UserLite[]
  loadingProjects: boolean
  loadingUsers: boolean
  form: CreateAssignmentFormState
  errors: CreateAssignmentFormError
  saving: boolean
  onBack: () => void
  onChange: (field: keyof CreateAssignmentFormState, value: string) => void
  onRoleChange: (value: RoleInProject) => void
  onSubmit: (e: React.FormEvent) => void
}

export const CreateProjectAssignmentForm: React.FC<Props> = ({
  projects,
  users,
  loadingProjects,
  loadingUsers,
  form,
  errors,
  saving,
  onBack,
  onChange,
  onRoleChange,
  onSubmit,
}) => {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="mb-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex cursor-pointer items-center gap-2"
            >
              <IconArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </div>
          <h1 className="text-2xl font-semibold">
            Tambah Project Assignment
          </h1>
        </div>

        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Assignment</CardTitle>
              <CardDescription>
                Pilih project, user, dan role dalam project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-6" noValidate>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="projectId">Project *</Label>
                    <Select
                      value={form.projectId}
                      onValueChange={(val) => onChange("projectId", val)}
                    >
                      <SelectTrigger id="projectId">
                        <SelectValue
                          placeholder={
                            loadingProjects
                              ? "Memuat project..."
                              : "Pilih project"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.name} (ID: {p.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.projectId && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.projectId}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userId">User *</Label>
                    <Select
                      value={form.userId}
                      onValueChange={(val) => onChange("userId", val)}
                    >
                      <SelectTrigger id="userId">
                        <SelectValue
                          placeholder={
                            loadingUsers ? "Memuat user..." : "Pilih user"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.fullName} (ID: {u.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.userId && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.userId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Role in Project *</Label>
                    <Select
                      value={form.roleInProject}
                      onValueChange={(val) =>
                        onRoleChange(val as RoleInProject)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FRONT_END">FRONT_END</SelectItem>
                        <SelectItem value="BACK_END">BACK_END</SelectItem>
                        <SelectItem value="TECH_LEAD">TECH_LEAD</SelectItem>
                        <SelectItem value="DEVOPS">DEVOPS</SelectItem>
                        <SelectItem value="CLOUD_ENGINEER">
                          CLOUD_ENGINEER
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.roleInProject && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.roleInProject}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={onBack}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="cursor-pointer"
                  >
                    <IconCheck className="mr-2 h-4 w-4" />
                    {saving ? "Menyimpan..." : "Simpan Assignment"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
