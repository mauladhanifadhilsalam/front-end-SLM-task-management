"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  IconLayoutGrid,
  IconChevronDown,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react"
import type { ProjectAssignment } from "@/types/project-assignment.type"
import type {
  ProjectAssignmentColumns,
} from "@/features/project-assignments/hooks/use-admin-project-assignments"

type Props = {
  assignments: ProjectAssignment[]
  filteredAssignments: ProjectAssignment[]
  loading: boolean
  error: string
  search: string
  setSearch: (value: string) => void
  columns: ProjectAssignmentColumns
  setColumns: React.Dispatch<React.SetStateAction<ProjectAssignmentColumns>>
  onCreateClick: () => void
  onRequestDelete: (id: number) => void
}


export const ProjectAssignmentsTable: React.FC<Props> = ({
  assignments,
  filteredAssignments,
  loading,
  error,
  search,
  setSearch,
  columns,
  setColumns,
  onCreateClick,
  onRequestDelete,
}) => {
  const hasFilter = search.trim() !== ""

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4 flex items-center gap-3">
        <Input
          placeholder="Filter by project, assignee, role, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80"
        />

        <div className="ml-auto flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="flex items-center gap-2 cursor-pointer"
              >
                <IconLayoutGrid className="h-4 w-4" />
                <span>Columns</span>
                <IconChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={columns.id}
                onCheckedChange={(v) =>
                  setColumns((c) => ({ ...c, id: !!v }))
                }
              >
                ID
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columns.project}
                onCheckedChange={(v) =>
                  setColumns((c) => ({ ...c, project: !!v }))
                }
              >
                Project
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columns.assignee}
                onCheckedChange={(v) =>
                  setColumns((c) => ({ ...c, assignee: !!v }))
                }
              >
                Assignee
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columns.roleInProject}
                onCheckedChange={(v) =>
                  setColumns((c) => ({ ...c, roleInProject: !!v }))
                }
              >
                Role
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columns.actions}
                onCheckedChange={(v) =>
                  setColumns((c) => ({ ...c, actions: !!v }))
                }
              >
                Actions
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            onClick={onCreateClick}
            className="cursor-pointer"
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Add Assignment
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-center">
              {columns.id && (
                <th className="px-4 py-3 font-medium">ID</th>
              )}
              {columns.project && (
                <th className="px-4 py-3 font-medium">Project</th>
              )}
              {columns.assignee && (
                <th className="px-4 py-3 font-medium">Assignee</th>
              )}
              {columns.roleInProject && (
                <th className="px-4 py-3 font-medium">Role</th>
              )}
              {columns.actions && (
                <th className="px-4 py-3 font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center"
                >
                  Memuat data...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-red-600"
                >
                  {error}
                </td>
              </tr>
            ) : (
              filteredAssignments.map((a) => (
                <tr
                  key={a.id}
                  className="border-t text-center"
                >
                  {columns.id && (
                    <td className="px-4 py-3">{a.id}</td>
                  )}
                  {columns.project && (
                    <td className="px-4 py-3">
                      {a.projectName || "-"}
                    </td>
                  )}
                  {columns.assignee && (
                    <td className="px-4 py-3">
                      {a.assigneeName || "-"}
                    </td>
                  )}
                  {columns.roleInProject && (
                    <td className="px-4 py-3">
                      {a.roleInProject ? (
                        <Badge variant="secondary">
                          {a.roleInProject}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </td>
                  )}
                  {columns.actions && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="none"
                          className="cursor-pointer rounded text-red-600 hover:text-red-700"
                          onClick={() => onRequestDelete(a.id)}
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && filteredAssignments.length === 0 && (
          hasFilter ? (
            <Card className="border-t bg-background">
              <div className="flex items-center gap-3 border-b p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium">
                    Hasil Pencarian
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tidak ditemukan hasil untuk{" "}
                    <span className="font-medium text-foreground">
                      “{search}”
                    </span>
                    .
                  </p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground">
                  Periksa ejaan kata kunci atau coba gunakan kata
                  kunci yang lebih umum.
                </p>
                <div className="mt-4 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSearch("")}
                  >
                    Bersihkan Pencarian
                  </Button>
                  <Button onClick={onCreateClick}>
                    Tambah Assignment
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-t bg-background">
              <div className="flex items-center gap-3 border-b p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 14a4 4 0 10-8 0m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2v-2m12 4v-6a2 2 0 00-2-2h-1M5 18v-6a2 2 0 012-2h1"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium">
                    Data Project Assignment
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Belum ada data yang ditampilkan.
                  </p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground">
                  Tambahkan project assignment untuk mulai mengatur
                  siapa yang bertanggung jawab pada setiap proyek.
                </p>
                <div className="mt-4">
                  <Button onClick={onCreateClick}>
                    Tambah Assignment
                  </Button>
                </div>
              </div>
            </Card>
          )
        )}
      </div>
    </div>
  )
}
