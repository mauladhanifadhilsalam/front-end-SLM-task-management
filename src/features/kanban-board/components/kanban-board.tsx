import { useMemo, useState } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensors,
  useSensor,
  DragOverlay,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { Ticket, TicketGroups, TicketStatus } from "@/types/project-tasks.types"
import { SortableTaskCard } from "../../DevProjectTask/componenst/sortable-task-card"
import { TaskColumn } from "../../DevProjectTask/componenst/task-column"
import { DragOverlayCard } from "../../DevProjectTask/componenst/drag-overlay-card"
import { formatStatus } from "@/utils/format.utils"

interface KanbanBoardProps {
  tickets: Ticket[]
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>
  groups: TicketGroups
  updateTicketStatus: (ticketId: number, newStatus: TicketStatus) => Promise<void>
  findTicket: (id: string) => Ticket | undefined
  isMobile?: boolean
  onAddTask?: (status: TicketStatus) => void
  onEditTask?: (ticket: Ticket) => void
  onDeleteTask?: (ticket: Ticket) => void
  buildDetailLink?: (ticket: Ticket) => string
}

const STATUSES: TicketStatus[] = ["NEW", "TO_DO", "IN_PROGRESS", "IN_REVIEW", "DONE", "RESOLVED", "CLOSED"]

const STATUS_META: Record<
  TicketStatus,
  { label: string; border: string; badge: string }
> = {
  TO_DO: {
    label: "To Do",
    border: "border-border/70",
    badge: "bg-slate-200 text-slate-900",
  },
  NEW: {
    label: "New",
    border: "border-border/70",
    badge: "bg-slate-200 text-slate-900",
  },
  IN_PROGRESS: {
    label: "In Progress",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-900",
  },
  IN_REVIEW: {
    label: "In Review",
    border: "border-indigo-200",
    badge: "bg-indigo-100 text-indigo-900",
  },
  DONE: {
    label: "Done",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-900",
  },
  RESOLVED: {
    label: "Resolved",
    border: "border-teal-200",
    badge: "bg-teal-100 text-teal-900",
  },
  CLOSED: {
    label: "Closed",
    border: "border-border/70",
    badge: "bg-neutral-200 text-neutral-900",
  },
}

export const KanbanBoard = ({
  tickets,
  setTickets,
  groups,
  updateTicketStatus,
  findTicket,
  isMobile = false,
  onAddTask,
  onEditTask,
  onDeleteTask,
  buildDetailLink,
}: KanbanBoardProps) => {
  const [activeId, setActiveId] = useState<string | null>(null)
  const handleAddTask = onAddTask ?? (() => undefined)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const handleDragStart = (event: any) => {
    setActiveId(String(event.active.id))
  }

  const statusOrder = useMemo(() => STATUSES, [])

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const activeTicket = findTicket(active.id)
    if (!activeTicket) return

    const overData = over.data.current

    if (overData?.type === "column") {
      const newStatus = overData.status as TicketStatus
      if (newStatus === activeTicket.status) return

      await updateTicketStatus(activeTicket.id, newStatus)
      return
    }

    if (overData?.type === "ticket") {
      if (activeTicket.status !== overData.ticket.status) return

      const list = groups[activeTicket.status]
      const oldIndex = list.findIndex((t) => String(t.id) === active.id)
      const newIndex = list.findIndex((t) => String(t.id) === overData.ticket.id)

      if (oldIndex === -1 || newIndex === -1) return

      const reordered = arrayMove(list, oldIndex, newIndex)

      setTickets((prev) => {
        const others = prev.filter((t) => t.status !== activeTicket.status)
        return [...others, ...reordered]
      })
    }
  }

  const activeTicket = activeId ? findTicket(activeId) : null

  if (isMobile) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="-mx-4 overflow-x-auto overflow-y-hidden px-4 pb-4">
          <div className="flex min-w-full snap-x snap-mandatory gap-3">
            {statusOrder.map((status) => {
              const meta = STATUS_META[status]
              const items = groups[status]

              return (
                <div
                  key={status}
                  className="w-[88vw] max-w-[420px] flex-shrink-0 snap-start"
                >
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/70 px-3 py-2 shadow-sm">
                    <div className="space-y-0.5">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{meta.label}</p>
                      <h2 className="text-sm font-semibold text-foreground">{formatStatus(status)}</h2>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm ${meta.badge}`}
                    >
                      {items.length} task
                    </span>
                  </div>

                  <SortableContext items={items.map((t) => String(t.id))} strategy={verticalListSortingStrategy}>
                    <TaskColumn
                      status={status}
                      className={`mt-2 border ${meta.border} bg-card/90 shadow-sm`}
                      bodyClassName="space-y-3"
                      maxHeight="calc(100vh - 260px)"
                    >
                      {items.length > 0 ? (
                        items.map((ticket) => (
                          <SortableTaskCard
                            key={ticket.id}
                            ticket={ticket}
                            detailHref={
                              buildDetailLink
                                ? buildDetailLink(ticket)
                                : `/developer-dashboard/projects/${ticket.projectId}/tasks/${ticket.id}`
                            }
                            onEdit={onEditTask}
                            onDelete={onDeleteTask}
                          />
                        ))
                      ) : (
                        <p className="text-center text-xs text-muted-foreground">Belum ada task</p>
                      )}

                      <button
                        type="button"
                        onClick={() => handleAddTask(status)}
                        className="flex h-11 w-full items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/60 text-sm font-semibold text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
                      >
                        Tambah Task
                      </button>
                    </TaskColumn>
                  </SortableContext>
                </div>
              )
            })}
          </div>
        </div>

        <DragOverlay>{activeTicket && <DragOverlayCard ticket={activeTicket} />}</DragOverlay>
      </DndContext>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="absolute inset-0 overflow-x-auto overflow-y-hidden bg-background px-4 pb-6 pt-4 scrollbar-hide">
        <div className="inline-flex min-w-full gap-5 pr-6 pl-2">
          {statusOrder.map((status) => {
            const meta = STATUS_META[status]
            const items = groups[status]

            return (
              <div
                key={status}
                className="flex w-[320px] flex-shrink-0 flex-col rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 rounded-t-2xl border-b border-border/80 bg-muted/60 px-4 py-3">
                  <div className="space-y-0.5">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{meta.label}</p>
                    <h2 className="text-sm font-semibold text-foreground">{formatStatus(status)}</h2>
                  </div>

                  <span className="inline-flex items-center rounded-full bg-card px-3 py-1 text-[11px] font-semibold shadow-inner">
                    {items.length} task
                  </span>
                </div>

                <SortableContext items={items.map((t) => String(t.id))} strategy={verticalListSortingStrategy}>
                  <TaskColumn status={status}>
                    {items.length > 0 &&
                      items.map((ticket) => (
                        <SortableTaskCard
                          key={ticket.id}
                          ticket={ticket}
                          detailHref={
                            buildDetailLink
                              ? buildDetailLink(ticket)
                              : `/developer-dashboard/projects/${ticket.projectId}/tasks/${ticket.id}`
                          }
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
                        />
                      ))}

                    <div className="px-3 pb-3">
                      <button
                        type="button"
                        onClick={() => handleAddTask(status)}
                        className="flex h-10 w-full items-center justify-center rounded-full border border-dashed border-border/70 bg-muted/50 text-lg font-semibold text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
                      >
                        +
                      </button>
                    </div>
                  </TaskColumn>
                </SortableContext>
              </div>
            )
          })}
        </div>
      </div>

      <DragOverlay>{activeTicket && <DragOverlayCard ticket={activeTicket} />}</DragOverlay>
    </DndContext>
  )
}

