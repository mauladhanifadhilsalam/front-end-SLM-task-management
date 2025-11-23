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
  selectedCount: number
  onClearSelection: () => void
}

export const AdminCommentToolbar: React.FC<Props> = ({
  query,
  onQueryChange,
  cols,
  onToggleColumn,
  onRefresh,
  onCreate,
  selectedCount,
  onClearSelection,
}) => {
  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Filter by message, user, email, role, ticket title/project…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-[28rem]"
          />
        </div>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              title="Clear selection"
            >
              Clear selection
            </Button>
          )}
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
              <Button size="sm" className="flex items-center gap-2">
                <IconLayoutGrid className="h-4 w-4" />
                <span>Columns</span>
                <IconChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={cols.sel}
                onCheckedChange={(v) => onToggleColumn("sel", !!v)}
              >
                Selection
              </DropdownMenuCheckboxItem>
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
          <Button
            size="sm"
            onClick={onCreate}
            className="cursor-pointer"
            title="Create a new comment"
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Add Comment
          </Button>
        </div>
      </div>
    </div>
  )
}
