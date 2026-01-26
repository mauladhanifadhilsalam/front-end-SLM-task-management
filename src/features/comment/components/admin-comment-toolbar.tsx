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
  IconReload,
} from "@tabler/icons-react"
import type { AdminCommentColumnState } from "../hooks/use-admin-comment-list"

type Props = {
  query: string
  onQueryChange: (value: string) => void
  cols: AdminCommentColumnState
  onToggleColumn: (key: keyof AdminCommentColumnState, value: boolean) => void
  onRefresh: () => void
  onCreate: () => void
}

export const AdminCommentToolbar: React.FC<Props> = ({
  query,
  onQueryChange,
  cols,
  onToggleColumn,
  onRefresh,
  onCreate,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: Search + Refresh + Columns */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 lg:justify-between">
        {/* Left Group: Search */}
        <Input
          placeholder="Filter by message, user, email, role, ticket title/project…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full sm:flex-1 lg:max-w-md"
        />

        {/* Right Group: Refresh + Columns (+ Add Comment on Desktop) */}
        <div className="flex items-center gap-2">
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
              <Button size="sm" className="flex items-center gap-2 cursor-pointer">
                <IconLayoutGrid className="h-4 w-4" />
                <span>Columns</span>
                <IconChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={cols.id}
                onCheckedChange={(v) => onToggleColumn("id", !!v)}
              >
                ID
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.ticket}
                onCheckedChange={(v) => onToggleColumn("ticket", !!v)}
              >
                Ticket
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.user}
                onCheckedChange={(v) => onToggleColumn("user", !!v)}
              >
                User
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.message}
                onCheckedChange={(v) => onToggleColumn("message", !!v)}
              >
                Message
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.created}
                onCheckedChange={(v) => onToggleColumn("created", !!v)}
              >
                Created
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.actions}
                onCheckedChange={(v) => onToggleColumn("actions", !!v)}
              >
                Actions
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Add Comment - Only visible on Desktop */}
          <Button
            size="sm"
            onClick={onCreate}
            className="hidden lg:flex cursor-pointer"
            title="Create a new comment"
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Add Comment
          </Button>
        </div>
      </div>

      {/* Row 2: Add Comment Button - Mobile: full width, Tablet: auto width, Desktop: hidden */}
      <Button
        size="sm"
        onClick={onCreate}
        className="w-full sm:w-auto lg:hidden cursor-pointer self-start"
        title="Create a new comment"
      >
        <IconPlus className="mr-2 h-4 w-4" />
        Add Comment
      </Button>
    </div>
  )
}