export interface TaskDetail {
  id: number;
  title: string;
  description: string;
  status: "TO_DO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "RESOLVED" | "CLOSED";
  priority: string;
  dueDate: string | null;
  projectId: number;
  type: "TASK" | "BUG" | "FEATURE" | "ISSUE";
  assignees: TaskAssignee[];
}

export interface TaskAssignee {
  id: number;
  assignedAt: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
}

export type TaskStatus = TaskDetail["status"];
export type TaskType = TaskDetail["type"];