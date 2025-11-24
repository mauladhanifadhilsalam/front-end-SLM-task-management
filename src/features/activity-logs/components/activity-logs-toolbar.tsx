import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  IconLayoutGrid,
  IconChevronDown,
  IconReload,
} from "@tabler/icons-react"
import type { ActivityLogColumns } from "@/types/activity-log.type"

type Props = {
  search: string
  cols: ActivityLogColumns
  onSearchChange: (value: string) => void
  onToggleColumn: (key: keyof ActivityLogColumns) => void
  onRefresh: () => void
}

export const ActivityLogsToolbar: React.FC<Props> = ({
  search,
  cols,
  onSearchChange,
  onToggleColumn,
  onRefresh,
}) => {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          placeholder="Cari action, user, email, role, atau target..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full md:w-[28rem]"
        />
        <div className="flex items-center gap-2 md:ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="cursor-pointer"
            title="Refresh"
          >
            <IconReload className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="flex items-center gap-2"
              >
                <IconLayoutGrid className="h-4 w-4" />
                <span>Columns</span>
                <IconChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={cols.id}
                onCheckedChange={() => onToggleColumn("id")}
              >
                NO
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.action}
                onCheckedChange={() => onToggleColumn("action")}
              >
                Action
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.user}
                onCheckedChange={() => onToggleColumn("user")}
              >
                User
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.role}
                onCheckedChange={() => onToggleColumn("role")}
              >
                Role
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.targetType}
                onCheckedChange={() =>
                  onToggleColumn("targetType")
                }
              >
                Target Type
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.targetId}
                onCheckedChange={() =>
                  onToggleColumn("targetId")
                }
              >
                Target ID
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.details}
                onCheckedChange={() =>
                  onToggleColumn("details")
                }
              >
                Details
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.occurredAt}
                onCheckedChange={() =>
                  onToggleColumn("occurredAt")
                }
              >
                Occurred At
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.actions}
                onCheckedChange={() =>
                  onToggleColumn("actions")
                }
              >
                Actions
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
