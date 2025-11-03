import * as React from "react";
import { useNavigate } from "react-router-dom";
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

type TicketType = "ISSUE" | "TASK";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type TicketStatus = "NEW" |"TO_DO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "RESOLVED" | "CLOSED";

const TICKET_TYPES: TicketType[] = ["ISSUE","TASK"];
const TICKET_PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const TICKET_STATUSES: TicketStatus[] = ["NEW","TO_DO", "IN_PROGRESS", "IN_REVIEW", "DONE", "RESOLVED", "CLOSED"];

export default function CreateTickets() {
  const navigate = useNavigate();

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

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    projectId: "",
    requesterId: "",
    type: "" as "" | TicketType,
    title: "",
    description: "",
    priority: "" as "" | TicketPriority,
    status: "TO_DO" as TicketStatus | "",
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
      status: form.status || "TO_DO",
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    };

    try {
      setSaving(true);

      if (USE_DUMMY) {
        // simulasi success
        await new Promise((r) => setTimeout(r, 700));
      } 
      

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
                      <form onSubmit={handleSubmit} className="space-y-6">
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
                              value={form.projectId}
                              onValueChange={(v) => handleChange("projectId", v)}
                              disabled={saving}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a project" />
                              </SelectTrigger>
                              <SelectContent>
                                {projects.map((p) => (
                                  <SelectItem key={p.id} value={String(p.id)}>
                                    {p.name} (#{p.id})
                                  </SelectItem>
                                ))}
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
                                <SelectValue placeholder="Select a requester" />
                              </SelectTrigger>
                              <SelectContent>
                                {requesters.map((r) => (
                                  <SelectItem key={r.id} value={String(r.id)}>
                                    {r.name} (#{r.id})
                                  </SelectItem>
                                ))}
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
                          </div>

                          <div className="space-y-2">
                            <Label>Priority *</Label>
                            <Select
                              value={form.priority}
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
                          </div>

                          <div className="space-y-2">
                            <Label>Status *</Label>
                            <Select
                              value={form.status}
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
                          />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            rows={5}
                            placeholder="Deskripsikan isu/permintaan secara jelas…"
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            disabled={saving}
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
                              disabled={saving}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endDate">Due Date</Label>
                            <Input
                              id="endDate"
                              type="datetime-local"
                              value={form.dueDate}
                              onChange={(e) => handleChange("dueDate", e.target.value)}
                              disabled={saving}
                            />
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
                          <Button type="submit" disabled={saving}>
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
