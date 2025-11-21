"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Check } from "lucide-react";

import * as React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { z } from "zod";
import {
  createTicketAssigneeSchema,
  userSchema,
  projectSchema,
  ticketSchema,
  type CreateTicketAssigneeInput,
  type User,
  type Project,
  type Ticket,
} from "@/schemas/ticket-assignee.schema";

export default function CreateTicketAssigneePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [validationErrors, setValidationErrors] = React.useState<
    Partial<Record<keyof CreateTicketAssigneeInput, string>>
  >({});

  const [projects, setProjects] = React.useState<Project[]>([]);
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [projectUsers, setProjectUsers] = React.useState<User[]>([]);
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(
    null
  );

  const [formData, setFormData] = React.useState({
    projectId: undefined as number | undefined,
    ticketId: undefined as number | undefined,
    userIds: [] as number[],
  });

  const API_BASE = import.meta.env.VITE_API_BASE;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch project & users awal
  React.useEffect(() => {
    const fetchInitial = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token
          ? { Authorization: `Bearer ${token}` }
          : undefined;

        const [projectRes, userRes] = await Promise.all([
          axios.get(`${API_BASE}/projects`, { headers }),
          axios.get(`${API_BASE}/users`, { headers }),
        ]);

        // Validasi response dengan Zod
        try {
          const validatedProjects = z.array(projectSchema).parse(projectRes.data || []);
          const validatedUsers = z.array(userSchema).parse(userRes.data || []);
          
          setProjects(validatedProjects);
          setUsers(validatedUsers);
        } catch (zodErr) {
          console.error("Validation error:", zodErr);
          // Jika validasi gagal, tetap set data (fallback)
          setProjects(projectRes.data || []);
          setUsers(userRes.data || []);
        }
      } catch (err) {
        console.error(err);
        const msg = "Gagal memuat data project atau user.";
        setErrorMsg(msg);
        toast.error("Gagal memuat data", { description: msg });
      }
    };

    fetchInitial();
  }, []);

  // Fetch tickets saat project berubah
  React.useEffect(() => {
    const fetchTickets = async () => {
      if (!formData.projectId) {
        setTickets([]);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE}/tickets`, {
          headers: getAuthHeaders(),
          params: { projectId: formData.projectId },
        });

        // Validasi response dengan Zod
        try {
          const validatedTickets = z.array(ticketSchema).parse(res.data || []);
          setTickets(validatedTickets);
        } catch (zodErr) {
          console.error("Validation error:", zodErr);
          setTickets(res.data || []);
        }
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat tickets", {
          description: "Tidak dapat memuat ticket dari project tersebut.",
        });
      }
    };

    fetchTickets();
  }, [formData.projectId]);

  // Fetch project assignments (user yang ada di project)
  React.useEffect(() => {
    const fetchProjectUsers = async () => {
      if (!formData.projectId) {
        setProjectUsers([]);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE}/project-assignments`, {
          headers: getAuthHeaders(),
          params: { projectId: formData.projectId },
        });

        const extractedUsers = res.data.map((i: any) => i.user);
        
        // Validasi response dengan Zod
        try {
          const validatedUsers = z.array(userSchema).parse(extractedUsers);
          setProjectUsers(validatedUsers);
        } catch (zodErr) {
          console.error("Validation error:", zodErr);
          setProjectUsers(extractedUsers);
        }
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat anggota project");
        setProjectUsers([]);
      }
    };

    fetchProjectUsers();
  }, [formData.projectId]);

  // Fetch detail ticket
  React.useEffect(() => {
    const fetchTicketDetail = async () => {
      if (!formData.ticketId) {
        setSelectedTicket(null);
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE}/tickets/${formData.ticketId}`,
          { headers: getAuthHeaders() }
        );

        // Validasi response dengan Zod
        try {
          const validatedTicket = ticketSchema.parse(res.data);
          setSelectedTicket(validatedTicket);
        } catch (zodErr) {
          console.error("Validation error:", zodErr);
          setSelectedTicket(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchTicketDetail();
  }, [formData.ticketId]);

  // Reset ticketId dan userIds ketika project berubah
  React.useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ticketId: undefined,
      userIds: [],
    }));
    setSelectedTicket(null);
    setValidationErrors({});
  }, [formData.projectId]);

  // Reset userIds ketika ticket berubah
  React.useEffect(() => {
    setFormData((prev) => ({ ...prev, userIds: [] }));
    // Clear only userIds error
    setValidationErrors((prev) => {
      const { userIds, ...rest } = prev;
      return rest;
    });
  }, [formData.ticketId]);

  const isUserAssigned = (userId: number) => {
    if (!selectedTicket) return false;
    return selectedTicket.assignees.some((a) => a.user.id === userId);
  };

  const toggleUser = (userId: number) => {
    if (isUserAssigned(userId)) return; // prevent toggle

    setFormData((prev) => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter((id) => id !== userId)
        : [...prev.userIds, userId],
    }));

    // Clear userIds error when user selects
    setValidationErrors((prev) => {
      const { userIds, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setValidationErrors({});

    // Validasi form dengan Zod terlebih dahulu
    const validation = createTicketAssigneeSchema.safeParse(formData);

    if (!validation.success) {
      // Handle validation errors
      const fieldErrors: Partial<Record<keyof CreateTicketAssigneeInput, string>> = {};
      const missingFields: string[] = [];
      
      // Mapping field names ke Bahasa Indonesia
      const fieldNameMap: Record<string, string> = {
        projectId: "Project",
        ticketId: "Ticket",
        userIds: "Assignees"
      };
      
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field && typeof field === 'string') {
          fieldErrors[field as keyof CreateTicketAssigneeInput] = issue.message;
          const fieldName = fieldNameMap[field] || field;
          missingFields.push(fieldName);
        }
      });

      setValidationErrors(fieldErrors);

      // Buat pesan error yang lebih natural
      let errorDescription = "Form belum lengkap";
      if (missingFields.length > 0) {
        const fieldList = missingFields.join(" dan ");
        errorDescription = `${fieldList} wajib diisi.`;
      }

      toast.error("Form belum lengkap", {
        description: errorDescription,
      });

      setLoading(false);
      return;
    }

    // Data sudah tervalidasi
    const validatedData = validation.data;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        const msg = "Token tidak ditemukan. Silakan login ulang.";
        setErrorMsg(msg);
        toast.error("Token tidak valid", { description: msg });
        setLoading(false);
        return;
      }

      // Submit untuk setiap user
      for (const uid of validatedData.userIds) {
        const payload = { ticketId: validatedData.ticketId, userId: uid };

        await axios.post(`${API_BASE}/ticket-assignees`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      const ticket = tickets.find((t) => t.id === validatedData.ticketId);
      const selectedUsers = projectUsers
        .filter((u) => validatedData.userIds.includes(u.id))
        .map((u) => u.fullName)
        .join(", ");

      toast.success("Ticket berhasil di-assign", {
        description: `Ticket "${ticket?.title}" di-assign ke: ${selectedUsers}`,
      });

      navigate("/admin/dashboard/ticket-assignees");
    } catch (apiError: any) {
      console.error(apiError);

      // Handle API errors
      const msg = apiError?.response?.data?.message || "Gagal assign ticket.";
      setErrorMsg(msg);
      toast.error("Gagal assign ticket", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <div className="flex flex-col px-4 lg:px-8 py-8 space-y-6">
          
          {/* Back Button */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/dashboard/ticket-assignees")}
              className="flex items-center gap-2 hover:bg-accent/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">
              Assign Ticket
            </h1>
            <p className="text-muted-foreground text-sm">
              Pilih project, ticket & user untuk menerima tugas.
            </p>
          </div>

          <Card className="shadow-sm border rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl">Ticket Assignee</CardTitle>
              <CardDescription>
                Pilih project, lalu ticket dan user yang ingin ditugaskan.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {errorMsg && (
                  <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                    {errorMsg}
                  </div>
                )}

                {/* Project */}
                <div className="space-y-2">
                  <Label>Project *</Label>
                  <Select
                    value={formData.projectId?.toString()}
                    onValueChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        projectId: parseInt(value),
                        ticketId: undefined,
                        userIds: [],
                      }));
                      // Clear projectId error
                      setValidationErrors((prev) => {
                        const { projectId, ...rest } = prev;
                        return rest;
                      });
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-[500px] rounded-lg">
                      <SelectValue placeholder="Pilih Project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.projectId && (
                    <p className="text-xs text-red-600 mt-1">
                      {validationErrors.projectId}
                    </p>
                  )}
                </div>

                {/* Ticket */}
                <div className="space-y-2">
                  <Label>Ticket *</Label>
                  <Select
                    value={formData.ticketId?.toString()}
                    onValueChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        ticketId: parseInt(value),
                      }));
                      // Clear ticketId error
                      setValidationErrors((prev) => {
                        const { ticketId, ...rest } = prev;
                        return rest;
                      });
                    }}
                    disabled={!formData.projectId || loading}
                  >
                    <SelectTrigger className="w-[500px] rounded-lg">
                      <SelectValue
                        placeholder={
                          formData.projectId
                            ? tickets.length > 0
                              ? "Pilih Ticket"
                              : "Tidak ada ticket dalam project ini"
                            : "Pilih project terlebih dahulu"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {tickets.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.ticketId && (
                    <p className="text-xs text-red-600 mt-1">
                      {validationErrors.ticketId}
                    </p>
                  )}
                </div>

                {/* Assignees */}
                <div className="space-y-2">
                  <Label>Assignees *</Label>

                  <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto bg-background/40 shadow-inner">
                    {projectUsers.length === 0 && formData.projectId && (
                      <p className="text-xs text-muted-foreground">
                        Tidak ada user yang terdaftar dalam project ini.
                      </p>
                    )}

                    {projectUsers.map((user) => {
                      const isAssigned = isUserAssigned(user.id);

                      return (
                        <div
                          key={user.id}
                          className={`flex items-center gap-3 p-3 rounded-lg transition ${
                            isAssigned
                              ? "opacity-60 cursor-not-allowed bg-muted/60"
                              : "hover:bg-muted/40 cursor-pointer"
                          }`}
                          onClick={() => toggleUser(user.id)}
                        >
                          <input
                            type="checkbox"
                            checked={
                              formData.userIds.includes(user.id) || isAssigned
                            }
                            onChange={() => toggleUser(user.id)}
                            disabled={isAssigned || loading}
                            className="h-4 w-4"
                          />

                          <div className="flex-1">
                            <div className="font-medium text-sm flex items-center gap-2">
                              {user.fullName}
                              {isAssigned && (
                                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-[2px] rounded-full">
                                  Already Assigned
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {formData.userIds.length} user dipilih.
                  </p>
                  {validationErrors.userIds && (
                    <p className="text-xs text-red-600 mt-1">
                      {validationErrors.userIds}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      navigate("/admin/dashboard/ticket-assignees")
                    }
                    disabled={loading}
                    className="rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {loading ? "Menyimpan..." : "Assign Ticket"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}