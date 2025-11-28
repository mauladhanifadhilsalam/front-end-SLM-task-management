import { useState, useEffect } from "react";
import { IssueDetail } from "@/types/issue-detail.types";
import { issueDetailService } from "@/services/issue-detail.service";
import { decodeToken } from "@/utils/token.utils";
import axios from "axios";

export const useIssueDetail = (
  projectId: string | undefined,
  issueId: string | undefined
) => {
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchIssueDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!token || !projectId || !issueId) {
          throw new Error("Token, Project ID, atau Issue ID tidak ditemukan.");
        }

        const currentProjectId = Number(projectId);
        const currentIssueId = Number(issueId);

        if (isNaN(currentProjectId) || isNaN(currentIssueId)) {
          throw new Error("Project ID atau Issue ID tidak valid.");
        }

        const decoded = decodeToken(token);
        if (!decoded) {
          throw new Error("Token tidak valid atau gagal di-decode.");
        }

        // Fetch project detail untuk nama project
        try {
          const projectInfo = await issueDetailService.getProjectInfo(
            currentProjectId,
            token
          );
          setProjectName(projectInfo.name);
        } catch (projectErr) {
          console.warn(
            "⚠️ Gagal fetch project detail, melanjutkan tanpa nama project."
          );
        }

        // Fetch issue detail
        const issueData = await issueDetailService.getIssueDetail(
          currentIssueId,
          token
        );

        // Validasi: pastikan data adalah ISSUE
        if (issueData.type !== "ISSUE") {
          throw new Error("Data ini bukan ISSUE.");
        }

        // Pastikan issue milik project yang benar
        if (Number(issueData.projectId) !== currentProjectId) {
          throw new Error("Issue tidak milik project ini.");
        }

        setIssue(issueData);
      } catch (err) {
        console.error("❌ Error fetching issue detail:", err);
        const errorMessage = axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : err instanceof Error
          ? err.message
          : "Terjadi kesalahan tidak diketahui.";
        setError(errorMessage);
        setIssue(null);
      } finally {
        setLoading(false);
      }
    };

    fetchIssueDetail();
  }, [projectId, issueId, token]);

  return {
    issue,
    loading,
    error,
    projectName,
  };
};