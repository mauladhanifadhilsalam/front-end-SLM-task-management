import * as React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
import { Badge } from "@/components/ui/badge";
import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react";

type ProjectStatus = "NOT_STARTED" | "IN_PROGRESS" | "DONE" | "ON_HOLD" ;

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

export default function ViewProjectPhases() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  

  const [phase, setPhase] = React.useState<Phase | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const fetchPhase = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/project-phases/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setPhase(res.data?.data ?? res.data);
       } catch (err: any) {
        const msg = err?.response?.data?.message || "Failed to load phase details";
        setError(msg);
        toast.error("Failed to load phase details", {
          description: msg,
        });
      } finally {
        setLoading(false);
      }

    };

    fetchPhase();
  }, [id]);

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

      const handleConfirmDelete = async () => {
      if (!phase) return;

      setDeleting(true);
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE}/project-phases/${phase.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        toast.success("Phase deleted", {
          description: `Phase "${phase.name}" has been deleted successfully.`,
        });

        navigate("/admin/dashboard/project-phases");
      } catch (err: any) {
        const msg = err?.response?.data?.message || "Failed to delete phase";
        toast.error("Failed to delete phase", {
          description: msg,
        });
        setDeleting(false);
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

                    {phase && (
                      <div className="ml-auto flex items-center gap-2">
                        <Link to={`/admin/dashboard/project-phases/${phase.id}/edit`}>
                          <Button size="sm" variant="outline" className="flex items-center gap-2">
                            <IconEdit className="h-4 w-4" />
                            Edit
                          </Button>
                        </Link>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deleting}
                              className="flex items-center gap-2"
                            >
                              <IconTrash className="h-4 w-4" />
                              {deleting ? "Deleting..." : "Delete"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete project phase?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {phase
                                  ? `Are you sure you want to delete "${phase.name}"? This action cannot be undone.`
                                  : "Are you sure you want to delete this phase? This action cannot be undone."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={deleting}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deleting ? "Deleting..." : "Yes, delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}

                  </div>

                  <h1 className="text-2xl font-semibold">Project Phase Details</h1>
                  <p className="text-muted-foreground">View phase information and timeline</p>
                </div>

                <div className="px-4 lg:px-6">
                  {loading ? (
                    <Card>
                      <CardContent className="p-6">
                        <div className="animate-pulse space-y-3">
                          <div className="h-6 w-48 bg-muted/30 rounded" />
                          <div className="h-4 w-full bg-muted/30 rounded" />
                          <div className="h-4 w-full bg-muted/30 rounded" />
                        </div>
                      </CardContent>
                    </Card>
                  ) : error ? (
                    <div className="rounded border p-6 text-red-600">{error}</div>
                  ) : !phase ? (
                    <div className="rounded border p-6">Phase not found</div>
                  ) : (
                    <div className="grid gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>{phase.name}</CardTitle>
                          <CardDescription>Phase Information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Phase ID</div>
                              <div className="font-medium">{phase.id}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Project</div>
                              <div className="font-medium">
                                <Badge variant="outline">{phase.project?.name}</Badge>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Timeline</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm">Start Date</div>
                                <div className="font-medium">{formatDate(phase.startDate)}</div>
                              </div>
                              <div>
                                <div className="text-sm">End Date</div>
                                <div className="font-medium">{formatDate(phase.endDate)}</div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Project Timeline</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm">Project Start</div>
                                <div className="font-medium">{formatDate(phase.project?.startDate)}</div>
                              </div>
                              <div>
                                <div className="text-sm">Project End</div>
                                <div className="font-medium">{formatDate(phase.project?.endDate)}</div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Status</div>
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
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Created At</div>
                              <div className="font-medium">{formatDate(phase.createdAt)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Last Updated</div>
                              <div className="font-medium">{formatDate(phase.updatedAt)}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}