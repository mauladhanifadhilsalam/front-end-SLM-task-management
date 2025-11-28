import { useState, useEffect, useMemo } from "react";
import { Ticket, TicketGroups, TicketStatus } from "@/types/project-tasks.types";
import { projectTasksService } from "@/services/project-tasks.service";
import { decodeToken } from "@/utils/token.utils";

export const useProjectTasks = (projectId: string | undefined) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTickets = async () => {
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
          const projectInfo = await projectTasksService.getProjectInfo(
            currentProjectId,
            token
          );
          setProjectName(projectInfo.name);
        } catch (err) {
          console.error("Error fetching project info:", err);
        }

        // Fetch tickets
        const allTickets = await projectTasksService.getTickets(token);

        const filtered: Ticket[] = allTickets.filter((t: any): t is Ticket => {
          const ticketProjectId = Number(t.projectId);
          return ticketProjectId === currentProjectId && t.type === "TASK";
        });

        setTickets(filtered);
      } catch (err) {
        console.error("❌ Error fetching:", err);
        setError("Gagal memuat data tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [projectId, token]);

  const groups: TicketGroups = useMemo(() => {
    return {
      TO_DO: tickets.filter((t) => t.status === "TO_DO"),
      IN_PROGRESS: tickets.filter((t) => t.status === "IN_PROGRESS"),
      IN_REVIEW: tickets.filter((t) => t.status === "IN_REVIEW"),
      DONE: tickets.filter((t) => t.status === "DONE"),
      RESOLVED: tickets.filter((t) => t.status === "RESOLVED"),
      CLOSED: tickets.filter((t) => t.status === "CLOSED"),
    };
  }, [tickets]);

  const updateTicketStatus = async (ticketId: number, newStatus: TicketStatus) => {
    if (!token) return;

    // Optimistic update
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );

    try {
      await projectTasksService.updateTicketStatus(ticketId, newStatus, token);
    } catch (err) {
      console.error("Error updating ticket status:", err);
      // Revert on error (optional)
    }
  };

  const findTicket = (id: string): Ticket | undefined => {
    return tickets.find((t) => String(t.id) === String(id));
  };

  return {
    tickets,
    setTickets,
    loading,
    projectName,
    error,
    groups,
    updateTicketStatus,
    findTicket,
    token,
  };
};