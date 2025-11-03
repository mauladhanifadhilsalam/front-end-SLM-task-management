import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";


const USE_DUMMY = true; 

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
};

const TICKET_TYPES = [
  { value: "ISSUE", label: "Issue" },
  { value: "TASK", label: "Task" },
] as const;
const TICKET_PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
] as const;
const TICKET_STATUSES = [
  { value: "NEW", label: "New" },
  { value: "TO_DO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "DONE", label: "Done" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
] as const;

/* =========================
   Small helper Select wrapper
========================= */
type Option = { value: string; label: string };

function FieldSelect({
  id,
  label,
  placeholder,
  value,
  onValueChange,
  disabled,
  required = false,
  description,
  options,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (v: string) => void;
  disabled?: boolean;
  required?: boolean;
  description?: string;
  options: Option[];
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <Label htmlFor={id}>{label}</Label>
        {required && <span className="text-destructive">*</span>}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* =========================
   Component
========================= */
export default function EditTickets() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // dropdown dummy; ganti ke fetch bila endpoint tersedia
  const [projects] = React.useState<{ id: number; name: string }[]>([
    { id: 10, name: "SLM Task Management" },
    { id: 11, name: "Desaku Platform" },
    { id: 12, name: "SALAM Enterprise Revamp" },
  ]);
  const [requesters] = React.useState<{ id: number; name: string }[]>([
    { id: 5, name: "Maulana" },
    { id: 7, name: "Ghifari" },
    { id: 4, name: "Maula" },
  ]);

  const projectOptions: Option[] = projects.map((p) => ({
    value: String(p.id),
    label: `${p.name} (#${p.id})`,
  }));
  const requesterOptions: Option[] = requesters.map((r) => ({
    value: String(r.id),
    label: `${r.name} (#${r.id})`,
  }));

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

  const fetchTicket = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_DUMMY) {
        // ---- dummy dataset ----
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
            startDate: "2025-10-28T10:00:00Z",
            dueDate: "2025-11-05T17:00:00Z",
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
            startDate: "2025-10-30T09:00:00Z",
            dueDate: "2025-11-10T18:00:00Z",
          },
        ];
        const found = dummy.find((t) => String(t.id) === String(id));
        if (!found) throw new Error("Ticket tidak ditemukan (dummy).");

        // prefill form; datetime-local butuh value tanpa Z dan detik
        const toLocalInput = (iso?: string | null) => {
          if (!iso) return "";
          const d = new Date(iso);
          if (isNaN(d.getTime())) return "";
          const pad = (n: number) => String(n).padStart(2, "0");
          const yyyy = d.getFullYear();
          const MM = pad(d.getMonth() + 1);
          const dd = pad(d.getDate());
          const hh = pad(d.getHours());
          const mm = pad(d.getMinutes());
          return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
        };

        setForm({
          projectId: String(found.projectId),
          requesterId: String(found.requesterId),
          type: (found.type as TicketType) ?? "",
          title: found.title ?? "",
          description: found.description ?? "",
          priority: (found.priority as TicketPriority) ?? "",
          status: (found.status as TicketStatus) ?? "",
          startDate: toLocalInput(found.startDate),
          dueDate: toLocalInput(found.dueDate),
        });
      } 
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Gagal memuat ticket.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const msg = validate();
    if (msg) {
      setError(msg);
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

      if (USE_DUMMY) {
        await new Promise((r) => setTimeout(r, 700)); // simulasi success
      } 

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
            <div className="@container/main flex flex-1 flex-col gap-2">
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
                  <h1 className="text-2xl font-semibold">
                    {loading ? "Loading..." : "Edit Ticket"}
                  </h1>
                  <p className="text-muted-foreground">
                    Ubah detail ticket lalu simpan.
                  </p>
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
                          <FieldSelect
                            id="project"
                            label="Project"
                            required
                            description="Proyek yang terkait dengan ticket."
                            placeholder="Select a project"
                            value={form.projectId}
                            onValueChange={(v) => handleChange("projectId", v)}
                            disabled={saving || loading}
                            options={projectOptions}
                          />

                          <FieldSelect
                            id="requester"
                            label="Requester"
                            required
                            description="Orang yang meminta/melaporkan ticket."
                            placeholder="Select a requester"
                            value={form.requesterId}
                            onValueChange={(v) => handleChange("requesterId", v)}
                            disabled={saving || loading}
                            options={requesterOptions}
                          />
                        </div>

                        {/* Type, Priority, Status */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FieldSelect
                            id="type"
                            label="Type"
                            required
                            placeholder="Select type"
                            value={form.type}
                            onValueChange={(v) => handleChange("type", v)}
                            disabled={saving || loading}
                            options={TICKET_TYPES as unknown as Option[]}
                          />

                          <FieldSelect
                            id="priority"
                            label="Priority"
                            required
                            placeholder="Select priority"
                            value={form.priority}
                            onValueChange={(v) => handleChange("priority", v)}
                            disabled={saving || loading}
                            options={TICKET_PRIORITIES as unknown as Option[]}
                          />

                          <FieldSelect
                            id="status"
                            label="Status"
                            required
                            placeholder="Select status"
                            value={form.status}
                            onValueChange={(v) => handleChange("status", v)}
                            disabled={saving || loading}
                            options={TICKET_STATUSES as unknown as Option[]}
                          />
                        </div>

                        {/* Title */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1">
                            <Label htmlFor="title">Title</Label>
                            <span className="text-destructive">*</span>
                          </div>
                          <Input
                            id="title"
                            placeholder="Contoh: Fix login redirect issue"
                            value={form.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            disabled={saving || loading}
                          />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                          <Label htmlFor="description">Description</Label>
                          <p className="text-xs text-muted-foreground">
                            Jelaskan masalah/kebutuhan dengan ringkas.
                          </p>
                          <Textarea
                            id="description"
                            rows={5}
                            placeholder="Deskripsikan isu/permintaan…"
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            disabled={saving || loading}
                          />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                              id="startDate"
                              type="datetime-local"
                              value={form.startDate}
                              onChange={(e) => handleChange("startDate", e.target.value)}
                              disabled={saving || loading}
                            />
                          </div>
                          <div className="space-y-1.5">
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
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
