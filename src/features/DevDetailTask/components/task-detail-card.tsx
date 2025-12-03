import { Card, CardContent } from "@/components/ui/card";
import { TaskDetail } from "@/types/task-detail.types";
import { TaskDetailHeader } from "./task-detail-header";
import { TaskDescription } from "./task-description";
import { TaskMetadata } from "./task-metadata";
import { TaskAssignees } from "./task-assignees";
import TaskComments from "./TaskComments";

interface TaskDetailCardProps {
  task: TaskDetail;
}

export const TaskDetailCard = ({ task }: TaskDetailCardProps) => {
  return (
    <Card className="p-6">
      <TaskDetailHeader task={task} />

      <CardContent className="p-0 space-y-4">
        <TaskDescription description={task.description} />
        <TaskMetadata task={task} />
        <TaskAssignees assignees={task.assignees} />
        <TaskComments taskId={task.id} />
      </CardContent>
    </Card>
  );
};