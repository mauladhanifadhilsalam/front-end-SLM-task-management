import * as React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";


import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";

import {
  createProjectPhaseSchema,
  type CreateProjectPhaseValues,
  type CreateProjectPhaseField,
} from "@/schemas/project-phase.schema";

const API_BASE = import.meta.env.VITE_API_BASE

type Project = {
  id: number;
  name: string;
  status: string;
};

export default function CreateProjectPhases() {
  const navigate = useNavigate();
  

  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // biarkan bentuk state sesuai UI (projectId string dari <Select>), schema akan transform ke number
  const [form, setForm] = React.useState<CreateProjectPhaseValues>({
    name: "",
    startDate: "",
    endDate: "",
    projectId: 0 as any, // akan diisi string dari Select, Zod transform -> number
  });

  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<CreateProjectPhaseField, string>>
  >({});

  // Fetch available projects for dropdown
  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/projects`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setProjects(data);
      } catch (err: any) {
        console.error("Failed to load projects:", err);
      }
    };
    fetchProjects();
  }, []);

  const handleChange = (field: CreateProjectPhaseField, value: string) => {
    // projectId kita simpan sebagai string di state; schema akan transform angka saat validasi
    setForm((prev) => ({ ...prev, [field]: value as any }));

    // Re-validate field kalau sebelumnya error
    if (fieldErrors[field]) {
      const single = (createProjectPhaseSchema as any).pick({ [field]: true });
      const res = single.safeParse({ [field]: field === "projectId" ? Number(value) : value });
      setFieldErrors((fe) => ({
        ...fe,
        [field]: res.success ? undefined : res.error.issues[0]?.message,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setFieldErrors({});

    // Validasi pakai schema
    const parsed = createProjectPhaseSchema.safeParse(form);
      if (!parsed.success) {
        const fe: Partial<Record<CreateProjectPhaseField, string>> = {};
        for (const issue of parsed.error.issues) {
          const k = issue.path[0] as CreateProjectPhaseField;
          if (!fe[k]) fe[k] = issue.message;
        }
        setFieldErrors(fe);

        toast.warning("Form belum valid", {
          description: "Periksa kembali nama fase, tanggal, dan project yang dipilih.",
        });

        setSaving(false);
        return;
      }


    try {
      const token = localStorage.getItem("token");
      // payload sudah bersih: projectId number, tanggal valid
      const payload = parsed.data;

      await axios.post(`${API_BASE}/project-phases`, payload, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      toast.success("Project phase created", {
        description: "Project phase created successfully.",
      });

      navigate("/admin/dashboard/project-phases");

        } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to create project phase";
      setError(msg);
      toast.error("Failed to create project phase", {
        description: msg,
      });
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
                      onClick={() => navigate("/admin/dashboard/project-phases")}
                      className="flex items-center gap-2"
                    >
                      <IconArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  </div>
                  <h1 className="text-2xl font-semibold">Create Project Phase</h1>
                  <p className="text-muted-foreground">Add a new phase to an existing project</p>
                </div>

                <div className="px-4 lg:px-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Phase Information</CardTitle>
                      <CardDescription>Enter the details for the new project phase</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        {error && (
                          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                            {error}
                          </div>
                        )}

                        {/* Name */}
                        <div className="space-y-2">
                          <Label htmlFor="name">Phase Name *</Label>
                          <Input
                            id="name"
                            value={form.name as string}
                            onChange={(e) => handleChange("name", e.target.value)}
                            placeholder="Enter phase name"
                            disabled={saving}
                            aria-invalid={!!fieldErrors.name}
                            required
                          />
                          {fieldErrors.name && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Start Date */}
                          <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date *</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={form.startDate as string}
                              onChange={(e) => handleChange("startDate", e.target.value)}
                              disabled={saving}
                              aria-invalid={!!fieldErrors.startDate}
                              required
                            />
                            {fieldErrors.startDate && (
                              <p className="text-xs text-red-600 mt-1">{fieldErrors.startDate}</p>
                            )}
                          </div>

                          {/* End Date (min = startDate, jadi tidak bisa pilih sebelum start) */}
                          <div className="space-y-2">
                            <Label htmlFor="endDate">End Date *</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={form.endDate as string}
                              onChange={(e) => handleChange("endDate", e.target.value)}
                              disabled={saving}
                              aria-invalid={!!fieldErrors.endDate}
                              required
                              min={form.startDate || undefined}
                            />
                            {fieldErrors.endDate && (
                              <p className="text-xs text-red-600 mt-1">{fieldErrors.endDate}</p>
                            )}
                          </div>
                        </div>

                        {/* Project */}
                        <div className="space-y-2">
                          <Label>Project *</Label>
                          <Select
                            value={form.projectId ? String(form.projectId) : ""}
                            onValueChange={(value) => handleChange("projectId", value)}
                            disabled={saving}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                            <SelectContent>
                              {projects.map((project) => (
                                <SelectItem key={project.id} value={String(project.id)}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {fieldErrors.projectId && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrors.projectId}</p>
                          )}
                        </div>

                        <div className="flex justify-end space-x-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/admin/dashboard/project-phases")}
                            disabled={saving}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={saving}>
                            <IconCheck className="mr-2 h-4 w-4" />
                            {saving ? "Creating..." : "Create Phase"}
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
