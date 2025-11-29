"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  IconLayoutGrid,
  IconChevronDown,
  IconPlus,
} from "@tabler/icons-react"
import {
  ProjectColumns,
  StatusFilter,
} from "../hooks/use-admin-projects"

type Props = {
  search: string
  statusFilter: StatusFilter
  columns: ProjectColumns
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: StatusFilter) => void
  onToggleColumn: (
    key: keyof ProjectColumns,
    value: boolean | "indeterminate",
  ) => void
  onCreateProject: () => void
}

const COLUMN_LABELS: Record<keyof ProjectColumns, string> = {
  id: "ID",
  name: "Nama",
  categories: "Kategori",
  owner: "Owner",
  status: "Status",
  completion: "Progress",
  startDate: "Mulai",
  endDate: "Selesai",
  actions: "Aksi",
}

export const ProjectsToolbar: React.FC<Props> = ({
  search,
  statusFilter,
  columns,
  onSearchChange,
  onStatusFilterChange,
  onToggleColumn,
  onCreateProject,
}) => {
  const handleStatusChange = (value: string) => {
    onStatusFilterChange(value as StatusFilter)
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 md:w-auto w-full">
        <Input
          placeholder="Cari nama, owner, kategori, atau catatan..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:w-80"
        />
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ALL</SelectItem>
            <SelectItem value="NOT_STARTED">NOT_STARTED</SelectItem>
            <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
            <SelectItem value="DONE">DONE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-2 sm:w-auto"
            >
              <IconLayoutGrid className="h-4 w-4" />
              Kolom
              <IconChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            {(Object.keys(columns) as (keyof ProjectColumns)[]).map((key) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={columns[key]}
                onCheckedChange={(v) => onToggleColumn(key, v)}
              >
                {COLUMN_LABELS[key]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={onCreateProject} className="w-full sm:w-auto">
          <IconPlus className="mr-2 h-4 w-4" />
          Tambah Project
        </Button>
      </div>
    </div>
  )
}
