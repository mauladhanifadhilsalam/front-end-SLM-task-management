import { useDroppable } from "@dnd-kit/core";

interface TaskColumnProps {
  status: string;
  children: React.ReactNode;
}

export const TaskColumn = ({ status, children }: TaskColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: "column", status },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[200px] rounded-xl p-3 space-y-3 border 
        transition duration-150 
        ${isOver ? "border-primary bg-accent/30" : "border-border bg-card"}
        overflow-y-auto scrollbar-hide
      `}
      style={{
        maxHeight: "calc(100vh - 280px)",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {children}
    </div>
  );
};