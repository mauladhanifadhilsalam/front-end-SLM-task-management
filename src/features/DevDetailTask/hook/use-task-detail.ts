import { useState, useEffect } from "react";
import { TaskDetail } from "@/types/task-detail.types";
import { taskDetailService } from "@/services/task-detail.service";
import { decodeToken } from "@/utils/token.utils";
import axios from "axios";

export const useTaskDetail = (
  projectId: string | undefined,
  taskId: string | undefined
) => {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTaskDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!token || !projectId || !taskId) {
          throw new Error("Token, Project ID, atau Task ID tidak ditemukan.");
        }

        const currentProjectId = Number(projectId);
        const currentTaskId = Number(taskId);

        if (isNaN(currentProjectId) || isNaN(currentTaskId)) {
          throw new Error("Project ID atau Task ID tidak valid.");
        }

        const decoded = decodeToken(token);
        if (!decoded) {
          throw new Error("Token tidak valid atau gagal di-decode.");
        }

        // Fetch project detail untuk nama project
        try {
          const projectInfo = await taskDetailService.getProjectInfo(
            currentProjectId,
            token
          );
          setProjectName(projectInfo.name);
        } catch (projectErr) {
          console.warn(
            "⚠️ Gagal fetch project detail, melanjutkan tanpa nama project."
          );
        }

        // Fetch task detail
        const taskData = await taskDetailService.getTaskDetail(
          currentTaskId,
          token
        );

        // Pastikan task milik project yang benar
        if (Number(taskData.projectId) !== currentProjectId) {
          throw new Error("Task tidak milik project ini.");
        }

        setTask(taskData);
      } catch (err) {
        console.error("❌ Error fetching task detail:", err);
        const errorMessage = axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : err instanceof Error
          ? err.message
          : "Terjadi kesalahan tidak diketahui.";
        setError(errorMessage);
        setTask(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetail();
  }, [projectId, taskId, token]);

  return {
    task,
    loading,
    error,
    projectName,
  };
};