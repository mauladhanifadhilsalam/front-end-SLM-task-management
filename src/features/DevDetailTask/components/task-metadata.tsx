import { Badge } from "@/components/ui/badge";
import { TaskDetail } from "@/types/task-detail.types";
import { formatDate, formatStatus } from "@/utils/format.utils";

interface TaskMetadataProps {
  task: TaskDetail;
}

export const TaskMetadata = ({ task }: TaskMetadataProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
        <Badge variant="outline" className="mt-1">
          {formatStatus(task.status)}
        </Badge>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground">Tipe</h4>
        <Badge variant="secondary" className="mt-1">
          {task.type}
        </Badge>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground">Due Date</h4>
        <p className="mt-1">{formatDate(task.dueDate)}</p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground">
          Project ID
        </h4>
        <p className="mt-1">{task.projectId}</p>
      </div>
    </div>
  );
};