import axios from "axios";
import { Issue } from "../types/project-issues.types";
import type { ProjectInfo } from "@/types/project-tasks.types";
import {
  extractArrayFromApi,
  unwrapApiData,
} from "@/utils/api-response.util";

const API_BASE_URL = "http://localhost:3000";

export const projectIssuesService = {
  async getProjectInfo(
    projectId: number,
    token: string,
  ): Promise<ProjectInfo> {
    const response = await axios.get(
      `${API_BASE_URL}/projects/${projectId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return unwrapApiData<ProjectInfo>(response.data);
  },

  async getTickets(token: string): Promise<Issue[]> {
    const response = await axios.get(`${API_BASE_URL}/tickets`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return extractArrayFromApi<Issue>(response.data, ["tickets"]);
  },

  async updateIssueStatus(
    issueId: number,
    status: string,
    token: string
  ): Promise<void> {
    await axios.patch(
      `${API_BASE_URL}/tickets/${issueId}`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },
};
