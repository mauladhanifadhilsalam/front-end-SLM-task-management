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
    onToggleColumn: (key: keyof UserTableColumns, value: boolean | "indeterminate") => void
    onAddUser: () => void
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
        <div className="flex gap-3 items-center mb-4">
        <Input
            placeholder="Filter by name or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-80"
        />
        <Select
            value={roleFilter}
            onValueChange={(value) => onRoleFilterChange(value as Role | "all")}
        >
            <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
            <SelectItem value="DEVELOPER">Developer</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="sm" className="flex items-center gap-2 cursor-pointer">
                <IconLayoutGrid className="h-4 w-4" />
                <span>Columns</span>
                <IconChevronDown className="h-4 w-4 ml-1" />
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
            Add User
            </Button>
        </div>
        </div>
    )
}
