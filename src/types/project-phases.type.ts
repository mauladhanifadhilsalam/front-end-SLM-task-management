import type { Project } from "./project.type";

export interface Phase {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  projectId: number;
  createdAt: string;
  updatedAt: string;
  project?: Project;
}

export interface CreateProjectPhasePayload {
  name: string;
  startDate: string;
  endDate: string;
  projectId: number;
}

export interface EditProjectPhasePayload {
  name: string;
  startDate: string;
  endDate: string;
  projectId: number;
}