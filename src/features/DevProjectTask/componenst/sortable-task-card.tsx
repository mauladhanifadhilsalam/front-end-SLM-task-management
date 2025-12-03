import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "react-router-dom"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { MoreHorizontal } from "lucide-react"
import { Ticket } from "@/types/project-tasks.types"
import { formatDate, getStatusColor, getPriorityVariant, getPriorityClassName } from "@/utils/format.utils"

interface SortableTaskCardProps {
  ticket: Ticket
  detailHref?: string
  onEdit?: (ticket: Ticket) => void
  onDelete?: (ticket: Ticket) => void
}

export const SortableTaskCard = ({ ticket, onEdit, onDelete }: SortableTaskCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: String(ticket.id),
    data: { type: "ticket", ticket },
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  }

  const role = localStorage.getItem("role")
  const basePath = role === "project_manager" ? "/project-manager/dashboard" : "/developer-dashboard"
  const href = `${basePath}/projects/${ticket.projectId}/tasks/${ticket.id}`
  const assigneeCount = ticket.assignees?.length ?? 0

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a,button")) return
        onEdit?.(ticket)
      }}
      className="bg-card border border-border rounded-xl p-3 space-y-3 shadow-md hover:shadow-lg transition duration-150 hover:-translate-y-0.5 select-none"
    >
      <CardHeader className="p-0 flex flex-col items-start space-y-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className={`text-lg leading-none ${getStatusColor(ticket.status)}`}>◆</span>
            <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">#{ticket.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={getPriorityVariant(ticket.priority)}
              className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap opacity-80 ${getPriorityClassName(
                ticket.priority,
              )}`}
            >
              {ticket.priority}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="text-lg leading-none text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
                  aria-label="Menu task"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link to={href}>Buka detail task</Link>
                </DropdownMenuItem>
                {onEdit ? (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.stopPropagation()
                      onEdit(ticket)
                    }}
                  >
                    Edit task
                  </DropdownMenuItem>
                ) : null}
                {onDelete ? (
                  <DropdownMenuItem
                    className="text-destructive"
                    onSelect={(e) => {
                      e.stopPropagation()
                      onDelete(ticket)
                    }}
                  >
                    Hapus task
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardTitle className="text-base font-bold leading-snug w-full">
          <Link to={href} className="underline decoration-muted-foreground hover:decoration-foreground">
            {ticket.title}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5">
            <span className={`inline-block h-2 w-2 rounded-full ${getStatusColor(ticket.status)}`} />
            <span className="font-semibold">{ticket.status}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5">
            <span className="font-semibold text-foreground">{formatDate(ticket.dueDate)}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5">
            <span className="font-semibold text-foreground">{assigneeCount || "No"}</span>
            <span>assignee</span>
          </span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {ticket.description || "No description provided."}
        </p>
      </CardContent>
    </Card>
  )
}
