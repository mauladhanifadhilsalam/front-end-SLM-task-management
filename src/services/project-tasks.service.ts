import axios from "axios";
import { Ticket, ProjectInfo } from "../types/project-tasks.types";
import {
  extractArrayFromApi,
  unwrapApiData,
} from "@/utils/api-response.util";

const API_BASE_URL = import.meta.env.VITE_API_BASE;

export type TicketQueryParams = Partial<{
  projectId: number;
  requesterId: number;
  status: string;
  priority: string;
  type: string;
  assigneeId: number;
  search: string;
  page: number;
  pageSize: number;
  sortOrder: "asc" | "desc";
  sortBy: string;
  dueFrom: string;
  dueTo: string;
  updatedSince: string;
}>;

export const projectTasksService = {
  async getProjectInfo(projectId: number, token: string): Promise<ProjectInfo> {
    const response = await axios.get(
      `${API_BASE_URL}/projects/${projectId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return unwrapApiData<ProjectInfo>(response.data);
  },

  async getTickets(token: string, params: TicketQueryParams = {}): Promise<Ticket[]> {
    const response = await axios.get(`${API_BASE_URL}/tickets`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return extractArrayFromApi<Ticket>(response.data, ["tickets"]);
  },

  async updateTicketStatus(
    ticketId: number,
    status: string,
    token: string
  ): Promise<void> {
    await axios.patch(
      `${API_BASE_URL}/tickets/${ticketId}`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },
};
