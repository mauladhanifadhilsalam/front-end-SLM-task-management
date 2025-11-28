export interface Issue {
  id: number;
  title: string;
  description: string;
  status: "TO_DO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "RESOLVED" | "CLOSED";
  priority: string;
  dueDate: string | null;
  projectId: number;
  type: "TASK" | "BUG" | "FEATURE" | "ISSUE";
  assignees: Array<{
    id: number;
    assignedAt: string;
    user: {
      id: number;
      fullName: string;
      email: string;
      role: string;
    };
  }>;
}

export type IssueStatus = Issue["status"];

export interface IssueGroups {
  TO_DO: Issue[];
  IN_PROGRESS: Issue[];
  IN_REVIEW: Issue[];
  DONE: Issue[];
  RESOLVED: Issue[];
  CLOSED: Issue[];
}