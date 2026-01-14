"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconCheck } from "@tabler/icons-react"
import {
  RoleEnum,
  type CreateUserField,
} from "@/schemas/users.schema"
import { useCreateUserForm } from "../hooks/use-create-user-form"
import { fetchProjectRoles } from "@/services/project-role.service"
import { projectRoleKeys } from "@/lib/query-keys"

type Props = {
  onSuccess?: () => void
}

export const CreateUserForm: React.FC<Props> = ({ onSuccess }) => {
  const {
    formData,
    fieldErrors,
    loading,
    errorMsg,
    successMsg,
    handleInputChange,
    handleSubmit,
  } = useCreateUserForm({
    onSuccess: () => {
      if (onSuccess) onSuccess()
    },
  })

  const { data: projectRoles = [] } = useQuery({
    queryKey: projectRoleKeys.all,
    queryFn: () => fetchProjectRoles(),
  })

  const handleChange =
    (field: CreateUserField) => (e: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange(field, e.target.value)
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi User</CardTitle>
        <CardDescription>
          Isi informasi user yang diperlukan.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMsg && (
          <p className="mb-3 text-sm text-red-600">{errorMsg}</p>
        )}
        {successMsg && (
          <p className="mb-3 text-sm text-emerald-600">
            {successMsg}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          noValidate
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={handleChange("fullName")}
                placeholder="Masukkan nama lengkap"
                disabled={loading}
                aria-invalid={!!fieldErrors.fullName}
                required
              />
              {fieldErrors.fullName && (
                <p className="text-xs pl-1 text-red-600">
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                placeholder="user@example.com"
                disabled={loading}
                aria-invalid={!!fieldErrors.email}
                required
              />
              {fieldErrors.email && (
                <p className="text-xs pl-1 text-red-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  handleInputChange("role", value)
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value={RoleEnum.enum.PROJECT_MANAGER}
                  >
                    Project Manager
                  </SelectItem>
                  <SelectItem value={RoleEnum.enum.DEVELOPER}>
                    Developer
                  </SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.role && (
                <p className="text-xs pl-1 text-red-600">
                  {fieldErrors.role}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange("password")}
                placeholder="Masukkan password"
                disabled={loading}
                aria-invalid={!!fieldErrors.password}
                required
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-600">
                  {fieldErrors.password}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="projectRole">Project Role</Label>
              <Select
                value={formData.projectRole || ""}
                onValueChange={(value) =>
                  handleInputChange("projectRole", value)
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih project role (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  {projectRoles.map((pr) => (
                    <SelectItem key={pr.code} value={pr.code}>
                      {pr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.projectRole && (
                <p className="text-xs pl-1 text-red-600">
                  {fieldErrors.projectRole}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={loading}>
              <IconCheck className="mr-2 h-4 w-4" />
              {loading ? "Menyimpan..." : "Simpan User"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
