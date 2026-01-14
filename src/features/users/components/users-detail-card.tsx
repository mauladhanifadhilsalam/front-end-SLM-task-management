"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User } from "@/types/user.types"
import { formatDateTime } from "@/utils/format-date-time"

type Props = {
  user: User
}

export const UserDetailCard: React.FC<Props> = ({ user }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.fullName || "-"}</CardTitle>
        <CardDescription>
          Informasi akun dan meta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">
              ID
            </div>
            <div className="font-medium">{user.id}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">
              Role
            </div>
            <div className="mt-1">
              <Badge className="capitalize">
                {user.role.replace("_", " ")}
              </Badge>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">
              Email
            </div>
            <div className="font-medium">{user.email}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">
              Project Role
            </div>
            <div className="font-medium">
              {user.projectRole ? (
                <Badge variant="outline" className="capitalize">
                  {user.projectRole.replace(/_/g, " ")}
                </Badge>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">
              Dibuat
            </div>
            <div className="font-medium">
              {formatDateTime(user.createdAt)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
