"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import type {
  EditProjectRoleFormData,
  FieldErrors,
} from "../hooks/use-edit-project-role-form"

type Props = {
  loading: boolean
  saving: boolean
  error: string
  form: EditProjectRoleFormData
  fieldErrors: FieldErrors
  onChange: (field: keyof EditProjectRoleFormData, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export const EditProjectRoleForm: React.FC<Props> = ({
  loading,
  saving,
  error,
  form,
  fieldErrors,
  onChange,
  onSubmit,
  onCancel,
}) => {
  if (loading) {
    return (
      <Card className="max-w-xl">
        <CardContent className="py-6">
          <p className="text-muted-foreground">Loading project role...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Project Role Information</CardTitle>
        <CardDescription>
          Update the project role details
        </CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">Code (Optional)</Label>
            <Input
              id="code"
              placeholder="e.g., TECH_LEAD"
              value={form.code}
              onChange={(e) => onChange("code", e.target.value)}
              disabled={saving}
            />
            {fieldErrors.code && (
              <p className="text-sm text-red-600">{fieldErrors.code}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Tech Lead"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              disabled={saving}
            />
            {fieldErrors.name && (
              <p className="text-sm text-red-600">{fieldErrors.name}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 pt-5">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
