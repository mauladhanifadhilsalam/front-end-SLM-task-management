"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  IconPlus,
  IconLayoutGrid,
  IconChevronDown,
} from "@tabler/icons-react"
import { UserTableColumns, type RoleFilter } from "../hooks/use-admin-user"

type Props = {
  search: string
  onSearchChange: (value: string) => void
  roleFilter: RoleFilter
  onRoleFilterChange: (value: RoleFilter) => void
  columns: UserTableColumns
  onToggleColumn: (
    key: keyof UserTableColumns,
    value: boolean | "indeterminate"
  ) => void
  onAddUser: () => void
}

const role = localStorage.getItem("role")

const roleLabel = function () {
  if (role === "project_manager") {
    return "Developer"
  } else {
    return "User"
  }
}

export const UsersToolbar: React.FC<Props> = ({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  columns,
  onToggleColumn,
  onAddUser,
}) => {
  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Mobile & Tablet: Stack vertically, Desktop: Single row with space-between */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        {/* Left Group: Search & Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 lg:flex-1">
          {/* Search Input */}
          <Input
            placeholder="Filter by name or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full lg:flex-1 lg:max-w-md"
          />
          
          {/* Role Filter */}
          <Select
            value={roleFilter}
            onValueChange={(value) => onRoleFilterChange(value as RoleFilter)}
          >
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
              <SelectItem value="DEVELOPER">Developer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right Group: Buttons - Only visible on Desktop */}
        <div className="hidden lg:flex lg:items-center lg:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="flex items-center gap-2 cursor-pointer">
                <IconLayoutGrid className="h-4 w-4" />
                <span>Columns</span>
                <IconChevronDown className="ml-1 h-4 w-4" />
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
                checked={columns.fullName}
                onCheckedChange={(v) => onToggleColumn("fullName", v)}
              >
                Full name
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columns.email}
                onCheckedChange={(v) => onToggleColumn("email", v)}
              >
                Email
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columns.passwordHash}
                onCheckedChange={(v) => onToggleColumn("passwordHash", v)}
              >
                Password
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columns.role}
                onCheckedChange={(v) => onToggleColumn("role", v)}
              >
                Role
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
            className="cursor-pointer"
            onClick={onAddUser}
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Add {roleLabel()}
          </Button>
        </div>
      </div>

      {/* Buttons Row - Only visible on Mobile & Tablet */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="self-start sm:self-auto flex items-center gap-2 cursor-pointer">
              <IconLayoutGrid className="h-4 w-4" />
              <span>Columns</span>
              <IconChevronDown className="ml-1 h-4 w-4" />
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
              checked={columns.fullName}
              onCheckedChange={(v) => onToggleColumn("fullName", v)}
            >
              Full name
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columns.email}
              onCheckedChange={(v) => onToggleColumn("email", v)}
            >
              Email
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columns.passwordHash}
              onCheckedChange={(v) => onToggleColumn("passwordHash", v)}
            >
              Password
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columns.role}
              onCheckedChange={(v) => onToggleColumn("role", v)}
            >
              Role
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
          className="w-full sm:w-auto cursor-pointer"
          onClick={onAddUser}
        >
          <IconPlus className="mr-2 h-4 w-4" />
          Add {roleLabel()}
        </Button>
      </div>
    </div>
  )
}