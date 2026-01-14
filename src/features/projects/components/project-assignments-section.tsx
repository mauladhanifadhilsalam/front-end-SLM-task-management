"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select"
import { UserLite } from "@/types/user.types"
import { ProjectAssignmentForm } from "@/types/project.type"

type Props = {
  assignments: ProjectAssignmentForm[]
  users: UserLite[]
  loading: boolean
  onAddAssignment: () => void
  onRemoveAssignment: (index: number) => void
  onUpdateAssignment: <K extends keyof ProjectAssignmentForm>(
    index: number,
    key: K,
    value: ProjectAssignmentForm[K],
  ) => void
}

export const ProjectAssignmentsSection: React.FC<Props> = ({
  assignments,
  users,
  loading,
  onAddAssignment,
  onRemoveAssignment,
  onUpdateAssignment,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Assignment Tim</Label>
        <Button
          type="button"
          variant="outline"
          onClick={onAddAssignment}
          className="flex items-center gap-2"
          disabled={loading}
        >
          <Plus className="size-4" />
          Tambah Assignment
        </Button>
      </div>

      {assignments.map((assignment, i) => (
        <div
          key={i}
          className="border rounded-md p-4 space-y-3 bg-muted/20"
        >
          <div className="flex justify-between items-center">
            <Label>Assignment {i + 1}</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemoveAssignment(i)}
              className="text-red-500 hover:text-red-700"
              disabled={loading}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>User</Label>
              <Select
                value={
                  assignment.userId === 0
                    ? ""
                    : String(assignment.userId)
                }
                onValueChange={(value) =>
                  onUpdateAssignment(i, "userId", Number(value))
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih User..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {users.length === 0 && (
                      <SelectItem disabled value="0">
                        Tidak ada user ditemukan.
                      </SelectItem>
                    )}
                    {users.map((user) => (
                      <SelectItem
                        key={user.id}
                        value={String(user.id)}
                      >
                        {user.fullName} - {user.projectRole ?? user.role}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
