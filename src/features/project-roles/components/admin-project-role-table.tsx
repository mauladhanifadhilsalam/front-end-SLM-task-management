"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { IconEye, IconEdit, IconTrash } from "@tabler/icons-react"
import type { ProjectRole } from "@/types/project-roles.type"
import type { PaginationMeta } from "@/types/pagination"
import { TablePaginationControls } from "@/components/table-pagination-controls"
import type { ProjectRoleTableColumns } from "../hooks/use-admin-project-roles"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"

type Props = {
  projectRoles: ProjectRole[]
  columns: ProjectRoleTableColumns
  loading: boolean
  error: string
  onDeleteProjectRole: (code: string) => void
  pagination: PaginationMeta
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export const AdminProjectRoleTable: React.FC<Props> = ({
  projectRoles,
  columns,
  loading,
  error,
  onDeleteProjectRole,
  pagination,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const basePath = "/admin/dashboard/project-roles"


  return (
    <div className="overflow-x-auto rounded border">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50">
          <tr className="text-center">
            {columns.id && <th className="px-4 py-3 font-medium">ID</th>}
            {columns.code && <th className="px-4 py-3 font-medium">Code</th>}
            {columns.name && <th className="px-4 py-3 font-medium">Name</th>}
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
                {columns.code && (
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </td>
                )}
                {columns.name && (
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-36 mx-auto" />
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
              <td colSpan={4} className="px-4 py-6 text-center text-red-600">
                {error}
              </td>
            </tr>
          ) : projectRoles.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                Belum ada data.
              </td>
            </tr>
          ) : (
            projectRoles.map((role) => (
              <tr key={role.id} className="border-t text-center">
                {columns.id && <td className="px-4 py-3">{role.id}</td>}
                {columns.code && <td className="px-4 py-3">{role.code}</td>}
                {columns.name && <td className="px-4 py-3">{role.name}</td>}
                {columns.actions && (
                  <td className="px-4 py-3">
                    <div className="flex justify-center items-center gap-2">
                      <Link to={`${basePath}/view/${role.code}`}>
                        <IconEye className="h-4 w-4" />
                      </Link>
                      <Link to={`${basePath}/edit/${role.code}`}>
                        <IconEdit className="h-4 w-4" />
                      </Link>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="inline-flex text-red-600 hover:text-red-800">
                            <IconTrash className="h-4 w-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Hapus Project Role?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus project role "
                              {role.name}"? Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-800"
                              onClick={() => onDeleteProjectRole(role.code)}
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
        label="project roles"
      />
    </div>
  )
}
