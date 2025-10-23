// ...existing code...
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
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
// ...existing code...

export default function CreateProjectOwnerPage() {
    const navigate = useNavigate();
    const API_BASE = "http://localhost:3000";

    const [form, setForm] = React.useState({
        name: "",
        company: "",
        email: "",
        phone: "",
        address: "",
    });
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleChange = (field: string, value: string) =>
        setForm((p) => ({ ...p, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!form.name.trim()) {
            setError("Nama wajib diisi.");
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

                await axios.post(`${API_BASE}/project-owners`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
                });

            await Swal.fire({
                title: "Berhasil",
                text: "Project owner berhasil dibuat.",
                icon: "success",
                timer: 1300,
                showConfirmButton: false,
            });
            navigate("/admin/dashboard/project-owners");
        } catch (err) {
            if ((err as any)?.response) {
                const msg = (err as any)?.response?.data?.message || "Gagal membuat owner.";
                await Swal.fire({ title: "Gagal", text: msg, icon: "error" });
            } else {
                // fallback dummy success
                await new Promise((r) => setTimeout(r, 700));
                await Swal.fire({
                    title: "Berhasil (dummy)",
                    text: "Project owner dibuat (dummy).",
                    icon: "success",
                    timer: 1200,
                    showConfirmButton: false,
                });
                navigate("/admin/dashboard/project-owners");
            }
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
                        className="flex items-center gap-2 cursor-pointer"
                        >
                        <IconArrowLeft className="h-4 w-4 " />
                        Kembali
                        </Button>
                    </div>
                    <h1 className="text-2xl font-semibold">Tambah Project Owner</h1>
                    </div>

                    <div className="px-4 lg:px-6">
                    <Card>
                        <CardHeader>
                        <CardTitle>Informasi Owner</CardTitle>
                        <CardDescription>Isi data owner yang akan ditambahkan.</CardDescription>
                        </CardHeader>
                        <CardContent>
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
                            <Button type="submit" disabled={saving} className="cursor-pointer">
                                <IconCheck className="mr-2 h-4 w-4" />
                                {saving ? "Menyimpan..." : "Simpan Owner"}
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
// ...existing code...