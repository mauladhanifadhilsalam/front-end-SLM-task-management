import * as React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react";

/* =========================
   Config
========================= */
const API_BASE = "http://localhost:3000";
const USE_DUMMY = true; // set ke false jika backend sudah siap

/* =========================
   Types
========================= */
type TicketType = "ISSUE" | "TASK" | string;
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;
type TicketStatus =
  | "NEW"
  | "TO_DO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE"
  | "RESOLVED"
  | "CLOSED"
  | string;

type Ticket = {
  id: number;
  projectId: number;
  requesterId: number;
  type: TicketType;
  title: string;
  description?: string | null;
  priority?: TicketPriority | null;
  status: TicketStatus;
  startDate?: string | null;
  dueDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  projectName?: string;
  requesterName?: string;
};

const fmt = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "-" : d.toLocaleString("id-ID");
};

const statusVariant = (s?: TicketStatus) => {
  switch (s) {
    case "NEW":
    case "TO_DO":
      return "secondary";
    case "IN_PROGRESS":
      return "default";
    case "IN_REVIEW":
      return "outline";
    case "DONE":
    case "RESOLVED":
    case "CLOSED":
      return "default"; 
    default:
      return "secondary";
  }
};

const priorityVariant = (p?: TicketPriority | null) => {
  switch (p) {
    case "LOW":
      return "outline";
    case "MEDIUM":
      return "secondary";
    case "HIGH":
      return "default";
    case "CRITICAL":
      return "destructive";
    default:
      return "secondary";
  }
};

export default function ViewTickets() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = React.useState<Ticket | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchTicket = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_DUMMY) {
        const dummy: Ticket[] = [
          {
            id: 1,
            projectId: 10,
            requesterId: 5,
            type: "ISSUE",
            title: "Fix login redirect issue",
            description: "User redirected incorrectly after login.",
            priority: "HIGH",
            status: "IN_PROGRESS",
            projectName: "SLM Task Management",
            requesterName: "Lulu Lucu",
            startDate: "2025-10-28T10:00:00Z",
            dueDate: "2025-11-05T17:00:00Z",
            createdAt: "2025-10-28T10:00:00Z",
            updatedAt: "2025-10-30T08:12:00Z",
          },
          {
            id: 2,
            projectId: 11,
            requesterId: 7,
            type: "TASK",
            title: "Add Ticket Assignee Filter",
            description: "Filter tickets by assigned user.",
            priority: "MEDIUM",
            status: "TO_DO",
            projectName: "Desaku Platform",
            requesterName: "Ghifari",
            startDate: "2025-10-30T09:00:00Z",
            dueDate: "2025-11-10T18:00:00Z",
            createdAt: "2025-10-30T09:00:00Z",
            updatedAt: "2025-10-30T09:00:00Z",
          },
          {
            id: 3,
            projectId: 12,
            requesterId: 4,
            type: "TASK",
            title: "Refactor ProjectPhase component",
            description: "Clean up table and state management.",
            priority: "LOW",
            status: "DONE",
            projectName: "SALAM Enterprise Revamp",
            requesterName: "Maula",
            startDate: "2025-10-20T09:00:00Z",
            dueDate: "2025-10-25T18:00:00Z",
            createdAt: "2025-10-20T09:00:00Z",
            updatedAt: "2025-10-25T18:10:00Z",
          },
        ];
        const found = dummy.find((t) => String(t.id) === String(id));
        if (!found) throw new Error("Ticket tidak ditemukan (dummy).");
        await new Promise((r) => setTimeout(r, 500)); 
        setTicket(found);
      } else {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/tickets/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const t = res.data?.data ?? res.data;

        const normalized: Ticket = {
          id: Number(t.id),
          projectId: Number(t.projectId ?? t.project_id ?? t.project?.id ?? 0),
          requesterId: Number(t.requesterId ?? t.requester_id ?? t.requester?.id ?? 0),
          type: String(t.type ?? ""),
          title: String(t.title ?? ""),
          description: t.description ?? null,
          priority: t.priority ?? null,
          status: (t.status ?? "TO_DO") as TicketStatus,
          startDate: t.startDate ?? t.start_date ?? null,
          dueDate: t.dueDate ?? t.due_date ?? null,
          createdAt: t.createdAt ?? t.created_at ?? null,
          updatedAt: t.updatedAt ?? t.updated_at ?? null,
          requesterName:
            t.requester?.fullName ??
            t.requester?.name ??
            t.requester_name ??
            t.requesterEmail ??
            undefined,
          projectName: t.project?.name ?? t.project_name ?? undefined,
        };

        setTicket(normalized);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Gagal memuat ticket");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleDelete = async () => {
    if (!ticket) return;
    const confirm = await Swal.fire({
      title: "Hapus ticket?",
      text: `Yakin ingin menghapus tiket “${ticket.title}”? Tindakan ini tidak dapat dikembalikan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });
    if (!confirm.isConfirmed) return;

    try {
      if (!USE_DUMMY) {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE}/tickets/${ticket.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
      } else {
        await new Promise((r) => setTimeout(r, 400)); // simulasi
      }

      await Swal.fire({
        icon: "success",
        title: "Terhapus",
        text: "Ticket berhasil dihapus.",
        showConfirmButton: false,
        timer: 1100,
      });
      navigate("/admin/dashboard/tickets");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal menghapus ticket.";
      await Swal.fire({ icon: "error", title: "Gagal", text: msg });
    }
  };

  return (
    <div>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate("/admin/dashboard/tickets")}
                      className="flex items-center gap-2"
                    >
                      <IconArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  </div>

                  {ticket && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="cursor-pointer"
                      >
                        <Link to={`/admin/dashboard/tickets/edit/${ticket.id}`}>
                          <IconEdit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        className="cursor-pointer"
                      >
                        <IconTrash className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>

                <h1 className="text-2xl font-semibold">Ticket Details</h1>
                <p className="text-muted-foreground">
                  Lihat informasi lengkap ticket.
                </p>
              </div>

              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{loading ? "Loading…" : ticket?.title ?? "-"}</CardTitle>
                    <CardDescription>
                      {loading
                        ? "Mengambil data ticket…"
                        : ticket?.description || "Tidak ada deskripsi."}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                        {error}
                      </div>
                    )}

                    {loading ? (
                      <div className="space-y-2">
                        <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-56 bg-muted animate-pulse rounded" />
                      </div>
                    ) : ticket ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">Project</div>
                          <div className="font-medium">
                            {ticket.projectName || `#${ticket.projectId}`}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">Requester</div>
                          <div className="font-medium">
                            {ticket.requesterName || `#${ticket.requesterId}`}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">Type</div>
                          <div>
                            <Badge variant="secondary">{ticket.type || "-"}</Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">Priority</div>
                          <div>
                            <Badge variant={priorityVariant(ticket.priority)}>
                              {ticket.priority || "-"}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">Status</div>
                          <div>
                            <Badge variant={statusVariant(ticket.status)}>
                              {ticket.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">Start Date</div>
                          <div className="font-medium">{fmt(ticket.startDate)}</div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">Due Date</div>
                          <div className="font-medium">{fmt(ticket.dueDate)}</div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">Created</div>
                          <div className="font-medium">{fmt(ticket.createdAt)}</div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">Updated</div>
                          <div className="font-medium">{fmt(ticket.updatedAt)}</div>
                        </div>

                        <div className="md:col-span-2">
                          <Separator className="my-2" />
                          <div className="text-xs text-muted-foreground mb-1">
                            Description
                          </div>
                          <div className="leading-relaxed">
                            {ticket.description || <span className="text-muted-foreground">—</span>}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Ticket tidak ditemukan.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
