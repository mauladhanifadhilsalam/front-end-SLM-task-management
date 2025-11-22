"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { IconEye, IconEdit } from "@tabler/icons-react"
import { User } from "@/types/user.types"
import { UserTableColumns } from "../hooks/use-admin-user"
import { UserDeleteDialog } from "./users-delete-dialog"

type Props = {
  users: User[]
  columns: UserTableColumns
  loading: boolean
  error: string
  onDeleteUser: (id: number) => void
}

export const UsersTable: React.FC<Props> = ({
  users,
  columns,
  loading,
  error,
  onDeleteUser,
}) => {
  if (loading) {
    return <div className="rounded border p-6">Memuat data...</div>
  }

  if (error) {
    return <div className="rounded border p-6 text-red-600">{error}</div>
  }

  if (users.length === 0) {
    return <div className="rounded border p-6">Belum ada data.</div>
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
                {columns.actions && (
                <th className="px-4 py-3 font-medium">Actions</th>
                )}
            </tr>
            </thead>
            <tbody>
            {users.map((u) => (
                <tr key={u.id} className="border-t text-center">
                {columns.id && <td className="px-4 py-3">{u.id}</td>}
                {columns.fullName && (
                    <td className="px-4 py-3">{u.fullName}</td>
                )}
                {columns.email && <td className="px-4 py-3">{u.email}</td>}
                {columns.passwordHash && (
                    <td className="px-4 py-3">{u.passwordHash}</td>
                )}
                {columns.role && (
                    <td className="px-4 py-3">
                    <span>{u.role.replace("_", " ")}</span>
                    </td>
                )}
                {columns.actions && (
                    <td className="px-4 py-3">
                    <div className="flex justify-center items-center gap-2">
                        <Link
                        to={`/admin/dashboard/users/view/${u.id}`}
                        className="inline-flex"
                        >
                        <IconEye className="h-4 w-4" />
                        </Link>
                        <Link
                        to={`/admin/dashboard/users/edit/${u.id}`}
                        className="inline-flex"
                        >
                        <IconEdit className="h-4 w-4" />
                        </Link>
                        <UserDeleteDialog
                          userId={u.id}
                          onConfirm={() => onDeleteUser(u.id)}
                        />
                    </div>
                    </td>
                )}
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    )
}
