export interface AssignmentCard {
  id: number;
  projectId: number;
  name: string;
  roleInProject: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

export interface ProjectAssignment {
  user: {
    id: number;
  };
  roleInProject: string;
}

export interface ProjectResponse {
  id: number;
  name: string;
  status: string;
  startDate?: string;
  endDate?: string;
  assignments: ProjectAssignment[];
}

export interface DecodedToken {
  userId?: number;
  id?: number;
  sub?: number;
  user_id?: number;
  [key: string]: any;
}