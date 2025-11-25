"use client"

import * as React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconUsers, IconUserCheck } from "@tabler/icons-react"

// Sesuaikan dengan tipe assignment di detail project kamu.
// Kalau kamu sudah punya `ProjectAssignment` di `project.type`, pakai itu saja.
export type ProjectAssignmentView = {
  id: number
  userId: number
  roleInProject: string
  isActive?: boolean | null
  allocation?: number | null
  notes?: string | null
  user?: {
    id: number
    fullName?: string
    email: string
    role?: string
  }
}

type Props = {
  assignments: ProjectAssignmentView[]
}

const getRoleLabel = (role: string) => {
  const map: Record<string, string> = {
    TECH_LEAD: "Tech Lead",
    BACK_END: "Backend Developer",
    FRONT_END: "Frontend Developer",
    DEVOPS: "DevOps",
    CLOUD_ENGINEER: "Cloud Engineer",
  }
  return map[role] ?? role.replace(/_/g, " ")
}

export const ProjectAssignmentsOverview: React.FC<Props> = ({
  assignments,
}) => {
  if (!assignments || assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Assignments</CardTitle>
          <CardDescription>
            Belum ada anggota tim yang di-assign ke project ini.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle>Project Assignments</CardTitle>
          <CardDescription>
            Daftar anggota tim yang terlibat di project ini.
          </CardDescription>
        </div>
        <IconUsers className="h-5 w-5 text-muted-foreground" />
      </CardHeader>

      <CardContent className="space-y-3">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="flex flex-col gap-1 rounded border bg-card p-3 text-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <IconUserCheck className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium leading-none">
                    {assignment.user?.fullName ||
                      assignment.user?.email ||
                      `User #${assignment.userId}`}
                  </p>
                </div>
              </div>

              <Badge
                variant={
                  assignment.isActive === false ? "outline" : "default"
                }
              >
                {getRoleLabel(assignment.roleInProject)}
              </Badge>
            </div>




          </div>
        ))}
      </CardContent>
    </Card>
  )
}
