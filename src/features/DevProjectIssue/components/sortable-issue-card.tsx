import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Issue } from "@/types/project-issues.types";
import {
  formatStatus,
  formatDate,
  getStatusColor,
  getPriorityVariant,
  getPriorityClassName,
} from "@/utils/format.utils";

interface SortableIssueCardProps {
  issue: Issue;
}

export const SortableIssueCard = ({ issue }: SortableIssueCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: String(issue.id),
      data: { type: "issue", issue },
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="
        bg-card border border-border rounded-xl p-3 space-y-3 
        shadow-md hover:shadow-lg transition 
        duration-150 hover:-translate-y-0.5 select-none
      "
    >
      <CardHeader className="p-0 border-b border-border/50 pb-2 flex flex-col items-start space-y-1">
        <div className="flex items-center justify-between w-full">
          <span className={`text-lg leading-none ${getStatusColor(issue.status)}`}>
            ◆
          </span>

          <Badge
            variant={getPriorityVariant(issue.priority)}
            className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap opacity-80 ${getPriorityClassName(
              issue.priority
            )}`}
          >
            {issue.priority}
          </Badge>
        </div>

        <CardTitle className="text-base font-bold leading-snug w-full">
          {issue.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 space-y-2">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {issue.description || "No description provided."}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="text-xs px-2 py-0.5 rounded-full font-medium"
          >
            {formatStatus(issue.status)}
          </Badge>
        </div>

        <div className="pt-2 border-t border-border/50 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center space-x-1">
              <span>📅</span>
              <span>Due:</span>
            </div>
            <span className="font-medium text-foreground">
              {formatDate(issue.dueDate)}
            </span>
          </div>

          <Link
            to={`/developer-dashboard/projects/${issue.projectId}/issues/${issue.id}`}
          >
            <Button size="sm" className="w-full text-xs">
              Lihat Detail Issue
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};