"use client";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";

interface TicketData {
  id: number;
  title: string;
  description: string | null;
  type: string;
  status: string;
  priority: string;
  projectId: number;
  requesterId: number;
  assignees: {
    id: number;
    user: {
      id: number;
      name: string;
      email: string;
    };
  }[];
}

interface User {
  id: number;
  name: string;
  email: string;
}

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
  { value: "PENDING", label: "Pending" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

export default function EditTicketAssignee() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const [ticket, setTicket] = React.useState<TicketData | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);

  const [form, setForm] = React.useState({
    status: "",
    priority: "",
    assigneeIds: [] as number[],
  });

  const API_BASE = "http://localhost:3000";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch ticket data dan users
  React.useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
          setError("Sesi otentikasi tidak ditemukan. Harap login.");
          setLoading(false);
          return;
        }

        const [ticketRes, usersRes] = await Promise.all([
          axios.get(`${API_BASE}/tickets/${id}`, {
            headers: getAuthHeaders(),
          }),
          axios.get(`${API_BASE}/users`, {
            headers: getAuthHeaders(),
          }),
        ]);

        const ticketData = ticketRes.data;
        setTicket(ticketData);
        setUsers(usersRes.data || []);

        // Set form dengan data ticket yang ada
        setForm({
          status: ticketData.status,
          priority: ticketData.priority,
          assigneeIds: ticketData.assignees.map((a: any) => a.user.id),
        });
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 404) {
          setError("Tiket tidak ditemukan.");
        } else if (err.response?.status === 401) {
          setError("Akses ditolak. Silakan login kembali.");
        } else {
          setError("Gagal memuat data tiket.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle assignee toggle
  const toggleAssignee = (userId: number) => {
    setForm((prev) => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(userId)
        ? prev.assigneeIds.filter((id) => id !== userId)
        : [...prev.assigneeIds, userId],
    }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !ticket) return;

    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token tidak ditemukan. Silakan login ulang.");
        setSaving(false);
        return;
      }

      const payload = {
        status: form.status,
        priority: form.priority,
        assigneeIds: form.assigneeIds,
      };

      console.log("Payload dikirim:", payload);

      await axios.patch(`${API_BASE}/tickets/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      await Swal.fire({
        title: "Berhasil",
        text: `Tiket "${ticket.title}" berhasil diperbarui.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/admin/dashboard/ticket-assignee");
    } catch (err: any) {
      console.error(err);
      const message = err?.response?.data?.message || "Gagal menyimpan perubahan.";
      setError(message);
      await Swal.fire({
        title: "Gagal",
        text: message,
        icon: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col px-4 lg:px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/dashboard/tickets")}
              className="flex items-center gap-2"
            >
              <IconArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </div>

          <h1 className="text-2xl font-semibold">
            Edit Ticket Assignment 🎫
          </h1>
          <p className="text-muted-foreground mb-6">
            {ticket ? `Edit: ${ticket.title}` : "Memuat data..."}
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Edit Penugasan Tiket</CardTitle>
              <CardDescription>
                Ubah status, priority, dan assignee tiket.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="rounded border p-6">Memuat data tiket...</div>
              ) : error ? (
                <div className="rounded border border-red-300 bg-red-50 p-4 mb-4 text-sm text-red-600">
                  {error}
                </div>
              ) : !ticket ? (
                <div className="rounded border p-6">Tiket tidak ditemukan.</div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Ticket Info (Read Only) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Nama Tiket</Label>
                      <Input value={ticket.title} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Input value={ticket.type} disabled />
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={form.status}
                        onValueChange={(value) =>
                          setForm((prev) => ({ ...prev, status: value }))
                        }
                        disabled={saving}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority *</Label>
                      <Select
                        value={form.priority}
                        onValueChange={(value) =>
                          setForm((prev) => ({ ...prev, priority: value }))
                        }
                        disabled={saving}
                      >
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Pilih Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Assignees */}
                  <div className="space-y-2">
                    <Label>Assignees *</Label>
                    <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                      {users.length > 0 ? (
                        users.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer"
                            onClick={() => toggleAssignee(user.id)}
                          >
                            <input
                              type="checkbox"
                              checked={form.assigneeIds.includes(user.id)}
                              onChange={() => toggleAssignee(user.id)}
                              className="h-4 w-4"
                              disabled={saving}
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {user.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Tidak ada user tersedia
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {form.assigneeIds.length} assignee dipilih
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/admin/dashboard/ticket-assignee")}
                      disabled={saving}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={saving}>
                      <IconCheck className="mr-2 h-4 w-4" />
                      {saving ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}