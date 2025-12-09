import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"

interface TaskColumnProps {
  status: string
  children: React.ReactNode
  className?: string
  bodyClassName?: string
  maxHeight?: string
}

export const TaskColumn = ({ status, children, className, bodyClassName, maxHeight }: TaskColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: "column", status },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[200px] rounded-xl border transition duration-150 overflow-y-auto scrollbar-hide p-3",
        isOver ? "border-primary bg-accent/30" : "border-border bg-card",
        className,
      )}
      style={{
        maxHeight: maxHeight ?? "calc(100vh - 280px)",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <div className={cn("space-y-3", bodyClassName)}>{children}</div>
    </div>
  )
}
