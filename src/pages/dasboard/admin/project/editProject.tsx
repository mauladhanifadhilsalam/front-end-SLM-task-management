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
import { Textarea } from "@/components/ui/textarea";
import { IconArrowLeft, IconCheck, IconPlus, IconTrash } from "@tabler/icons-react";

export default function EditProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const [form, setForm] = React.useState({
    name: "",
    category: "",
    client: "",
    startDate: "",
    endDate: "",
    responsible: "",
    description: "",
  });

  const [phases, setPhases] = React.useState<
    { id?: number; name: string; startDate: string; endDate: string }[]
  >([]);

  const API_BASE = "http://localhost:3000";

  // 🔹 Fetch project data by ID
  React.useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/projects/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const d = res.data?.data ?? res.data;

        setForm({
          name: d.name ?? "",
          category: d.categories?.[0] ?? "",
          client: d.owner?.company ?? "",
          startDate: d.startDate?.slice(0, 10) ?? "",
          endDate: d.endDate?.slice(0, 10) ?? "",
          responsible: d.owner?.name ?? "",
          description: d.notes ?? "",
        });

        setPhases(
          (d.phases || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            startDate: p.startDate?.slice(0, 10) || "",
            endDate: p.endDate?.slice(0, 10) || "",
          }))
        );
      } catch (err: any) {
        setError(err?.response?.data?.message || "Gagal memuat data project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // 🔹 Handle input changes
  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handlePhaseChange = (
    index: number,
    field: keyof (typeof phases)[number],
    value: string
  ) => {
    setPhases((prev) =>
      prev.map((phase, i) => (i === index ? { ...phase, [field]: value } : phase))
    );
  };

  const handleAddPhase = () =>
    setPhases((prev) => [...prev, { name: "", startDate: "", endDate: "" }]);

  const handleRemovePhase = (index: number) =>
    setPhases((prev) => prev.filter((_, i) => i !== index));

  // 🔹 Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    // 🔸 Validasi tanggal project
    if (form.startDate && form.endDate) {
      if (new Date(form.endDate) <= new Date(form.startDate)) {
        Swal.fire({
          title: "Tanggal tidak valid",
          text: "Tanggal selesai harus setelah tanggal mulai.",
          icon: "warning",
        });
        return;
      }
    }

    // 🔸 Validasi tanggal phases
    for (const phase of phases) {
      if (
        phase.startDate &&
        phase.endDate &&
        new Date(phase.endDate) <= new Date(phase.startDate)
      ) {
        Swal.fire({
          title: "Tanggal Phase Tidak Valid",
          text: `Tanggal selesai phase "${phase.name || "Tanpa Nama"}" harus setelah tanggal mulai.`,
          icon: "warning",
        });
        return;
      }
    }

    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: form.name.trim(),
        categories: [form.category],
        startDate: form.startDate,
        endDate: form.endDate,
        notes: form.description.trim(),
        phases: phases.map((p) => ({
          id: p.id,
          name: p.name,
          startDate: p.startDate,
          endDate: p.endDate,
        })),
      };

      await axios.put(`${API_BASE}/projects/${id}`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      await Swal.fire({
        title: "Berhasil",
        text: "Perubahan project dan phases berhasil disimpan.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/admin/dashboard/projects");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal menyimpan perubahan.");
      await Swal.fire({
        title: "Gagal",
        text: err?.response?.data?.message || "Terjadi kesalahan.",
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
              onClick={() => navigate("/admin/dashboard/projects")}
              className="flex items-center gap-2"
            >
              <IconArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </div>

          <h1 className="text-2xl font-semibold">Edit Project</h1>
          <p className="text-muted-foreground mb-6">
            Ubah informasi project dan phases di sini.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Project</CardTitle>
              <CardDescription>
                Ubah data project dan phases lalu simpan perubahan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="rounded border p-6">Memuat data...</div>
              ) : error ? (
                <div className="rounded border p-4 mb-4 text-sm text-red-600">
                  {error}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Project Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Nama Project *</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Kategori *</Label>
                      <Input
                        value={form.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                        placeholder="Contoh: Web / Mobile / Commerce"
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Client *</Label>
                      <Input value={form.client} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label>Penanggung Jawab *</Label>
                      <Input value={form.responsible} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => handleChange("startDate", e.target.value)}
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        min={form.startDate || undefined}
                        value={form.endDate}
                        onChange={(e) => handleChange("endDate", e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label>Catatan / Deskripsi</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Catatan atau deskripsi project..."
                      disabled={saving}
                    />
                  </div>

                  {/* Phases Section */}
                  <div className="space-y-4 mt-8">
                    <div className="flex justify-between items-center">
                      <Label className="text-lg font-medium">Phases</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddPhase}
                        disabled={saving}
                        className="flex items-center gap-2"
                      >
                        <IconPlus className="h-4 w-4" /> Tambah Phase
                      </Button>
                    </div>

                    {phases.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Belum ada phase. Tambahkan phase baru.
                      </p>
                    )}

                    <div className="space-y-4">
                      {phases.map((phase, i) => (
                        <div
                          key={i}
                          className="border rounded-md p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
                        >
                          <div className="space-y-1 md:col-span-2">
                            <Label>Nama Phase</Label>
                            <Input
                              value={phase.name}
                              onChange={(e) => handlePhaseChange(i, "name", e.target.value)}
                              placeholder="Contoh: Blueprint / Interface"
                              disabled={saving}
                            />
                          </div>

                          <div className="space-y-1">
                            <Label>Mulai</Label>
                            <Input
                              type="date"
                              value={phase.startDate}
                              onChange={(e) =>
                                handlePhaseChange(i, "startDate", e.target.value)
                              }
                              disabled={saving}
                            />
                          </div>

                          <div className="space-y-1 relative">
                            <Label>Selesai</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="date"
                                min={phase.startDate || undefined}
                                value={phase.endDate}
                                onChange={(e) =>
                                  handlePhaseChange(i, "endDate", e.target.value)
                                }
                                disabled={saving}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => handleRemovePhase(i)}
                                disabled={saving}
                              >
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/admin/dashboard/projects")}
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
