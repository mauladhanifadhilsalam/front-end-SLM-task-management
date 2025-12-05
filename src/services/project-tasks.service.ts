import axios from "axios";
import { Ticket, ProjectInfo } from "../types/project-tasks.types";
import {
  extractArrayFromApi,
  unwrapApiData,
} from "@/utils/api-response.util";

const API_BASE_URL = import.meta.env.VITE_API_BASE;

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

  async getTickets(token: string): Promise<Ticket[]> {
    const response = await axios.get(`${API_BASE_URL}/tickets`, {
      headers: { Authorization: `Bearer ${token}` },
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
