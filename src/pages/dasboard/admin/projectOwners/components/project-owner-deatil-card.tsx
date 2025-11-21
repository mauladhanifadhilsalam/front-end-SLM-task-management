"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { ProjectOwner } from "@/types/project-owner.type"
import { formatDateTime } from "@/utils/format-date-time"

type Props = {
  owner: ProjectOwner
}

export const ProjectOwnerDetailCard: React.FC<Props> = ({ owner }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{owner.name}</CardTitle>
        <CardDescription>
          Informasi kontak dan meta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">
              ID
            </div>
            <div className="font-medium">{owner.id}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">
              Company
            </div>
            <div className="font-medium">
              {owner.company || "-"}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">
              Email
            </div>
            <div className="font-medium">
              {owner.email || "-"}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">
              Phone
            </div>
            <div className="font-medium">
              {owner.phone || "-"}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="text-sm text-muted-foreground">
              Address
            </div>
            <div className="font-medium">
              {owner.address || "-"}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="text-sm text-muted-foreground">
              Dibuat
            </div>
            <div className="font-medium">
              {formatDateTime(owner.createdAt)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
