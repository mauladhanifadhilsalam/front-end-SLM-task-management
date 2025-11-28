import { TaskAssignee } from "@/types/task-detail.types";

interface TaskAssigneesProps {
  assignees: TaskAssignee[];
}

export const TaskAssignees = ({ assignees }: TaskAssigneesProps) => {
  const totalAssignees = assignees.length;
  const assigneeIcon = totalAssignees > 1 ? "👥" : "👤";

  return (
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-2">
        {assigneeIcon} Assigned to ({totalAssignees})
      </h4>

      {totalAssignees > 0 ? (
        <div className="space-y-1">
          {assignees.map((a) => (
            <div key={a.id} className="flex items-center space-x-2">
              <span className="text-sm">- {a.user.fullName}</span>
              <span className="text-xs text-muted-foreground">
                ({a.user.email})
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">Unassigned</p>
      )}
    </div>
  );
};