import * as React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";

import {
  createTicketSchema,
  type CreateTicketValues,
  type CreateTicketField,
  toCreateTicketPayload,
} from "@/schemas/tickets.schema";

const API_BASE = import.meta.env.VITE_API_BASE

type TicketType = "ISSUE" | "TASK";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type TicketStatus =
  | "NEW" | "TO_DO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "RESOLVED" | "CLOSED";

const TICKET_TYPES: TicketType[] = ["ISSUE", "TASK"];
const TICKET_PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const TICKET_STATUSES: TicketStatus[] = [
  "NEW", "TO_DO", "IN_PROGRESS", "IN_REVIEW", "DONE", "RESOLVED", "CLOSED",
];

export default function CreateTickets() {
  const navigate = useNavigate();

  const [projects, setProjects] = React.useState<{ id: number; name: string }[]>([]);
  const [requesters, setRequesters] = React.useState<{ id: number; name: string }[]>([]);

  const [loadingOptions, setLoadingOptions] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<CreateTicketValues>({
    projectId: 0 as any,
    requesterId: 0 as any,
    type: "" as any,
    title: "",
    description: "",
    priority: "" as any,
    status: "TO_DO",
    startDate: "",
    dueDate: "",
  });

  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<CreateTicketField, string>>
  >({});

  const tokenHeader = React.useMemo(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingOptions(true);

        const [projRes, userRes] = await Promise.all([
          axios.get(`${API_BASE}/projects`, { headers: tokenHeader }),
          axios.get(`${API_BASE}/users`, { headers: tokenHeader }),
        ]);

        const projRaw: any[] = Array.isArray(projRes.data) ? projRes.data : projRes.data?.data ?? [];
        const userRaw: any[] = Array.isArray(userRes.data) ? userRes.data : userRes.data?.data ?? [];

        const projOpts = projRaw.map((p) => ({
          id: Number(p.id ?? p.projectId ?? 0),
          name: String(p.name ?? p.projectName ?? `Project #${p.id}`),
        }));

        const userOpts = userRaw.map((u) => ({
          id: Number(u.id ?? u.userId ?? 0),
          name: String(u.fullName ?? u.name ?? u.email ?? `User #${u.id}`),
        }));

        if (mounted) {
          setProjects(projOpts);
          setRequesters(userOpts);
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          "Gagal memuat data Project/Requester. Pastikan API berjalan & token valid.";
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoadingOptions(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [tokenHeader]);

  const handleChange = (field: CreateTicketField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value as any }));


    if (fieldErrors[field]) {
      const single = (createTicketSchema as any).pick({ [field]: true });
      const forCheck =
        field === "projectId" || field === "requesterId" ? Number(value) : value;
      const res = single.safeParse({ [field]: forCheck });
      setFieldErrors((fe) => ({
        ...fe,
        [field]: res.success ? undefined : res.error.issues[0]?.message,
      }));
    }


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


    const parsed = createTicketSchema.safeParse(form);
    if (!parsed.success) {
      const fe: Partial<Record<CreateTicketField, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as CreateTicketField;
        if (!fe[k]) fe[k] = issue.message;
      }
      setFieldErrors(fe);
      setSaving(false);
      return;
    }

    const payload = toCreateTicketPayload(parsed.data);

    try {
      await axios.post(`${API_BASE}/tickets`, payload, { headers: tokenHeader });

      await Swal.fire({
        title: "Success",
        text: "Ticket berhasil dibuat",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });

      navigate("/admin/dashboard/tickets");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal membuat ticket.";
      setError(msg);
      await Swal.fire({ title: "Error", text: msg, icon: "error" });
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
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <div className="flex items-center gap-4 mb-4">
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
                  <h1 className="text-2xl font-semibold">Create Ticket</h1>
                  <p className="text-muted-foreground">Add a new ticket (bug, feature, task, or improvement)</p>
                </div>

                <div className="px-4 lg:px-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ticket Information</CardTitle>
                      <CardDescription>Enter the details for the new ticket</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        {error && (
                          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                            {error}
                          </div>
                        )}

                        {/* Project & Requester */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Project *</Label>
                            <Select
                              value={form.projectId ? String(form.projectId) : ""}
                              onValueChange={(v) => handleChange("projectId", v)}
                              disabled={saving || loadingOptions}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={loadingOptions ? "Loading projects..." : "Select a project"} />
                              </SelectTrigger>
                              <SelectContent>
                                {projects.map((p) => (
                                  <SelectItem key={p.id} value={String(p.id)}>
                                    {p.name} (#{p.id})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {fieldErrors.projectId && (
                              <p className="text-xs text-red-600 mt-1">{fieldErrors.projectId}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Requester *</Label>
                            <Select
                              value={form.requesterId ? String(form.requesterId) : ""}
                              onValueChange={(v) => handleChange("requesterId", v)}
                              disabled={saving || loadingOptions}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={loadingOptions ? "Loading requesters..." : "Select a requester"} />
                              </SelectTrigger>
                              <SelectContent>
                                {requesters.map((r) => (
                                  <SelectItem key={r.id} value={String(r.id)}>
                                    {r.name} (#{r.id})
                                  </SelectItem>
                                ))}
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
                              value={form.type || ""}
                              onValueChange={(v) => handleChange("type", v)}
                              disabled={saving}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {TICKET_TYPES.map((t) => (
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
                              value={form.priority || ""}
                              onValueChange={(v) => handleChange("priority", v)}
                              disabled={saving}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                {TICKET_PRIORITIES.map((p) => (
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
                              value={form.status || ""}
                              onValueChange={(v) => handleChange("status", v)}
                              disabled={saving}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {TICKET_STATUSES.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
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
                            disabled={saving}
                            aria-invalid={!!fieldErrors.title}
                            required
                          />
                          {fieldErrors.title && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrors.title}</p>
                          )}
                        </div>

                        {/* Description (WAJIB) */}
                        <div className="space-y-2">
                          <Label htmlFor="description">Description *</Label>
                          <Textarea
                            id="description"
                            rows={5}
                            placeholder="Deskripsikan isu/permintaan secara jelas… (min 10 karakter)"
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            disabled={saving}
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
                              disabled={saving}
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
                              disabled={saving}
                              aria-invalid={!!fieldErrors.dueDate}
                              min={form.startDate || undefined} // cegah pilih due < start di UI
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
                            onClick={() => navigate("/admin/dashboard/tickets")}
                            disabled={saving}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={saving || loadingOptions}>
                            <IconCheck className="mr-2 h-4 w-4" />
                            {saving ? "Creating..." : "Create Ticket"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
