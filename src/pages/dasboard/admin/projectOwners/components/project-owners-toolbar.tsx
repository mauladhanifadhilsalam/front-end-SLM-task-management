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
  IconLayoutGrid,
  IconChevronDown,
  IconPlus,
} from "@tabler/icons-react"
import { ProjectOwnerColumns } from "../hooks/use-admin-project-owners"

type Props = {
  search: string
  onSearchChange: (value: string) => void
  columns: ProjectOwnerColumns
  onToggleColumn: (
    key: keyof ProjectOwnerColumns,
    value: boolean | "indeterminate",
  ) => void
  onAddOwner: () => void
}

export const ProjectOwnersToolbar: React.FC<Props> = ({
  search,
  onSearchChange,
  columns,
  onToggleColumn,
  onAddOwner,
}) => {
  return (
    <div className="flex items-center gap-3 mb-4">
      <Input
        placeholder="Filter by name, email or company..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
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
              onCheckedChange={(v) => onToggleColumn("id", v)}
            >
              ID
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columns.name}
              onCheckedChange={(v) => onToggleColumn("name", v)}
            >
              Name
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columns.company}
              onCheckedChange={(v) => onToggleColumn("company", v)}
            >
              Company
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columns.email}
              onCheckedChange={(v) => onToggleColumn("email", v)}
            >
              Email
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columns.phone}
              onCheckedChange={(v) => onToggleColumn("phone", v)}
            >
              Phone
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columns.address}
              onCheckedChange={(v) => onToggleColumn("address", v)}
            >
              Address
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columns.actions}
              onCheckedChange={(v) => onToggleColumn("actions", v)}
            >
              Actions
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          onClick={onAddOwner}
          className="cursor-pointer"
        >
          <IconPlus className="mr-2 h-4 w-4" />
          Add Owner
        </Button>
      </div>
    </div>
  )
}
