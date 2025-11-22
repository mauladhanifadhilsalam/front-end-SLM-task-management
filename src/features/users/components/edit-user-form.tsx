"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { IconCheck } from "@tabler/icons-react"
import { RoleEnum } from "@/schemas/users.schema"
import { useEditUserForm } from "../hooks/use-edit-user-form"

type Props = {
  userId?: string
  onCancel: () => void
  onSuccess: () => void
}

export const EditUserForm: React.FC<Props> = ({
  userId,
  onCancel,
  onSuccess,
}) => {
  const {
    form,
    loading,
    saving,
    errorMsg,
    fieldErrors,
    handleChange,
    handleSubmit,
  } = useEditUserForm({
    userId,
    onSuccess,
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="rounded border p-6">Memuat data...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi User</CardTitle>
        <CardDescription>
          Ubah data user kemudian simpan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errorMsg && (
          <div className="rounded border p-4 mb-4 text-sm text-red-600">
            {errorMsg}
          </div>
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
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="Masukkan nama lengkap"
                disabled={saving}
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
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="user@example.com"
                disabled={saving}
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
                value={form.role}
                onValueChange={(v) => handleChange("role", v)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RoleEnum.enum.PROJECT_MANAGER}>
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
              <Label htmlFor="password">
                Password (kosongkan jika tidak ingin mengubah)
              </Label>
              <Input
                id="password"
                type="password"
                value={form.password ?? ""}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Masukkan password baru"
                disabled={saving}
                aria-invalid={!!fieldErrors.password}
                />
                {fieldErrors.password && (
                    <p className="text-xs pl-1 text-red-600">
                    {fieldErrors.password}
                    </p>
                )}
                </div>
            </div>

            <div className="flex justify-end space-x-3">
                <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={saving}
                >
                Batal
                </Button>
                <Button type="submit" disabled={saving}>
                <IconCheck className="mr-2 h-4 w-4" />
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
            </div>
            </form>
        </CardContent>
        </Card>
    )
}
