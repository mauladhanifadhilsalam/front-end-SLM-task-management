// src/pages/admin/EditUsers.tsx
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


import {
  editUserSchema,
  type EditUserValues,
  type EditUserField,
  RoleEnum,
  toEditPayload,
} from "@/schemas/users.schema";

type FieldErrors = Partial<Record<EditUserField, string>>;

const API_BASE = import.meta.env.VITE_API_BASE

export default function EditUsers() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = React.useState<boolean>(true);
    const [saving, setSaving] = React.useState<boolean>(false);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

    const [form, setForm] = React.useState<EditUserValues>({
        fullName: "",
        email: "",
        role: RoleEnum.enum.DEVELOPER,
        password: "", 
    });

    

    
    const normalizeRole = (v: unknown): EditUserValues["role"] => {
        return v === RoleEnum.enum.PROJECT_MANAGER || v === RoleEnum.enum.DEVELOPER
        ? v
        : RoleEnum.enum.DEVELOPER;
    };

    React.useEffect(() => {
        const fetchUser = async () => {
        if (!id) return;
        setLoading(true);
        setErrorMsg(null);
        setFieldErrors({});
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_BASE}/users/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            const d: any = res.data?.data ?? res.data;

            setForm({
            fullName: d.fullName ?? d.name ?? d.full_name ?? "",
            email: d.email ?? "",
            role: normalizeRole(d.role ?? d.user_role),
            password: "", 
            });
        } catch (e: any) {
            setErrorMsg(e?.response?.data?.message || "Gagal memuat data user.");
        } finally {
            setLoading(false);
        }
        };

        fetchUser();
    }, [id]);

    const handleChange = (field: EditUserField, value: string) => {
        setForm((p) => ({ ...p, [field]: value as any }));

        if (fieldErrors[field]) {
        const single = (editUserSchema as any).pick({ [field]: true });
        const res = single.safeParse({ [field]: value });
        setFieldErrors((prev) => ({
            ...prev,
            [field]: res.success ? undefined : res.error.issues[0]?.message,
        }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setSaving(true);
        setErrorMsg(null);
        setFieldErrors({});
        const parsed = editUserSchema.safeParse(form);
        if (!parsed.success) {
        const fe: FieldErrors = {};
        for (const issue of parsed.error.issues) {
            const key = issue.path[0] as EditUserField;
            if (!fe[key]) fe[key] = issue.message;
        }
        setFieldErrors(fe);
        setSaving(false);
        return;
        }

    
        const payload = toEditPayload(parsed.data);

        try {
        const token = localStorage.getItem("token");
        await axios.patch(`${API_BASE}/users/${id}`, payload, {
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
            const zodFmt = err.response.data;
            const fe: FieldErrors = {};
            if (zodFmt?.fullName?._errors?.[0]) fe.fullName = zodFmt.fullName._errors[0];
            if (zodFmt?.email?._errors?.[0]) fe.email = zodFmt.email._errors[0];
            if (zodFmt?.role?._errors?.[0]) fe.role = zodFmt.role._errors[0];
            if (zodFmt?.password?._errors?.[0]) fe.password = zodFmt.password._errors[0];

            if (Object.keys(fe).length > 0) {
            setFieldErrors(fe);
            } else {
            setErrorMsg(
                zodFmt?._errors?.[0] || err?.response?.data?.message || "Data tidak valid."
            );
            }
        } else {
            setErrorMsg(err?.response?.data?.message || "Gagal menyimpan perubahan.");
        }

        await Swal.fire({
            title: "Gagal",
            text: err?.response?.data?.message || "Terjadi kesalahan saat menyimpan perubahan.",
            icon: "error",
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
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            {errorMsg && (
                                <div className="rounded border p-4 mb-4 text-sm text-red-600">
                                {errorMsg}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                <Label htmlFor="fullName">Nama Lengkap *</Label>
                                <Input
                                    id="fullName"
                                    value={form.fullName}
                                    onChange={(e) => handleChange("fullName", e.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                    disabled={saving}
                                    aria-invalid={!!fieldErrors.fullName}
                                    required
                                />
                                {fieldErrors.fullName && (
                                    <p className="text-xs pl-1 text-red-600">{fieldErrors.fullName}</p>
                                )}
                                </div>

                                <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    placeholder="user@example.com"
                                    disabled={saving}
                                    aria-invalid={!!fieldErrors.email}
                                    required
                                />
                                {fieldErrors.email && (
                                    <p className="text-xs pl-1 text-red-600">{fieldErrors.email}</p>
                                )}
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
                                    <SelectItem value={RoleEnum.enum.PROJECT_MANAGER}>
                                        Project Manager
                                    </SelectItem>
                                    <SelectItem value={RoleEnum.enum.DEVELOPER}>
                                        Developer
                                    </SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldErrors.role && (
                                    <p className="text-xs pl-1 text-red-600">{fieldErrors.role}</p>
                                )}
                                </div>

                                <div className="space-y-2">
                                <Label htmlFor="password">
                                    Password (kosongkan jika tidak ingin mengubah)
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={form.password ?? ""}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                    placeholder="Masukkan password baru"
                                    disabled={saving}
                                    aria-invalid={!!fieldErrors.password}
                                />
                                {fieldErrors.password && (
                                    <p className="text-xs pl-1 text-red-600">{fieldErrors.password}</p>
                                )}
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