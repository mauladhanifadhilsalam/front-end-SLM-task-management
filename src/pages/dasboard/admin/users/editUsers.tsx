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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";

type Role = "admin" | "project_manager" | "developer";
type User = {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  createdAt?: string;
};

export default function EditUsers() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState<boolean>(true);
    const [saving, setSaving] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string>("");
    const [form, setForm] = React.useState({
        fullName: "",
        email: "",
        role: "developer" as Role,
        password: "",
    });

    const API_BASE = "http://localhost:3000";

    React.useEffect(() => {
        const fetchUser = async () => {
        if (!id) return;
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_BASE}/users/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            const d: any = res.data?.data ?? res.data;
            setForm({
            fullName: d.fullName ?? d.name ?? d.full_name ?? "",
            email: d.email ?? "",
            role: (d.role as Role) ?? (d.user_role as Role) ?? "developer",
            password: "",
            });
        } catch (e: any) {
            setError(e?.response?.data?.message || "Gagal memuat data user");
        } finally {
            setLoading(false);
        }
        };

        fetchUser();
    }, [id]);

    const handleChange = (field: string, value: string) =>
        setForm((p) => ({ ...p, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSaving(true);
        setError("");
        try {
        const token = localStorage.getItem("token");
        const payload: any = {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            role: form.role,
        };
        // hanya sertakan password jika diisi
        if (form.password && form.password.trim().length > 0) {
            payload.password = form.password;
        }

        const res = await axios.put(`${API_BASE}/users/${id}`, payload, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        await Swal.fire({
            title: "Berhasil",
            text: "Perubahan user berhasil disimpan.",
            icon: "success",
            timer: 1400,
            showConfirmButton: false,
        });

        navigate("/admin/dashboard/users");
        } catch (err: any) {
        if (err?.response?.status === 400 && err.response.data) {
            // contoh format validasi zod
            const z = err.response.data;
            const first =
            z?.fullName?._errors?.[0] ||
            z?.email?._errors?.[0] ||
            z?.password?._errors?.[0] ||
            z?._errors?.[0];
            setError(first || "Data tidak valid.");
        } else {
            setError(err?.response?.data?.message || "Gagal menyimpan perubahan.");
        }
        await Swal.fire({ title: "Gagal", text: error || "Terjadi kesalahan", icon: "error" });
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
                        onClick={() => navigate("/admin/dashboard/users")}
                        className="flex items-center gap-2"
                        >
                        <IconArrowLeft className="h-4 w-4" />
                        Kembali
                        </Button>
                    </div>

                    <h1 className="text-2xl font-semibold">Edit User</h1>
                    <p className="text-muted-foreground">Perbarui informasi user di sini.</p>
                    </div>

                    <div className="px-4 lg:px-6">
                    <Card>
                        <CardHeader>
                        <CardTitle>Informasi User</CardTitle>
                        <CardDescription>Ubah data user kemudian simpan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        {loading ? (
                            <div className="rounded border p-6">Memuat data...</div>
                        ) : error ? (
                            <div className="rounded border p-4 mb-4 text-sm text-red-600">{error}</div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                <Label htmlFor="fullName">Nama Lengkap *</Label>
                                <Input
                                    id="fullName"
                                    value={form.fullName}
                                    onChange={(e) => handleChange("fullName", e.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                    required
                                    disabled={saving}
                                />
                                </div>

                                <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    placeholder="user@example.com"
                                    required
                                    disabled={saving}
                                />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <Select
                                    value={form.role}
                                    onValueChange={(v) => handleChange("role", v)}
                                    disabled={saving}
                                >
                                    <SelectTrigger>
                                    <SelectValue placeholder="Pilih role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                    <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                                    <SelectItem value="DEVELOPER">Developer</SelectItem>
                                    </SelectContent>
                                </Select>
                                </div>

                                <div className="space-y-2">
                                <Label htmlFor="password">Password (kosongkan jika tidak ingin mengubah)</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                    placeholder="Masukkan password baru"
                                    disabled={saving}
                                />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/admin/dashboard/users")}
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
                </div>
                </div>
            </div>
            </SidebarInset>
        </SidebarProvider>
        </div>
    );
}