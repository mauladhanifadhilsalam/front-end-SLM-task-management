import axios from "axios";
import type { ProjectInfo } from "@/types/project-tasks.types";
import { TaskDetail } from "../types/task-detail.types";
import { unwrapApiData } from "@/utils/api-response.util";

const API_BASE_URL = "http://localhost:3000";

export const taskDetailService = {
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

  async getTaskDetail(taskId: number, token: string): Promise<TaskDetail> {
    const response = await axios.get(`${API_BASE_URL}/tickets/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrapApiData<TaskDetail>(response.data);
  },
};
