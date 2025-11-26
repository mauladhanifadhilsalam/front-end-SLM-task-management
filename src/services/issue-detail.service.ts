import axios from "axios";
import { IssueDetail } from "../types/issue-detail.types";

const API_BASE_URL = "http://localhost:3000";

export const issueDetailService = {
  async getProjectInfo(projectId: number, token: string) {
    const response = await axios.get(
      `${API_BASE_URL}/projects/${projectId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async getIssueDetail(issueId: number, token: string): Promise<IssueDetail> {
    const response = await axios.get(`${API_BASE_URL}/tickets/${issueId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};