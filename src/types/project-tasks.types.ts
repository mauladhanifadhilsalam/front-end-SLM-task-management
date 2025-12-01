export interface Ticket {
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

export type TicketStatus = Ticket["status"];

export interface TicketGroups {
  TO_DO: Ticket[];
  IN_PROGRESS: Ticket[];
  IN_REVIEW: Ticket[];
  DONE: Ticket[];
  RESOLVED: Ticket[];
  CLOSED: Ticket[];
}

export interface ProjectInfo {
  id: number;
  name: string;
}