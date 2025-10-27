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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";

type Project = {
  id: number;
  name: string;
  status: string;
};

export default function CreateProjectPhases() {
  const navigate = useNavigate();
  const API_BASE = "http://localhost:3000";

  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    name: "",
    startDate: "",
    endDate: "",
    projectId: "",
  });

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

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!form.name.trim()) {
      setError("Phase name is required");
      return;
    }
    if (!form.startDate) {
      setError("Start date is required");
      return;
    }
    if (!form.endDate) {
      setError("End date is required");
      return;
    }
    if (!form.projectId) {
      setError("Project selection is required");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: form.name.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        projectId: parseInt(form.projectId),
      };

      await axios.post(`${API_BASE}/project-phases`, payload, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      await Swal.fire({
        title: "Success",
        text: "Project phase created successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/admin/dashboard/project-phases");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to create project phase";
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
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                            {error}
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="name">Phase Name *</Label>
                          <Input
                            id="name"
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            placeholder="Enter phase name"
                            disabled={saving}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date *</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={form.startDate}
                              onChange={(e) => handleChange("startDate", e.target.value)}
                              disabled={saving}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="endDate">End Date *</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={form.endDate}
                              onChange={(e) => handleChange("endDate", e.target.value)}
                              disabled={saving}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="project">Project *</Label>
                          <Select
                            value={form.projectId}
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