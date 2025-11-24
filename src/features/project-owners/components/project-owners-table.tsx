"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { IconEye, IconEdit } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { ProjectOwner } from "@/types/project-owner.type"
import { ProjectOwnerColumns } from "../hooks/use-admin-project-owners"
import { ProjectOwnerDeleteDialog } from "./project-owner-delete-dialog"

type Props = {
  owners: ProjectOwner[]
  loading: boolean
  error: string
  columns: ProjectOwnerColumns
  colSpan: number
  onDeleteOwner: (id: number) => void
}

export const ProjectOwnersTable: React.FC<Props> = ({
  owners,
  loading,
  error,
  columns,
  colSpan,
  onDeleteOwner,
}) => {
  const role = (localStorage.getItem("role") || "").toUpperCase()
  const basePath =
    role === "PROJECT_MANAGER"
      ? "/project-manager/dashboard"
      : "/admin/dashboard"

  return (
    <div className="overflow-x-auto rounded border">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50">
          <tr className="text-center">
            {columns.id && <th className="px-4 py-3 font-medium">ID</th>}
            {columns.name && <th className="px-4 py-3 font-medium">Name</th>}
            {columns.company && (
              <th className="px-4 py-3 font-medium">Company</th>
            )}
            {columns.email && <th className="px-4 py-3 font-medium">Email</th>}
            {columns.phone && <th className="px-4 py-3 font-medium">Phone</th>}
            {columns.address && (
              <th className="px-4 py-3 font-medium">Address</th>
            )}
            {columns.actions && (
              <th className="px-4 py-3 font-medium">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={colSpan} className="px-4 py-6 text-center">
                Memuat data...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td
                colSpan={colSpan}
                className="px-4 py-6 text-center text-red-600"
              >
                {error}
              </td>
            </tr>
          ) : (
            owners.map((o) => (
              <tr key={o.id} className="border-t text-center">
                {columns.id && <td className="px-4 py-3">{o.id}</td>}
                {columns.name && <td className="px-4 py-3">{o.name}</td>}
                {columns.company && (
                  <td className="px-4 py-3">
                    <Badge variant="secondary">
                      {o.company || "-"}
                    </Badge>
                  </td>
                )}
                {columns.email && (
                  <td className="px-4 py-3">{o.email}</td>
                )}
                {columns.phone && (
                  <td className="px-4 py-3">{o.phone || "-"}</td>
                )}
                {columns.address && (
                  <td className="px-4 py-3">{o.address || "-"}</td>
                )}
                {columns.actions && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`${basePath}/project-owners/view/${o.id}`}
                        className="px-2 py-1 rounded"
                      >
                        <IconEye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`${basePath}/project-owners/edit/${o.id}`}
                        className="px-2 py-1 rounded"
                      >
                        <IconEdit className="h-4 w-4" />
                      </Link>
                      <ProjectOwnerDeleteDialog
                        ownerId={o.id}
                        ownerName={o.name}
                        onConfirm={() => onDeleteOwner(o.id)}
                      />
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
