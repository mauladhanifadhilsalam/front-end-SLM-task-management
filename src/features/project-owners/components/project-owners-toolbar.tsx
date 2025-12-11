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
    <div className="flex flex-col gap-3 mb-6">
      {/* Mobile & Tablet: Stack vertically, Desktop: Single row with space-between */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        {/* Left Group: Search Input */}
        <Input
          placeholder="Filter by name, email or company..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full lg:flex-1 lg:max-w-md"
        />

        {/* Right Group: Buttons - Only visible on Desktop */}
        <div className="hidden lg:flex lg:items-center lg:gap-2">
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

      {/* Buttons Row - Only visible on Mobile & Tablet */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="self-start sm:self-auto flex items-center gap-2 cursor-pointer"
            >
              <IconLayoutGrid className="h-4 w-4" />
              <span>Columns</span>
              <IconChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
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
          className="w-full sm:w-auto cursor-pointer"
        >
          <IconPlus className="mr-2 h-4 w-4" />
          Add Owner
        </Button>
      </div>
    </div>
  )
}