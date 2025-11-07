import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";

const API_BASE = "http://localhost:3000";
const OPTIONS_TTL_MS = 5 * 60 * 1000; // 5 menit

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
  project?: { id: number; name: string } | null;
  requester?: { id: number; fullName?: string; name?: string; email?: string } | null;
};

type Opt = { id: number; name: string };

function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

function mapProjects(raw: any[]): Opt[] {
  return raw.map((p) => ({
    id: Number(p.id ?? p.projectId ?? 0),
    name: String(p.name ?? p.projectName ?? `Project #${p.id}`),
  }));
}

function mapUsers(raw: any[]): Opt[] {
  return raw.map((u) => ({
    id: Number(u.id ?? u.userId ?? 0),
    name: String(u.fullName ?? u.name ?? u.email ?? `User #${u.id}`),
  }));
}

export default function EditTickets() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Options (projects, requesters) with localStorage TTL cache
  const [projects, setProjects] = React.useState<Opt[]>([]);
  const [requesters, setRequesters] = React.useState<Opt[]>([]);
  const [loadingOptions, setLoadingOptions] = React.useState(true);

  // Form state
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    projectId: "",
    requesterId: "",
    type: "" as "" | TicketType,
    title: "",
    description: "",
    priority: "" as "" | TicketPriority,
    status: "" as "" | TicketStatus,
    startDate: "",
    dueDate: "",
  });

  const tokenHeader = React.useMemo(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }, []);

  // 1) Try read options from cache (instant)
  React.useEffect(() => {
    try {
      const cached = localStorage.getItem("options_cache");
      if (cached) {
        const { projects, requesters, ts } = JSON.parse(cached);
        if (Date.now() - ts < OPTIONS_TTL_MS) {
          setProjects(projects ?? []);
          setRequesters(requesters ?? []);
          setLoadingOptions(false);
        }
      }
    } catch {}
  }, []);

  // 2) Revalidate options in background (abortable)
  React.useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoadingOptions((prev) => prev && true); // kalau belum punya cache, tetap true
        const [projRes, userRes] = await Promise.all([
          axios.get(`${API_BASE}/projects`, { headers: tokenHeader, signal: controller.signal }),
          axios.get(`${API_BASE}/users`, { headers: tokenHeader, signal: controller.signal }),
        ]);

        const projRaw = Array.isArray(projRes.data) ? projRes.data : projRes.data?.data ?? [];
        const userRaw = Array.isArray(userRes.data) ? userRes.data : userRes.data?.data ?? [];

        const p = mapProjects(projRaw);
        const u = mapUsers(userRaw);

        setProjects(p);
        setRequesters(u);

        localStorage.setItem("options_cache", JSON.stringify({ projects: p, requesters: u, ts: Date.now() }));
      } catch (e: any) {
        if (axios.isCancel?.(e)) return;
        // Jangan timpa error form; cukup biarkan options pakai cache
      } finally {
        setLoadingOptions(false);
      }
    })();
    return () => controller.abort();
  }, [tokenHeader]);

  // 3) Fetch ticket detail
  const fetchTicket = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    try {
      const res = await axios.get(`${API_BASE}/tickets/${id}`, { headers: tokenHeader, signal: controller.signal });
      const t: Ticket = (res.data?.data ?? res.data) as Ticket;

      setForm({
        projectId: String(t.projectId ?? t.project?.id ?? ""),
        requesterId: String(t.requesterId ?? t.requester?.id ?? ""),
        type: (t.type as TicketType) ?? "",
        title: t.title ?? "",
        description: t.description ?? "",
        priority: (t.priority as TicketPriority) ?? "",
        status: (t.status as TicketStatus) ?? "",
        startDate: toLocalInput(t.startDate ?? null),
        dueDate: toLocalInput(t.dueDate ?? null),
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Gagal memuat ticket.");
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, [id, tokenHeader]);

  React.useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): string | null => {
    if (!form.projectId) return "Project wajib dipilih.";
    if (!form.requesterId) return "Requester wajib dipilih.";
    if (!form.type) return "Type wajib dipilih.";
    if (!form.title.trim()) return "Title tidak boleh kosong.";
    if (!form.priority) return "Priority wajib dipilih.";
    if (!form.status) return "Status wajib dipilih.";
    if (form.startDate && form.dueDate) {
      const s = new Date(form.startDate).getTime();
      const d = new Date(form.dueDate).getTime();
      if (!Number.isNaN(s) && !Number.isNaN(d) && d < s) {
        return "Due Date tidak boleh lebih awal dari Start Date.";
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const payload = {
      projectId: Number(form.projectId),
      requesterId: Number(form.requesterId),
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim() || null,
      priority: form.priority,
      status: form.status,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    };

    try {
      setSaving(true);
      await axios.patch(`${API_BASE}/tickets/${id}`, payload, { headers: tokenHeader });

      await Swal.fire({
        title: "Saved",
        text: "Perubahan ticket berhasil disimpan.",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });
      navigate(`/admin/dashboard/tickets/view/${id}`);
    } catch (err: any) {
      const msg2 = err?.response?.data?.message || "Gagal menyimpan perubahan.";
      setError(msg2);
      await Swal.fire({ title: "Error", text: msg2, icon: "error" });
    } finally {
      setSaving(false);
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
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/dashboard/tickets`)}
                    className="flex items-center gap-2"
                  >
                    <IconArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>
                <h1 className="text-2xl font-semibold">{loading ? "Loading..." : "Edit Ticket"}</h1>
                <p className="text-muted-foreground">Ubah detail ticket lalu simpan.</p>
              </div>

              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ticket Information</CardTitle>
                    <CardDescription>Edit fields you need to update</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Project & Requester */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Project *</Label>
                          <Select
                            value={form.projectId}
                            onValueChange={(v) => handleChange("projectId", v)}
                            disabled={saving}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  loadingOptions
                                    ? (form.projectId ? `#${form.projectId}` : "Loading projects…")
                                    : "Select a project"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {loadingOptions ? (
                                <div className="p-2 text-xs text-muted-foreground">Loading projects…</div>
                              ) : (
                                projects.map((p) => (
                                  <SelectItem key={p.id} value={String(p.id)}>
                                    {p.name} (#{p.id})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Requester *</Label>
                          <Select
                            value={form.requesterId}
                            onValueChange={(v) => handleChange("requesterId", v)}
                            disabled={saving}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  loadingOptions
                                    ? (form.requesterId ? `#${form.requesterId}` : "Loading requesters…")
                                    : "Select a requester"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {loadingOptions ? (
                                <div className="p-2 text-xs text-muted-foreground">Loading requesters…</div>
                              ) : (
                                requesters.map((r) => (
                                  <SelectItem key={r.id} value={String(r.id)}>
                                    {r.name} (#{r.id})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Type, Priority, Status */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label>Type *</Label>
                          <Select
                            value={form.type}
                            onValueChange={(v) => handleChange("type", v)}
                            disabled={saving || loading}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {(["ISSUE", "TASK"] as const).map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Priority *</Label>
                          <Select
                            value={form.priority}
                            onValueChange={(v) => handleChange("priority", v)}
                            disabled={saving || loading}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((p) => (
                                <SelectItem key={p} value={p}>
                                  {p}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Status *</Label>
                          <Select
                            value={form.status}
                            onValueChange={(v) => handleChange("status", v)}
                            disabled={saving || loading}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {(["NEW", "TO_DO", "IN_PROGRESS", "IN_REVIEW", "DONE", "RESOLVED", "CLOSED"] as const).map(
                                (s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          placeholder="Contoh: Fix login redirect issue"
                          value={form.title}
                          onChange={(e) => handleChange("title", e.target.value)}
                          disabled={saving || loading}
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          rows={5}
                          placeholder="Jelaskan isu/permintaan…"
                          value={form.description}
                          onChange={(e) => handleChange("description", e.target.value)}
                          disabled={saving || loading}
                        />
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="datetime-local"
                            value={form.startDate}
                            onChange={(e) => handleChange("startDate", e.target.value)}
                            disabled={saving || loading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dueDate">Due Date</Label>
                          <Input
                            id="dueDate"
                            type="datetime-local"
                            value={form.dueDate}
                            onChange={(e) => handleChange("dueDate", e.target.value)}
                            disabled={saving || loading}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate(`/admin/dashboard/tickets/view/${id}`)}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                          <IconCheck className="mr-2 h-4 w-4" />
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
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
