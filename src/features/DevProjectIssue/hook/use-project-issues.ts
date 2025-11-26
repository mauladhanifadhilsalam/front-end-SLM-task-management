import { useState, useEffect, useMemo } from "react";
import { Issue, IssueGroups, IssueStatus } from "@/types/project-issues.types";
import { projectIssuesService } from "@/services/project-issues.service";
import { decodeToken } from "@/utils/token.utils";

export const useProjectIssues = (projectId: string | undefined) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        if (!token || !projectId) {
          setError("Token atau Project ID tidak ditemukan");
          return;
        }

        const currentProjectId = Number(projectId);

        const decoded = decodeToken(token);
        if (!decoded) {
          setError("Token tidak valid");
          return;
        }

        // Fetch project info
        try {
          const projectInfo = await projectIssuesService.getProjectInfo(
            currentProjectId,
            token
          );
          setProjectName(projectInfo.name);
        } catch (err) {
          console.error("Error fetching project info:", err);
        }

        // Fetch tickets (filter untuk type ISSUE)
        const allTickets = await projectIssuesService.getTickets(token);

        const filtered: Issue[] = allTickets.filter((t: any): t is Issue => {
          const ticketProjectId = Number(t.projectId);
          return ticketProjectId === currentProjectId && t.type === "ISSUE";
        });

        setIssues(filtered);
      } catch (err) {
        console.error("❌ Error fetching:", err);
        setError("Gagal memuat data issues");
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [projectId, token]);

  const groups: IssueGroups = useMemo(() => {
    return {
      TO_DO: issues.filter((i) => i.status === "TO_DO"),
      IN_PROGRESS: issues.filter((i) => i.status === "IN_PROGRESS"),
      IN_REVIEW: issues.filter((i) => i.status === "IN_REVIEW"),
      DONE: issues.filter((i) => i.status === "DONE"),
      RESOLVED: issues.filter((i) => i.status === "RESOLVED"),
      CLOSED: issues.filter((i) => i.status === "CLOSED"),
    };
  }, [issues]);

  const updateIssueStatus = async (issueId: number, newStatus: IssueStatus) => {
    if (!token) return;

    // Optimistic update
    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i))
    );

    try {
      await projectIssuesService.updateIssueStatus(issueId, newStatus, token);
    } catch (err) {
      console.error("Error updating issue status:", err);
      // Revert on error (optional)
    }
  };

  const findIssue = (id: string): Issue | undefined => {
    return issues.find((i) => String(i.id) === String(id));
  };

  return {
    issues,
    setIssues,
    loading,
    projectName,
    error,
    groups,
    updateIssueStatus,
    findIssue,
    token,
  };
};