import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

import {
  IconLayoutGrid,
  IconChevronDown,
  IconPlus,
  IconTrash,
  IconEdit,
  IconEye,
} from "@tabler/icons-react";


const API_BASE =  "http://localhost:3000";

type TicketType = "TASK" | "ISSUE" | string;
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
  type: TicketType;
  title: string;
  description?: string;
  priority?: TicketPriority;
  status: TicketStatus;
  requesterId: number;
  startDate?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  requesterName?: string;
  projectName?: string;
};

export default function AdminTickets() {
  const navigate = useNavigate();

  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>("");

  const [q, setQ] = React.useState("");
  const [cols, setCols] = React.useState({
    id: true,
    title: true,
    type: true,
    priority: true,
    status: true,
    requester: true,
    project: true,
    startDate: true,
    dueDate: true,
    actions: true,
  });

  const fetchTickets = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/tickets`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const raw: any[] = Array.isArray(res.data) ? res.data : res.data?.data ?? [];

      const normalized: Ticket[] = raw.map((t) => ({
        id: Number(t.id),
        projectId: Number(t.projectId ?? t.project_id ?? t.project?.id ?? 0),
        type: String(t.type ?? ""),
        title: String(t.title ?? ""),
        description: t.description ?? "",
        priority: t.priority ?? undefined,
        status: (t.status ?? "TO_DO") as TicketStatus,
        requesterId: Number(t.requesterId ?? t.requester_id ?? t.requester?.id ?? 0),
        startDate: t.startDate ?? t.start_date ?? undefined,
        dueDate: t.dueDate ?? t.due_date ?? undefined,
        createdAt: t.createdAt ?? t.created_at ?? undefined,
        updatedAt: t.updatedAt ?? t.updated_at ?? undefined,
        requesterName:
          t.requester?.fullName ??
          t.requester?.name ??
          t.requester_name ??
          t.requesterEmail ??
          "",
        projectName: t.project?.name ?? t.project_name ?? "",
      }));

      setTickets(normalized);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal memuat data tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString("id-ID");
    } catch {
      return iso ?? "-";
    }
  };

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return tickets;
    return tickets.filter((t) => {
      const fields = [
        t.title,
        t.type,
        t.priority,
        t.status,
        t.requesterName,
        t.projectName,
      ]
        .filter(Boolean)
        .map((x) => String(x).toLowerCase());
      return fields.some((f) => f.includes(s));
    });
  }, [tickets, q]);

  const statusVariant = (status?: TicketStatus) => {
    switch (status) {
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
      case "BLOCKED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const priorityVariant = (p?: TicketPriority) => {
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

  const handleDelete = async (id: number) => {
    const t = tickets.find((x) => x.id === id);
    const confirm = await Swal.fire({
      title: "Hapus ticket?",
      text: `Yakin ingin menghapus tiket “${t?.title ?? id}”? Tindakan ini tidak dapat dikembalikan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });
    if (!confirm.isConfirmed) return;

    const prev = tickets;
    setTickets((p) => p.filter((x) => x.id !== id));

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/tickets/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      await Swal.fire({
        title: "Terhapus",
        text: "Ticket berhasil dihapus.",
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      setTickets(prev);
      const msg = err?.response?.data?.message || "Gagal menghapus ticket.";
      await Swal.fire({ title: "Gagal", text: msg, icon: "error" });
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
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold">Tickets</h1>
                      <p className="text-muted-foreground pt-2">
                        Daftar tiket (bug/feature/task) di semua proyek.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        onClick={() => navigate("/admin/dashboard/tickets/create")}
                        className="cursor-pointer"
                      >
                        <IconPlus className="mr-2 h-4 w-4" />
                        Add Ticket
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="px-4 lg:px-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Input
                      placeholder="Cari title, status, priority, requester, atau project..."
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      className="w-80"
                    />
                    <div className="ml-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" className="flex items-center gap-2 cursor-pointer">
                            <IconLayoutGrid className="h-4 w-4" />
                            <span>Columns</span>
                            <IconChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuCheckboxItem
                            checked={cols.id}
                            onCheckedChange={(v) => setCols((c) => ({ ...c, id: !!v }))}
                          >
                            ID
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.title}
                            onCheckedChange={(v) => setCols((c) => ({ ...c, title: !!v }))}
                          >
                            Title
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.type}
                            onCheckedChange={(v) => setCols((c) => ({ ...c, type: !!v }))}
                          >
                            Type
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.priority}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, priority: !!v }))
                            }
                          >
                            Priority
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.status}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, status: !!v }))
                            }
                          >
                            Status
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.requester}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, requester: !!v }))
                            }
                          >
                            Requester
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.project}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, project: !!v }))
                            }
                          >
                            Project
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.startDate}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, startDate: !!v }))
                            }
                          >
                            Start
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.dueDate}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, dueDate: !!v }))
                            }
                          >
                            Due
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.actions}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, actions: !!v }))
                            }
                          >
                            Actions
                          </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded border">
                    <table className="min-w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr className="text-center">
                          {cols.id && <th className="px-4 py-3 font-medium">ID</th>}
                          {cols.title && <th className="px-4 py-3 font-medium">Title</th>}
                          {cols.type && <th className="px-4 py-3 font-medium">Type</th>}
                          {cols.priority && (
                            <th className="px-4 py-3 font-medium">Priority</th>
                          )}
                          {cols.status && (
                            <th className="px-4 py-3 font-medium">Status</th>
                          )}
                          {cols.requester && (
                            <th className="px-4 py-3 font-medium">Requester</th>
                          )}
                          {cols.project && (
                            <th className="px-4 py-3 font-medium">Project</th>
                          )}
                          {cols.startDate && (
                            <th className="px-4 py-3 font-medium">Start</th>
                          )}
                          {cols.dueDate && (
                            <th className="px-4 py-3 font-medium">Due</th>
                          )}
                          {cols.actions && (
                            <th className="px-4 py-3 font-medium">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={10} className="px-4 py-6 text-center">
                              Memuat data...
                            </td>
                          </tr>
                        ) : error ? (
                          <tr>
                            <td
                              colSpan={10}
                              className="px-4 py-6 text-center text-red-600"
                            >
                              {error}
                            </td>
                          </tr>
                        ) : (
                          filtered.map((t) => (
                            <tr key={t.id} className="border-t text-center">
                              {cols.id && <td className="px-4 py-3">{t.id}</td>}
                              {cols.title && <td className="px-4 py-3">{t.title}</td>}
                              {cols.type && (
                                <td className="px-4 py-3">
                                  <Badge variant="secondary">{t.type || "-"}</Badge>
                                </td>
                              )}
                              {cols.priority && (
                                <td className="px-4 py-3">
                                  <Badge variant={priorityVariant(t.priority)}>
                                    {t.priority || "-"}
                                  </Badge>
                                </td>
                              )}
                              {cols.status && (
                                <td className="px-4 py-3">
                                  <Badge variant={statusVariant(t.status)}>
                                    {t.status}
                                  </Badge>
                                </td>
                              )}
                              {cols.requester && (
                                <td className="px-4 py-3">
                                  {t.requesterName || `#${t.requesterId}`}
                                </td>
                              )}
                              {cols.project && (
                                <td className="px-4 py-3">
                                  {t.projectName || `Project #${t.projectId}`}
                                </td>
                              )}
                              {cols.startDate && (
                                <td className="px-4 py-3">{formatDate(t.startDate)}</td>
                              )}
                              {cols.dueDate && (
                                <td className="px-4 py-3">{formatDate(t.dueDate)}</td>
                              )}
                              {cols.actions && (
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-2">
                                    <Link
                                      to={`/admin/dashboard/tickets/view/${t.id}`}
                                      className="px-2 py-1 rounded"
                                    >
                                      <IconEye className="h-4 w-4" />
                                    </Link>
                                    <Link
                                      to={`/admin/dashboard/tickets/edit/${t.id}`}
                                      className="px-2 py-1 rounded"
                                    >
                                      <IconEdit className="h-4 w-4" />
                                    </Link>
                                    <button
                                      onClick={() => handleDelete(t.id)}
                                      className="px-2 py-1 rounded text-red-600 cursor-pointer"
                                    >
                                      <IconTrash className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    {!loading && filtered.length === 0 && (
                      q.trim() !== "" ? (
                        <Card className="bg-background border-t">
                          <div className="flex items-center gap-3 p-4 border-b">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                              <svg
                                viewBox="0 0 24 24"
                                className="h-5 w-5 text-muted-foreground"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                                />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Hasil Pencarian</h3>
                              <p className="text-sm text-muted-foreground">
                                Tidak ditemukan hasil untuk{" "}
                                <span className="font-medium text-foreground">“{q}”</span>.
                              </p>
                            </div>
                          </div>
                          <div className="p-6">
                            <p className="text-sm text-muted-foreground">
                              Periksa ejaan kata kunci atau coba gunakan kata kunci yang lebih umum.
                            </p>
                            <div className="mt-4 flex gap-3">
                              <Button variant="outline" onClick={() => setQ("")}>
                                Bersihkan Pencarian
                              </Button>
                              <Button onClick={() => navigate("/admin/dashboard/tickets/create")}>
                                Tambah Ticket
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ) : (
                        <Card className="bg-background border-t">
                          <div className="flex items-center gap-3 p-4 border-b">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                              <svg
                                viewBox="0 0 24 24"
                                className="h-5 w-5 text-muted-foreground"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16 14a4 4 0 10-8 0m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2v-2m12 4v-6a2 2 0 00-2-2h-1M5 18v-6a2 2 0 012-2h1"
                                />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Data Tickets</h3>
                              <p className="text-sm text-muted-foreground">Belum ada data yang ditampilkan.</p>
                            </div>
                          </div>
                          <div className="p-6">
                            <p className="text-sm text-muted-foreground">
                              Tambahkan ticket untuk mulai mengelola isu/permintaan pada proyek.
                            </p>
                            <div className="mt-4">
                              <Button onClick={() => navigate("/admin/dashboard/tickets/create")}>
                                Tambah Ticket
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
