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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  IconLayoutGrid,
  IconChevronDown,
  IconPlus,
} from "@tabler/icons-react"
import type { TicketAssigneeColumns } from "@/types/ticket-assignee.type"

type Props = {
  search: string
  statusFilter: string
  cols: TicketAssigneeColumns
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onToggleColumn: (key: keyof TicketAssigneeColumns) => void
  onAssignTicket?: () => void
}

const COLUMN_LABELS: Record<keyof TicketAssigneeColumns, string> = {
  id: "ID",
  ticket: "Ticket",
  assignee: "Assignee",
  type: "Type",
  priority: "Priority",
  status: "Status",
  createdAt: "Assigned At",
  actions: "Aksi",
}

export const TicketAssigneesToolbar: React.FC<Props> = ({
  search,
  statusFilter,
  cols,
  onSearchChange,
  onStatusChange,
  onToggleColumn,
  onAssignTicket,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Mobile & Tablet: Stack vertically */}
      {/* Desktop (lg+): Single row horizontal layout */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
        {/* Search Input */}
        <Input
          placeholder="Cari ticket atau assignee..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full lg:flex-1 lg:max-w-md"
        />
        
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ALL</SelectItem>
            <SelectItem value="NEW">NEW</SelectItem>
            <SelectItem value="TO_DO">TO_DO</SelectItem>
            <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
            <SelectItem value="RESOLVED">RESOLVED</SelectItem>
            <SelectItem value="CLOSED">CLOSED</SelectItem>
          </SelectContent>
        </Select>

        {/* Action Buttons Group */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 lg:flex-nowrap">
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
              {(Object.keys(cols) as (keyof TicketAssigneeColumns)[]).map((key) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={cols[key]}
                  onCheckedChange={() => onToggleColumn(key)}
                >
                  {COLUMN_LABELS[key]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {onAssignTicket && (
            <Button
              size="sm"
              onClick={onAssignTicket}
              className="w-full sm:w-auto cursor-pointer"
            >
              <IconPlus className="mr-2 h-4 w-4" />
              Add Ticket Assignment
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}