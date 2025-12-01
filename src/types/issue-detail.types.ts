export interface IssueDetail {
  id: number;
  title: string;
  description: string;
  status: "TO_DO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "RESOLVED" | "CLOSED";
  priority: string;
  dueDate: string | null;
  projectId: number;
  type: "ISSUE";
  assignees: IssueAssignee[];
}

export interface IssueAssignee {
  id: number;
  assignedAt: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
}

export type IssueStatus = IssueDetail["status"];