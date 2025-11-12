import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { IconLayoutGrid, IconChevronDown, IconPlus, IconTrash, IconEdit, IconEye } from "@tabler/icons-react";

type ProjectStatus = "NOT_STARTED" | "IN_PROGRESS" | "DONE" | "ON_HOLD";

type Project = {
  id: number;
  name: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
};

type Phase = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  projectId: number;
  createdAt: string;
  updatedAt: string;
  project?: Project;
};

const API_BASE = import.meta.env.VITE_API_BASE

export default function AdminProjectPhasePage() {
  const navigate = useNavigate();
  

  const [phases, setPhases] = React.useState<Phase[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [q, setQ] = React.useState("");
  const [cols, setCols] = React.useState({
    id: true,
    name: true,
    projectName: true, 
    phaseStart: true, 
    phaseEnd: true,   
    projectDates: true, 
    status: true,
    actions: true,
  });

  const fetchPhases = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/project-phases`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setPhases(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load project phases");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPhases();
  }, [fetchPhases]);

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const filtered = React.useMemo(() => {
    const query = q.toLowerCase().trim();
    if (!query) return phases;
    return phases.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.project?.name.toLowerCase().includes(query)
    );
  }, [phases, q]);

  const handleDelete = async (id: number) => {
    const phase = phases.find((x) => x.id === id);
    const confirm = await Swal.fire({
      title: "Delete project phase?",
      text: `Are you sure you want to delete "${phase?.name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;

    const prev = phases;
    setPhases((p) => p.filter((x) => x.id !== id));

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/project-phases/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      await Swal.fire({
        title: "Deleted",
        text: "Phase has been deleted.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err: any) {
      setPhases(prev);
      const msg = err?.response?.data?.message || "Failed to delete phase";
      await Swal.fire({ title: "Failed", text: msg, icon: "error" });
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold">Project Phases</h1>
                      <p className="text-muted-foreground">Manage project phases and timelines</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate("/admin/dashboard/project-phases/create")}
                      className="cursor-pointer"
                    >
                      <IconPlus className="mr-2 h-4 w-4" />
                      Add Phase
                    </Button>
                  </div>
                </div>

                <div className="px-4 lg:px-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Input
                      placeholder="Filter by phase or project name..."
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      className="w-80"
                    />
                    <div className="ml-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" className="flex items-center gap-2">
                            <IconLayoutGrid className="h-4 w-4" />
                            <span>Columns</span>
                            <IconChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuCheckboxItem
                            checked={cols.id}
                            onCheckedChange={(v) => setCols((c) => ({ ...c, id: !!v }))}
                          >
                            ID
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.name}
                            onCheckedChange={(v) => setCols((c) => ({ ...c, name: !!v }))}
                          >
                            Phase Name
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.projectName}
                            onCheckedChange={(v) => setCols((c) => ({ ...c, projectName: !!v }))}
                          >
                            Project Name
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.phaseStart}
                            onCheckedChange={(v) => setCols((c) => ({ ...c, phaseStart: !!v }))}
                          >
                            Phase Start
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.phaseEnd}
                            onCheckedChange={(v) => setCols((c) => ({ ...c, phaseEnd: !!v }))}
                          >
                            Phase End
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.projectDates}
                            onCheckedChange={(v) => setCols((c) => ({ ...c, projectDates: !!v }))}
                          >
                            Project Timeline
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.status}
                            onCheckedChange={(v) => setCols((c) => ({ ...c, status: !!v }))}
                          >
                            Status
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.actions}
                            onCheckedChange={(v) => setCols((c) => ({ ...c, actions: !!v }))}
                          >
                            Actions
                          </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted/50">
                        <tr className="text-center">
                          {cols.id && <th className="px-4 py-3 text-sm font-medium">ID</th>}
                          {cols.name && <th className="px-4 py-3 text-sm font-medium">Phase Name</th>}
                          {cols.projectName && <th className="px-4 py-3 text-sm font-medium">Project</th>}
                          {cols.phaseStart && <th className="px-4 py-3 text-sm font-medium">Phase Start</th>}
                          {cols.phaseEnd && <th className="px-4 py-3 text-sm font-medium">Phase End</th>}
                          {cols.projectDates && <th className="px-4 py-3 text-sm font-medium">Project Timeline</th>}
                          {cols.status && <th className="px-4 py-3 text-sm font-medium">Status</th>}
                          {cols.actions && <th className="px-4 py-3 text-sm font-medium">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-background">
                        {loading ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-6 text-center">
                              Loading...
                            </td>
                          </tr>
                        ) : error ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-red-600">
                              {error}
                            </td>
                          </tr>
                        ) : filtered.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                              No phases found
                            </td>
                          </tr>
                        ) : (
                          filtered.map((phase) => (
                            <tr key={phase.id} className="text-center">
                              {cols.id && <td className="px-4 py-3 text-sm">{phase.id}</td>}
                              {cols.name && <td className="px-4 py-3 text-sm">{phase.name}</td>}
                              {cols.projectName && (
                                <td className="px-4 py-3 text-sm">
                                  <Badge variant="outline">{phase.project?.name}</Badge>
                                </td>
                              )}
                              {cols.phaseStart && (
                                <td className="px-4 py-3 text-sm">{formatDate(phase.startDate)}</td>
                              )}
                              {cols.phaseEnd && (
                                <td className="px-4 py-3 text-sm">{formatDate(phase.endDate)}</td>
                              )}
                              {cols.projectDates && (
                                <td className="px-4 py-3 text-sm">
                                  {formatDate(phase.project?.startDate)} - {formatDate(phase.project?.endDate)}
                                </td>
                              )}
                              {cols.status && (
                                <td className="px-4 py-3 text-sm">
                                  <Badge
                                    variant={
                                      phase.project?.status === "DONE"
                                        ? "default"           
                                        : phase.project?.status === "IN_PROGRESS"
                                        ? "secondary"         
                                        : "outline"          
                                    }
                                  >
                                    {phase.project?.status?.replace("_", " ")}
                                  </Badge>
                                </td>
                              )}
                              {cols.actions && (
                                <td className="px-4 py-3 text-sm">
                                  <div className="flex items-center justify-center gap-2">
                                    <Link
                                      to={`/admin/dashboard/project-phases/view/${phase.id}`}
                                      className="cursor-pointer"
                                    >
                                      <IconEye className="h-4 w-4" />
                                    </Link>
                                    <Link
                                      to={`/admin/dashboard/project-phases/edit/${phase.id}`}
                                      className="cursor-pointer"
                                    >
                                      <IconEdit className="h-4 w-4" />
                                    </Link>
                                    <button
                                      onClick={() => handleDelete(phase.id)}
                                      className="text-red-600 cursor-pointer"
                                    >
                                      <IconTrash className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}