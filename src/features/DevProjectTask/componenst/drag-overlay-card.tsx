import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Ticket } from "@/types/project-tasks.types";
import { formatDate } from "@/utils/format.utils";

interface DragOverlayCardProps {
  ticket: Ticket;
}

export const DragOverlayCard = ({ ticket }: DragOverlayCardProps) => {
  return (
    <Card className="border border-border p-3 shadow-xl rounded-lg opacity-90 bg-card w-[280px] md:w-auto">
      <CardHeader className="p-0">
        <CardTitle className="text-base font-semibold">{ticket.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 mt-2 text-sm text-muted-foreground">
        <div>Priority: {ticket.priority}</div>
        <div>Due: {formatDate(ticket.dueDate)}</div>
      </CardContent>
    </Card>
  );
};