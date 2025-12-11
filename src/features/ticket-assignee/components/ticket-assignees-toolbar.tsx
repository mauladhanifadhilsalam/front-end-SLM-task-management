import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
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
}

export const TicketAssigneesToolbar: React.FC<Props> = ({
  search,
  statusFilter,
  cols,
  onSearchChange,
  onStatusChange,
  onToggleColumn,
}) => {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Input
          placeholder="Cari ticket atau assignee..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:max-w-xs md:w-80"
        />
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-56 md:w-48">
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
      </div>
      <div className="flex">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="flex items-center gap-2 cursor-pointer">
              <IconLayoutGrid className="h-4 w-4" />
              Column
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
                {key.toUpperCase()}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}