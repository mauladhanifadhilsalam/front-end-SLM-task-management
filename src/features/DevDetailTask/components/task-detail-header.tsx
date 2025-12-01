import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { TaskDetail } from "@/types/task-detail.types";
import { getStatusColor } from "@/utils/format.utils";

interface TaskDetailHeaderProps {
  task: TaskDetail;
}

export const TaskDetailHeader = ({ task }: TaskDetailHeaderProps) => {
  return (
    <CardHeader className="p-0 pb-4">
      <div className="flex items-center justify-between">
        {/* Diamond Indicator dan Judul */}
        <div className="flex items-center space-x-3">
          <span
            className={`text-2xl leading-none ${getStatusColor(task.status)}`}
            role="img"
            aria-label="Progress Indicator"
          >
            ◆
          </span>
          <CardTitle className="text-2xl font-bold">{task.title}</CardTitle>
        </div>

        {/* Priority Badge */}
        <Badge
          variant={
            task.priority === "CRITICAL" || task.priority === "HIGH"
              ? "destructive"
              : "outline"
          }
          className={`px-3 py-1 rounded-full ${
            task.priority === "CRITICAL"
              ? "bg-red-900/50 text-red-300 border-red-800"
              : ""
          }`}
        >
          {task.priority}
        </Badge>
      </div>
    </CardHeader>
  );
};