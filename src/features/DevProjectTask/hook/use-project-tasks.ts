import { useState, useEffect, useMemo, useCallback } from "react";
import { Ticket, TicketGroups, TicketStatus } from "@/types/project-tasks.types";
import type { Phase } from "@/types/project-phases.type";
import { projectTasksService } from "@/services/project-tasks.service";
import { decodeToken } from "@/utils/token.utils";
import { createTicketRealtimeConnection } from "@/lib/realtime/ticket-socket";

export type RealtimeStatus = "idle" | "connecting" | "connected" | "polling" | "error";

export const useProjectTasks = (projectId: string | undefined) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState<string>("");
  const [phases, setPhases] = useState<Phase[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const token = localStorage.getItem("token");

  const refreshTickets = useCallback(async () => {
    if (!token || !projectId) return;

    try {
      const currentProjectId = Number(projectId);
      const remoteTickets = await projectTasksService.getTickets(token, {
        projectId: currentProjectId,
        type: "TASK",
        sortOrder: "asc",
      });

      setTickets(remoteTickets);
      setLastSyncedAt(new Date());
    } catch (err) {
      console.error("Error refreshing tickets:", err);
    }
  }, [projectId, token]);

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
          if (Array.isArray(projectInfo.phases)) {
            setPhases(
              projectInfo.phases.map((p) => ({
                id: p.id,
                name: p.name,
                startDate: String((p as any).startDate ?? (p as any).start_date ?? ""),
                endDate: String((p as any).endDate ?? (p as any).end_date ?? ""),
                projectId: currentProjectId,
                createdAt: "",
                updatedAt: "",
              }))
            );
          }
        } catch (err) {
          console.error("Error fetching project info:", err);
        }

        await refreshTickets();
      } catch (err) {
        console.error("❌ Error fetching:", err);
        setError("Gagal memuat data tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [projectId, refreshTickets, token]);

  useEffect(() => {
    if (!token || !projectId) {
      setRealtimeStatus("idle");
      return;
    }

    const numericProjectId = Number(projectId);
    if (!Number.isFinite(numericProjectId)) {
      return;
    }

    setRealtimeStatus("connecting");

    const connection = createTicketRealtimeConnection({
      token,
      projectId: numericProjectId,
      handlers: {
        onConnected: () => setRealtimeStatus("connected"),
        onDisconnected: () => setRealtimeStatus("polling"),
        onError: () => setRealtimeStatus("error"),
        onTicketCreated: (ticket) => {
          setTickets((prev) => {
            const exists = prev.some((item) => item.id === ticket.id);
            if (exists) {
              return prev.map((item) => (item.id === ticket.id ? ticket : item));
            }
            return [...prev, ticket];
          });
          setLastSyncedAt(new Date());
        },
        onTicketUpdated: (ticket) => {
          setTickets((prev) =>
            prev.map((item) => (item.id === ticket.id ? ticket : item)),
          );
          setLastSyncedAt(new Date());
        },
        onTicketDeleted: (ticketId) => {
          setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId));
          setLastSyncedAt(new Date());
        },
      },
    });

    return () => {
      connection.disconnect();
    };
  }, [projectId, token]);

  const groups: TicketGroups = useMemo(() => {
    return {
      NEW: tickets.filter((t) => t.status === "NEW"),
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
    phases,
    refreshTickets,
    realtimeStatus,
    lastSyncedAt,
  };
};
