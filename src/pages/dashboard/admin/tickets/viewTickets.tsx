// src/pages/tickets/ViewTickets.tsx
import * as React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import TicketComments from "./components/viewTicketsComment";
import TicketAttachments from "./components/viewTicketsAttacment";

const API_BASE = import.meta.env.VITE_API_BASE;

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

type UserLite = {
  id: number;
  fullName?: string;
  name?: string;
  email?: string;
  role?: string;
};
type Assignee = { id?: number; assignedAt?: string; user?: UserLite };

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
  assignees?: Assignee[];
};

// ================= Utils =================
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

// ================= Page =================
export default function ViewTickets() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = React.useState<Ticket | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const tokenHeader = React.useMemo(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }, []);

  const fetchTicket = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/tickets/${id}`, {
        headers: tokenHeader,
      });
      const t = res.data?.data ?? res.data;

      const normalized: Ticket = {
        id: Number(t.id),
        projectId: Number(t.projectId ?? t.project_id ?? t.project?.id ?? 0),
        requesterId: Number(
          t.requesterId ?? t.requester_id ?? t.requester?.id ?? 0
        ),
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
        assignees: Array.isArray(t.assignees) ? t.assignees : [],
      };

      setTicket(normalized);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal memuat ticket";

      setError(msg);
      toast.error("Gagal memuat ticket", {
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  }, [id, tokenHeader]);

  React.useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleConfirmDelete = async () => {
    if (!ticket) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE}/tickets/${ticket.id}`, {
        headers: tokenHeader,
      });

      toast.success("Ticket dihapus", {
        description: `Ticket "${ticket.title}" berhasil dihapus.`,
      });

      navigate("/admin/dashboard/tickets");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal menghapus ticket.";
      toast.error("Gagal menghapus ticket", {
        description: msg,
      });
      setDeleting(false);
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

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex items-center gap-2 cursor-pointer"
                            disabled={deleting}
                          >
                            <IconTrash className="h-4 w-4 mr-1" />
                            {deleting ? "Deleting..." : "Delete"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus ticket?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {ticket
                                ? `Yakin ingin menghapus tiket “${ticket.title}”? Tindakan ini tidak dapat dikembalikan.`
                                : "Yakin ingin menghapus tiket ini? Tindakan ini tidak dapat dikembalikan."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleting}>
                              Batal
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleConfirmDelete}
                              disabled={deleting}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deleting ? "Menghapus..." : "Ya, hapus"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
                    <CardTitle>
                      {loading ? "Loading…" : ticket?.title ?? "-"}
                    </CardTitle>
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
                          <div className="text-xs text-muted-foreground">
                            Project
                          </div>
                          <div className="font-medium">
                            {ticket.projectName || `#${ticket.projectId}`}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">
                            Requester
                          </div>
                          <div className="font-medium">
                            {ticket.requesterName || `#${ticket.requesterId}`}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">
                            Type
                          </div>
                          <div>
                            <Badge variant="secondary">
                              {ticket.type || "-"}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">
                            Priority
                          </div>
                          <div>
                            <Badge variant={priorityVariant(ticket.priority)}>
                              {ticket.priority || "-"}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">
                            Status
                          </div>
                          <div>
                            <Badge variant={statusVariant(ticket.status)}>
                              {ticket.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">
                            Start Date
                          </div>
                          <div className="font-medium">
                            {fmt(ticket.startDate)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">
                            Due Date
                          </div>
                          <div className="font-medium">
                            {fmt(ticket.dueDate)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">
                            Created
                          </div>
                          <div className="font-medium">
                            {fmt(ticket.createdAt)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">
                            Updated
                          </div>
                          <div className="font-medium">
                            {fmt(ticket.updatedAt)}
                          </div>
                        </div>

                        {Array.isArray(ticket.assignees) &&
                          ticket.assignees.length > 0 && (
                            <div className="md:col-span-2">
                              <Separator className="my-2" />
                              <div className="text-xs text-muted-foreground mb-2">
                                Assignees
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {ticket.assignees.map((a, idx) => {
                                  const name =
                                    a?.user?.fullName ||
                                    a?.user?.name ||
                                    a?.user?.email ||
                                    `User#${a?.user?.id ?? idx + 1}`;
                                  return <Badge key={idx}>{name}</Badge>;
                                })}
                              </div>
                            </div>
                          )}

                        {/* Description section with GitHub-style Markdown */}
                        <div className="md:col-span-2">
                          <Separator className="my-2" />
                          <div className="text-xs text-muted-foreground mb-1">
                            Description
                          </div>
                          {ticket.description ? (
                            <div className="markdown-body !bg-transparent !text-[14px] leading-relaxed">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {ticket.description}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <Separator className="my-4" />
                          <TicketAttachments ticketId={ticket.id} />
                        </div>

                        <div className="md:col-span-2">
                          <Separator className="my-4" />
                          <TicketComments ticketId={ticket.id} />
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
