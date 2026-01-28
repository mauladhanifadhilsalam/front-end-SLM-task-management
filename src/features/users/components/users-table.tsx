"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { IconEye, IconEdit } from "@tabler/icons-react"
import { User, Role } from "@/types/user.types"
import type { PaginationMeta } from "@/types/pagination"
import { TablePaginationControls } from "@/components/table-pagination-controls"
import { UserTableColumns } from "../hooks/use-admin-user"
import { UserDeleteDialog } from "./users-delete-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"

type Props = {
  users: User[]
  columns: UserTableColumns
  loading: boolean
  error: string
  onDeleteUser: (id: number) => void
  pagination: PaginationMeta
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onToggleUserStatus: (id: number, isActive: boolean) => void
}

export const UsersTable: React.FC<Props> = ({
  users,
  columns,
  loading,
  error,
  onDeleteUser,
  pagination,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onToggleUserStatus,
}) => {
  const role = (localStorage.getItem("role") || "ADMIN") as Role
  const isPm = role === "PROJECT_MANAGER"

  const basePath = isPm
    ? "/project-manager/dashboard/users"
    : "/admin/dashboard/users"

  const canDelete = !isPm



  if (error) {
    return <div className="rounded border p-6 text-red-600">{error}</div>
  }



  return (
    <div className="overflow-x-auto rounded border">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50">
          <tr className="text-center">
            {columns.id && <th className="px-4 py-3 font-medium">ID</th>}
            {columns.fullName && (
              <th className="px-4 py-3 font-medium">FullName</th>
            )}
            {columns.email && (
              <th className="px-4 py-3 font-medium">Email</th>
            )}
            {columns.passwordHash && (
              <th className="px-4 py-3 font-medium">Password</th>
            )}
            {columns.role && (
              <th className="px-4 py-3 font-medium">Role</th>
            )}
            {columns.projectRole && (
              <th className="px-4 py-3 font-medium">Project Role</th>
            )}
            {columns.isActive && (
                  <th className="px-4 py-3 font-medium">Status</th>
            )}
            {columns.actions && (
              <th className="px-4 py-3 font-medium">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
  {loading ? (
    Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="border-t text-center">
        {columns.id && (
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-10 mx-auto" />
          </td>
        )}
        {columns.fullName && (
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-32 mx-auto" />
          </td>
        )}
        {columns.email && (
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-44 mx-auto" />
          </td>
        )}
        {columns.passwordHash && (
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-40 mx-auto" />
          </td>
        )}
        {columns.role && (
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-24 mx-auto" />
          </td>
        )}
        {columns.projectRole && (
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-28 mx-auto" />
          </td>
        )}
        {columns.isActive && (
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-16 mx-auto" />
          </td>
        )}

        {columns.actions && (
          <td className="px-4 py-3">
            <div className="flex justify-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-4" />
            </div>
          </td>
        )}
      </tr>
    ))
  ) : error ? (
    <tr>
      <td colSpan={7} className="p-6 text-center text-red-600">
        {error}
      </td>
    </tr>
  ) : users.length === 0 ? (
    <tr>
      <td colSpan={7} className="p-6 text-center text-muted-foreground">
        Belum ada data.
      </td>
    </tr>
  ) : (
    users.map((u) => (
      <tr key={u.id} className="border-t text-center">
        {columns.id && <td className="px-4 py-3">{u.id}</td>}
        {columns.fullName && <td className="px-4 py-3">{u.fullName}</td>}
        {columns.email && <td className="px-4 py-3">{u.email}</td>}
        {columns.passwordHash && (
          <td className="px-4 py-3">{u.passwordHash}</td>
        )}
        {columns.role && (
          <td className="px-4 py-3">
            {u.role.replace("_", " ")}
          </td>
        )}
        {columns.projectRole && (
          <td className="px-4 py-3">
            {u.projectRole ? u.projectRole.replace("_", " ") : "-"}
          </td>
        )}
        {columns.isActive && (
          <td className="px-4 py-3">
            <div className="flex justify-center items-center gap-2">
              <Switch
                checked={u.isActive}
                disabled={isPm}
                onCheckedChange={(checked) =>
                  onToggleUserStatus(u.id, checked)
                }
              />
              <span className="text-xs text-muted-foreground">
                {u.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </td>
        )}

        {columns.actions && (
          <td className="px-4 py-3">
            <div className="flex justify-center gap-2">
              <Link to={`${basePath}/view/${u.id}`}>
                <IconEye className="h-4 w-4" />
              </Link>
              <Link to={`${basePath}/edit/${u.id}`}>
                <IconEdit className="h-4 w-4" />
              </Link>
              {canDelete && (
                <UserDeleteDialog
                  userId={u.id}
                  onConfirm={() => onDeleteUser(u.id)}
                />
              )}
            </div>
          </td>
        )}
      </tr>
    ))
  )}
</tbody>

      </table>

      <TablePaginationControls
        total={pagination.total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        label="users"
      />
    </div>
  )
}
