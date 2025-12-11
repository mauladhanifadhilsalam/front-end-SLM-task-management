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
  IconDownload,
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
  onDownloadReport?: () => void
  downloadDisabled?: boolean
  showColumnToggle?: boolean
  onAddProject?: () => void
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
  onDownloadReport,
  downloadDisabled = false,
  showColumnToggle = true,
  onAddProject,
}) => {
  const handleStatusChange = (value: string) => {
    onStatusFilterChange(value as StatusFilter)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
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

      <div className="flex flex-row flex-wrap items-center gap-2">
        {showColumnToggle && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-2 whitespace-nowrap px-3"
              >
                <IconLayoutGrid className="h-4 w-4" />
                Columns
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
        )}

        {onDownloadReport && (
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2 whitespace-nowrap px-3 bg-green-600 hover:bg-green-500 text-white border-transparent"
            onClick={onDownloadReport}
            disabled={downloadDisabled}
          >
            <IconDownload className="h-4 w-4" />
            Download Excel
          </Button>
        )}
      </div>
    </div>
  )
}
