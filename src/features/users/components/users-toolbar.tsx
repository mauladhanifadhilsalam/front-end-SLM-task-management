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
import { Role } from "@/types/user.types"
import { UserTableColumns } from "../hooks/use-admin-user"

type Props = {
  search: string
  onSearchChange: (value: string) => void
  roleFilter: Role | "all"
  onRoleFilterChange: (value: Role | "all") => void
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
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Input
          placeholder="Filter by name or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:max-w-xs md:w-80"
        />
        <Select
          value={roleFilter}
          onValueChange={(value) => onRoleFilterChange(value as Role | "all")}
        >
          <SelectTrigger className="w-full sm:w-56 md:w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
            <SelectItem value="DEVELOPER">Developer</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 sm:justify-end md:ml-auto md:w-auto">
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
          className="w-full cursor-pointer sm:w-auto"
          onClick={onAddUser}
        >
          <IconPlus className="mr-2 h-4 w-4" />
          Add {roleLabel()}
        </Button>
      </div>
    </div>
  )
}
