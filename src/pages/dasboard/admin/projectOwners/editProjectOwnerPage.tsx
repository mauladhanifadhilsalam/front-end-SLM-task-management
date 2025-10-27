// ...existing code...
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
// ...existing code...

type Owner = {
  id: number;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  createdAt?: string;
};

export default function EditProjectOwnerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const API_BASE = "http://localhost:3000";

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleChange = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  React.useEffect(() => {
    if (!id) return;
    let mounted = true;
    const fetchOwner = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/project-owners/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const d: any = res.data?.data ?? res.data;
        if (!mounted) return;
        setForm({
          name: d.name ?? "",
          company: d.company ?? "",
          email: d.email ?? "",
          phone: d.phone ?? "",
          address: d.address ?? "",
        });
      } catch (err: any) {
        const msg = err?.response?.data?.message || "Gagal memuat data owner.";
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchOwner();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("Nama wajib diisi.");
      return;
    }
    if (!id) {
      setError("ID owner tidak tersedia.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: form.name.trim(),
        company: form.company.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
      };

      // gunakan PATCH sesuai permintaan
      await axios.patch(`${API_BASE}/project-owners/${id}`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      await Swal.fire({
        title: "Berhasil",
        text: "Perubahan owner berhasil disimpan.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });
      navigate("/admin/dashboard/project-owners");
    } catch (err: any) {
      const resp = err?.response?.data;
      const msg =
        resp?.message ||
        (typeof resp === "object" ? JSON.stringify(resp) : "Gagal menyimpan perubahan.");
      setError(msg);
      await Swal.fire({ title: "Gagal", text: msg, icon: "error" });
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
                        onClick={() => navigate("/admin/dashboard/project-owners")}
                        className="flex items-center gap-2"
                        >
                        <IconArrowLeft className="h-4 w-4" />
                        Kembali
                        </Button>
                    </div>
                    <h1 className="text-2xl font-semibold">Edit Project Owner</h1>
                    <p className="text-muted-foreground">Perbarui data owner.</p>
                    </div>

                    <div className="px-4 lg:px-6">
                    <Card>
                        <CardHeader>
                        <CardTitle>Informasi Owner</CardTitle>
                        <CardDescription>Ubah data dan simpan perubahan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        {loading ? (
                            <div className="rounded border p-6">Memuat data...</div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                            {error && <div className="text-sm text-red-600">{error}</div>}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                <Label htmlFor="name">Nama *</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    placeholder="Nama lengkap"
                                    required
                                    disabled={saving}
                                />
                                </div>

                                <div className="space-y-2">
                                <Label htmlFor="company">Company</Label>
                                <Input
                                    id="company"
                                    value={form.company}
                                    onChange={(e) => handleChange("company", e.target.value)}
                                    placeholder="Nama perusahaan (opsional)"
                                    disabled={saving}
                                />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    placeholder="owner@company.id (opsional)"
                                    disabled={saving}
                                />
                                </div>

                                <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={form.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    placeholder="+62xxxxxxxxx (opsional)"
                                    disabled={saving}
                                />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                id="address"
                                value={form.address}
                                onChange={(e) => handleChange("address", e.target.value)}
                                placeholder="Alamat (opsional)"
                                disabled={saving}
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Button type="button" variant="outline" onClick={() => navigate("/admin/dashboard/project-owners")} disabled={saving}>
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
                </div>
                </div>
            </div>
            </SidebarInset>
        </SidebarProvider>
        </div>
    );
}