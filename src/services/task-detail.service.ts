import axios from "axios";
import { TaskDetail } from "../types/task-detail.types";

const API_BASE_URL = "http://localhost:3000";

export const taskDetailService = {
  async getProjectInfo(projectId: number, token: string) {
    const response = await axios.get(
      `${API_BASE_URL}/projects/${projectId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async getTaskDetail(taskId: number, token: string): Promise<TaskDetail> {
    const response = await axios.get(`${API_BASE_URL}/tickets/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};