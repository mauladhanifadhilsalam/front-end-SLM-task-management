"use client"

import * as React from "react"
import type { ProjectRole } from "@/types/project-roles.type"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

type Props = {
  projectRole: ProjectRole | undefined
  loading: boolean
  error: string
}

export const ViewProjectRoleContent: React.FC<Props> = ({
  projectRole,
  loading,
  error,
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

  if (error) {
    return (
      <Card className="max-w-xl">
        <CardContent className="py-6">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!projectRole) {
    return (
      <Card className="max-w-xl">
        <CardContent className="py-6">
          <p className="text-muted-foreground">Project role not found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>{projectRole.name}</CardTitle>
        <CardDescription>Project Role Details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">ID</p>
            <p className="text-sm">{projectRole.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Code</p>
            <p className="text-sm">{projectRole.code}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-sm">{projectRole.name}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
