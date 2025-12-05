import axios from "axios";
import type { ProjectInfo } from "@/types/project-tasks.types";
import { IssueDetail } from "../types/issue-detail.types";
import { unwrapApiData } from "@/utils/api-response.util";

const API_BASE_URL = import.meta.env.VITE_API_BASE;

export const issueDetailService = {
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

  async getIssueDetail(issueId: number, token: string): Promise<IssueDetail> {
    const response = await axios.get(`${API_BASE_URL}/tickets/${issueId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrapApiData<IssueDetail>(response.data);
  },
};
