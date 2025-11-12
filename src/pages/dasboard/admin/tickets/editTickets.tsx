// src/pages/tickets/EditTickets.tsx
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

import {
  editTicketSchema,
  type EditTicketValues,
  type EditTicketField,
  toEditTicketPayload,
} from "@/schemas/tickets.schema";

const API_BASE = "http://localhost:3000";
const OPTIONS_TTL_MS = 5 * 60 * 1000; // 5 menit

type Ticket = {
  id: number;
  projectId: number;
  requesterId: number;
  type: "ISSUE" | "TASK" | string;
  title: string;
  description?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string | null;
  status:
    | "NEW"
    | "TO_DO"
    | "IN_PROGRESS"
    | "IN_REVIEW"
    | "DONE"
    | "RESOLVED"
    | "CLOSED"
    | string;
  startDate?: string | null;
  dueDate?: string | null;
  project?: { id: number; name: string } | null;
  requester?: { id: number; fullName?: string; name?: string; email?: string } | null;
};

type Opt = { id: number; name: string };

/** konversi ISO → 'YYYY-MM-DDTHH:mm' untuk input datetime-local */
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

/**
 * UI form type (boleh "" sebelum dipilih).
 * Ini menghindari error TS: Type 'string' is not assignable to union literal.
 */
type UiEditTicketForm = {
  projectId: string;
  requesterId: string;
  type: "" | "ISSUE" | "TASK";
  title: string;
  description: string;
  priority: "" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status:
    | ""
    | "NEW"
    | "TO_DO"
    | "IN_PROGRESS"
    | "IN_REVIEW"
    | "DONE"
    | "RESOLVED"
    | "CLOSED";
  startDate: string;
  dueDate: string;
};

export default function EditTickets() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Options
  const [projects, setProjects] = React.useState<Opt[]>([]);
  const [requesters, setRequesters] = React.useState<Opt[]>([]);
  const [loadingOptions, setLoadingOptions] = React.useState(true);

  // Form state
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<UiEditTicketForm>({
    projectId: "",
    requesterId: "",
    type: "",
    title: "",
    description: "",
    priority: "",
    status: "",
    startDate: "",
    dueDate: "",
  });

  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<EditTicketField, string>>>({});

  const tokenHeader = React.useMemo(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }, []);

  // 1) Options dari cache (instant)
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

  // 2) Revalidate options
  React.useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoadingOptions((prev) => prev && true);
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
      } finally {
        setLoadingOptions(false);
      }
    })();
    return () => controller.abort();
  }, [tokenHeader]);

  // 3) Load detail ticket
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
        type: (t.type ?? "") as UiEditTicketForm["type"],
        title: t.title ?? "",
        description: t.description ?? "",
        priority: (t.priority ?? "") as UiEditTicketForm["priority"],
        status: (t.status ?? "") as UiEditTicketForm["status"],
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

  const handleChange = (field: keyof UiEditTicketForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // re-validate field jika sebelumnya error
    if (fieldErrors[field as EditTicketField]) {
      const single = (editTicketSchema as any).pick({ [field]: true });
      const forCheck =
        field === "projectId" || field === "requesterId" ? Number(value) : value;
      const res = single.safeParse({ [field]: forCheck });
      setFieldErrors((fe) => ({
        ...fe,
        [field as EditTicketField]: res.success ? undefined : res.error.issues[0]?.message,
      }));
    }

    // UX: jika startDate berubah dan dueDate < startDate, kosongkan dueDate
    if (field === "startDate" && form.dueDate) {
      const s = new Date(value).getTime();
      const d = new Date(form.dueDate).getTime();
      if (!Number.isNaN(s) && !Number.isNaN(d) && d < s) {
        setForm((prev) => ({ ...prev, dueDate: "" }));
        setFieldErrors((fe) => ({ ...fe, dueDate: undefined }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setFieldErrors({});

    // parse & validasi Zod
    const parsed = editTicketSchema.safeParse({
      projectId: form.projectId,
      requesterId: form.requesterId,
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: form.status,
      startDate: form.startDate,
      dueDate: form.dueDate,
    });

    if (!parsed.success) {
      const fe: Partial<Record<EditTicketField, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as EditTicketField;
        if (!fe[k]) fe[k] = issue.message;
      }
      setFieldErrors(fe);
      setSaving(false);
      return;
    }

    const payload = toEditTicketPayload(parsed.data);

    try {
      await axios.patch(`${API_BASE}/tickets/${id}`, payload, { headers: tokenHeader });
      await Swal.fire({
        title: "Saved",
        text: "Perubahan ticket berhasil disimpan.",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });
      navigate(`/admin/dashboard/tickets`);
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

                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                      {/* Project & Requester */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Project *</Label>
                          <Select
                            value={form.projectId}
                            onValueChange={(v) => handleChange("projectId", v)}
                            disabled={saving || loading}
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
                          {fieldErrors.projectId && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrors.projectId}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Requester *</Label>
                          <Select
                            value={form.requesterId}
                            onValueChange={(v) => handleChange("requesterId", v)}
                            disabled={saving || loading}
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
                          {fieldErrors.requesterId && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrors.requesterId}</p>
                          )}
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
                          {fieldErrors.type && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrors.type}</p>
                          )}
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
                          {fieldErrors.priority && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrors.priority}</p>
                          )}
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
                          {fieldErrors.status && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrors.status}</p>
                          )}
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
                          aria-invalid={!!fieldErrors.title}
                          required
                        />
                        {fieldErrors.title && (
                          <p className="text-xs text-red-600 mt-1">{fieldErrors.title}</p>
                        )}
                      </div>

                      {/* Description (WAJIB, min 10) */}
                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          rows={5}
                          placeholder="Jelaskan isu/permintaan… (min 10 karakter)"
                          value={form.description}
                          onChange={(e) => handleChange("description", e.target.value)}
                          disabled={saving || loading}
                          aria-invalid={!!fieldErrors.description}
                          required
                        />
                        {fieldErrors.description && (
                          <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>
                        )}
                      </div>

                      {/* Dates (WAJIB) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date *</Label>
                          <Input
                            id="startDate"
                            type="datetime-local"
                            value={form.startDate}
                            onChange={(e) => handleChange("startDate", e.target.value)}
                            disabled={saving || loading}
                            aria-invalid={!!fieldErrors.startDate}
                            required
                          />
                          {fieldErrors.startDate && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrors.startDate}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dueDate">Due Date *</Label>
                          <Input
                            id="dueDate"
                            type="datetime-local"
                            value={form.dueDate}
                            onChange={(e) => handleChange("dueDate", e.target.value)}
                            disabled={saving || loading}
                            aria-invalid={!!fieldErrors.dueDate}
                            min={form.startDate || undefined} // cegah pilih due < start via UI
                            required
                          />
                          {fieldErrors.dueDate && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrors.dueDate}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate(`/admin/dashboard/tickets`)}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={saving || loading}>
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
