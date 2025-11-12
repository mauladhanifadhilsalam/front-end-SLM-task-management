"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react";

type Owner = {
  id: number;
  name: string;
  company: string;
  email: string;
};

type Phase = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
};

type ProjectStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

type Project = {
  id: number;
  name: string;
  categories: string[];
  ownerId: number;
  owner?: Owner;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  completion: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  phases: Phase[];
};

export default function ViewProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = React.useState<Project | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");

  const API_BASE = import.meta.env.VITE_API_BASE;

  const fetchProject = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/projects/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const d: any = res.data?.data ?? res.data;
      setProject(d);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal memuat data project");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleDelete = async () => {
    if (!project) return;

    const confirm = await Swal.fire({
      title: "Hapus Project?",
      text: `Yakin ingin menghapus project "${project.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/projects/${project.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      await Swal.fire({
        title: "Berhasil",
        text: `Project "${project.name}" berhasil dihapus.`,
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });

      navigate("/admin/dashboard/projects");
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Gagal menghapus project";
      await Swal.fire({ title: "Gagal", text: msg, icon: "error" });
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NOT_STARTED":
        return <Badge variant="outline">Belum Dimulai</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="secondary">Sedang Berjalan</Badge>;
      case "COMPLETED":
        return <Badge variant="success">Selesai</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/dashboard/projects")}
              className="flex items-center gap-2"
            >
              <IconArrowLeft className="h-4 w-4" />
              Kembali
            </Button>

            <div className="ml-auto flex items-center gap-2">
              {project && (
                <Link to={`/admin/dashboard/projects/edit/${project.id}`}>
                  <Button size="sm" variant="outline" className="flex items-center gap-2">
                    <IconEdit className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center gap-2"
              >
                <IconTrash className="h-4 w-4" />
                Hapus
              </Button>
            </div>
          </div>

          <h1 className="text-2xl font-semibold mb-2">Detail Project</h1>
          <p className="text-muted-foreground mb-6">
            Lihat informasi lengkap project yang sedang dikelola.
          </p>

          {loading ? (
            <div className="p-6">Memuat data...</div>
          ) : error ? (
            <div className="p-6 text-red-600">{error}</div>
          ) : !project ? (
            <div className="p-6">Project tidak ditemukan.</div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>
                  Dimiliki oleh {project.owner?.name ?? "-"} (
                  {project.owner?.company ?? "Tidak diketahui"})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">ID</div>
                    <div className="font-medium">{project.id}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    {getStatusBadge(project.status)}
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Progress</div>
                    <div className="font-medium">{project.completion}%</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Kategori</div>
                    <div className="font-medium">
                      {project.categories?.join(", ") || "-"}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Tanggal Mulai</div>
                    <div className="font-medium">{formatDate(project.startDate)}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Tanggal Selesai</div>
                    <div className="font-medium">{formatDate(project.endDate)}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Catatan</div>
                  <div className="font-medium">{project.notes || "-"}</div>
                </div>

                {/* Owner Info */}
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Informasi Pemilik</div>
                  <div className="font-medium">
                    {project.owner?.name} - {project.owner?.company}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {project.owner?.email}
                  </div>
                </div>

                {/* Phases */}
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Fase Proyek
                  </div>
                  <div className="space-y-2">
                    {project.phases?.length ? (
                      project.phases.map((ph) => (
                        <div
                          key={ph.id}
                          className="border rounded-md p-3 flex justify-between items-center"
                        >
                          <div>
                            <div className="font-medium">{ph.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(ph.startDate)} — {formatDate(ph.endDate)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">Belum ada fase.</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
