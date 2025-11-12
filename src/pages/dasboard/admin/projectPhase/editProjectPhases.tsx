// src/pages/admin/EditProjectPhases.tsx
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";

import {
  editProjectPhaseSchema,
  type CreateProjectPhaseField as EditField,    
  type CreateProjectPhaseValues as EditValues,  
} from "@/schemas/project-phase.schema";

type Project = {
  id: number;
  name: string;
  status: string;
};

export default function EditProjectPhases() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const API_BASE = "http://localhost:3000";

  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Simpan projectId sebagai string (dari <Select>), schema akan transform ke number saat validasi
  const [form, setForm] = React.useState<EditValues>({
    name: "",
    startDate: "",
    endDate: "",
    projectId: 0 as any,
  });

  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<EditField, string>>
  >({});

  // helper: format ISO ke YYYY-MM-DD untuk input[type=date]
  const toInputDate = (isoOrDateStr: string) => {
    const d = new Date(isoOrDateStr);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  // Load phase & daftar projects
  React.useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      setFieldErrors({});

      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

        const phaseRes = await axios.get(`${API_BASE}/project-phases/${id}`, { headers });
        const phaseData = phaseRes.data?.data ?? phaseRes.data;

        setForm({
          name: phaseData.name ?? "",
          startDate: toInputDate(phaseData.startDate),
          endDate: toInputDate(phaseData.endDate),
          projectId: String(phaseData.projectId) as any,
        });

        const projectsRes = await axios.get(`${API_BASE}/projects`, { headers });
        const projectsData = Array.isArray(projectsRes.data)
          ? projectsRes.data
          : projectsRes.data?.data ?? [];
        setProjects(projectsData);
      } catch (err: any) {
        const msg = err?.response?.data?.message || "Failed to load phase data";
        setError(msg);
        await Swal.fire({ title: "Error", text: msg, icon: "error" });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (field: EditField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value as any }));

    // re-validate field jika sebelumnya error
    if (fieldErrors[field]) {
      const single = (editProjectPhaseSchema as any).pick({ [field]: true });
      const valueForCheck = field === "projectId" ? Number(value) : value;
      const res = single.safeParse({ [field]: valueForCheck });
      setFieldErrors((fe) => ({
        ...fe,
        [field]: res.success ? undefined : res.error.issues[0]?.message,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setError(null);
    setSaving(true);
    setFieldErrors({});

    // Validasi pakai schema edit (endDate harus setelah startDate)
    const parsed = editProjectPhaseSchema.safeParse(form);
    if (!parsed.success) {
      const fe: Partial<Record<EditField, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as EditField;
        if (!fe[k]) fe[k] = issue.message;
      }
      setFieldErrors(fe);
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = parsed.data; // projectId sudah number & tanggal valid

      await axios.patch(`${API_BASE}/project-phases/${id}`, payload, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      await Swal.fire({
        title: "Success",
        text: "Project phase updated successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/admin/dashboard/project-phases");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to update project phase";
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
                      onClick={() => navigate("/admin/dashboard/project-phases")}
                      className="flex items-center gap-2"
                    >
                      <IconArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  </div>
                  <h1 className="text-2xl font-semibold">Edit Project Phase</h1>
                  <p className="text-muted-foreground">Update phase details</p>
                </div>

                <div className="px-4 lg:px-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Phase Information</CardTitle>
                      <CardDescription>Modify the phase details below</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="rounded border p-6">Loading phase data...</div>
                      ) : (
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

                            {/* End Date (dibatasi min=startDate) */}
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
                            <Label htmlFor="project">Project *</Label>
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
                              {saving ? "Saving..." : "Save Changes"}
                            </Button>
                          </div>
                        </form>
                      )}
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
