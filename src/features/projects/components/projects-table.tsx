"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { IconEye, IconEdit} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Project } from "@/types/project.type"
import type { PaginationMeta } from "@/types/pagination"
import { TablePaginationControls } from "@/components/table-pagination-controls"
import { ProjectColumns } from "../hooks/use-admin-projects"
import { ProjectDeleteDialog } from "./project-delete-dialog"

type Props = {
  projects: Project[]
  loading: boolean
  error: string
  columns: ProjectColumns
  colSpan: number
  onDelete: (id: number) => void
  pagination: PaginationMeta
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export const ProjectsTable: React.FC<Props> = ({
  projects,
  loading,
  error,
  columns,
  colSpan,
  onDelete,
  pagination,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
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
            {columns.id && (
              <th className="px-4 py-3 font-medium">ID</th>
            )}
            {columns.name && (
              <th className="px-4 py-3 font-medium">Nama</th>
            )}
            {columns.categories && (
              <th className="px-4 py-3 font-medium">
                Kategori
              </th>
            )}
            {columns.owner && (
              <th className="px-4 py-3 font-medium">Owner</th>
            )}
            {columns.status && (
              <th className="px-4 py-3 font-medium">Status</th>
            )}
            {columns.completion && (
              <th className="px-4 py-3 font-medium">
                Progress
              </th>
            )}
            {columns.startDate && (
              <th className="px-4 py-3 font-medium">Mulai</th>
            )}
            {columns.endDate && (
              <th className="px-4 py-3 font-medium">
                Selesai
              </th>
            )}
            {columns.actions && (
              <th className="px-4 py-3 font-medium">Aksi</th>
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
              <td colSpan={colSpan} className="px-4 py-6 text-center text-red-600">
                {error}
              </td>
            </tr>
          ) : projects.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="px-4 py-6 text-center">
                Tidak ada data ditemukan.
              </td>
            </tr>
          ) : (
            projects.map((p) => (
              <tr key={p.id} className="border-t text-center">
                {columns.id && (
                  <td className="px-4 py-3">{p.id}</td>
                )}
                {columns.name && (
                  <td className="px-4 py-3">{p.name}</td>
                )}
                {columns.categories && (
                  <td className="px-4 py-3">
                    {p.categories?.length
                      ? p.categories.join(", ")
                      : "-"}
                  </td>
                )}
                {columns.owner && (
                  <td className="px-4 py-3">
                    {p.owner ? (
                      <>
                        <div className="font-medium">
                          {p.owner.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {p.owner.company}
                        </div>
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                )}
                {columns.status && (
                  <td className="px-4 py-3">
                    <Badge variant="secondary">
                      {p.status}
                    </Badge>
                  </td>
                )}
                {columns.completion && (
                  <td className="px-4 py-3">
                    {p.completion}%
                  </td>
                )}
                {columns.startDate && (
                  <td className="px-4 py-3">
                    {p.startDate
                      ? new Date(
                        p.startDate,
                      ).toLocaleDateString("id-ID")
                      : "-"}
                  </td>
                )}
                {columns.endDate && (
                  <td className="px-4 py-3">
                    {p.endDate
                      ? new Date(
                        p.endDate,
                      ).toLocaleDateString("id-ID")
                      : "-"}
                  </td>
                )}
                {columns.actions && (
                  <td className="px-4 py-3">
                    <div className="flex justify-center items-center gap-5">
                      <Link
                        to={`${basePath}/projects/view/${p.id}`}
                      >
                        <IconEye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </Link>

                      <Link
                        to={`${basePath}/projects/edit/${p.id}`}
                      >
                        <IconEdit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </Link>
                      <div className="">
                        <ProjectDeleteDialog
                          projectId={p.id}
                          projectName={p.name}
                          onConfirm={() => onDelete(p.id)}
                        />
                      </div>
                    </div>
                  </td>
                )}
              </tr>
            )))}
          </tbody>
        </table>
      <TablePaginationControls
        total={pagination.total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        label="projects"
      />
    </div>
  )
}
