"use client"

import * as React from "react"
import { IconSearch, IconColumns3, IconPlus } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ProjectRoleTableColumns } from "../hooks/use-admin-project-roles"

type Props = {
  query: string
  onQueryChange: (value: string) => void
  cols: ProjectRoleTableColumns
  onToggleColumn: (
    key: keyof ProjectRoleTableColumns,
    value: boolean | "indeterminate",
  ) => void
  onCreateClick?: () => void
}

export const AdminProjectRoleToolbar: React.FC<Props> = ({
  query,
  onQueryChange,
  cols,
  onToggleColumn,
  onCreateClick,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search project roles..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <IconColumns3 className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={cols.id}
              onCheckedChange={(checked) => onToggleColumn("id", checked)}
            >
              ID
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={cols.code}
              onCheckedChange={(checked) => onToggleColumn("code", checked)}
            >
              Code
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={cols.name}
              onCheckedChange={(checked) => onToggleColumn("name", checked)}
            >
              Name
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={cols.actions}
              onCheckedChange={(checked) => onToggleColumn("actions", checked)}
            >
              Actions
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {onCreateClick && (
          <Button size="sm" onClick={onCreateClick}>
            <IconPlus className="mr-2 h-4 w-4" />
            Create Project Role
          </Button>
        )}
      </div>
    </div>
  )
}
