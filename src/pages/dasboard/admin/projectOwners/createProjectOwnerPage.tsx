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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";


import {
  projectOwnerSchema,
  type ProjectOwnerValues,
  type ProjectOwnerField,
} from "@/schemas/project-owner.schema";


const API_BASE = import.meta.env.VITE_API_BASE
export default function CreateProjectOwnerPage() {
    const navigate = useNavigate();

    const [form, setForm] = React.useState<ProjectOwnerValues>({
        name: "",
        company: "",
        email: "",
        phone: "",
        address: "",
    });

    const [errors, setErrors] = React.useState<
        Partial<Record<ProjectOwnerField, string>>
    >({});

    const [saving, setSaving] = React.useState(false);

    // ---------- VALIDATION HELPERS ----------
    const validateAll = (values: ProjectOwnerValues) => {
        const parsed = projectOwnerSchema.safeParse(values);
        if (parsed.success) return {};
        const next: Partial<Record<ProjectOwnerField, string>> = {};
        for (const issue of parsed.error.issues) {
        const key = issue.path[0] as ProjectOwnerField | undefined;
        if (key && !next[key]) next[key] = issue.message;
        }
        return next;
    };

    const validateField = (name: ProjectOwnerField, value: string) => {
        const single = (projectOwnerSchema as any).pick({ [name]: true });
        const res = single.safeParse({ [name]: value });
        setErrors((prev) => ({
        ...prev,
        [name]: res.success ? undefined : res.error.issues[0]?.message,
        }));
    };
    // ---------------------------------------

    const handleChange = (field: ProjectOwnerField, value: string) => {
        setForm((p) => ({ ...p, [field]: value }));
        if (errors[field]) validateField(field, value); // perbaiki error saat user mengetik
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1) Validasi Zod — tampilkan inline, tanpa Swal
        const nextErrors = validateAll(form);
        setErrors(nextErrors);
        const hasError = Object.values(nextErrors).some(Boolean);
        if (hasError) return;

        // 2) Submit API
        setSaving(true);
        try {
        const token = localStorage.getItem("token");
        const payload = {
            name: form.name.trim(),
            company: form.company.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
        };

        await axios.post(`${API_BASE}/project-owners`, payload, {
            headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        await Swal.fire({
            title: "Berhasil",
            text: "Project owner berhasil dibuat.",
            icon: "success",
            timer: 1300,
            showConfirmButton: false,
        });
        navigate("/admin/dashboard/project-owners");
        } catch (err: any) {
        const msg =
            err?.response?.data?.message || "Gagal membuat owner. Coba lagi.";
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
                        onClick={() =>
                            navigate("/admin/dashboard/project-owners")
                        }
                        className="flex items-center gap-2 cursor-pointer"
                        >
                        <IconArrowLeft className="h-4 w-4 " />
                        Kembali
                        </Button>
                    </div>
                    <h1 className="text-2xl font-semibold">
                        Tambah Project Owner
                    </h1>
                    </div>

                    <div className="px-4 lg:px-6">
                    <Card>
                        <CardHeader>
                        <CardTitle>Informasi Owner</CardTitle>
                        <CardDescription>
                            Isi data owner yang akan ditambahkan.
                        </CardDescription>
                        </CardHeader>
                        <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama *</Label>
                                <Input
                                id="name"
                                value={form.name}
                                onChange={(e) =>
                                    handleChange("name", e.target.value)
                                }
                                onBlur={() => validateField("name", form.name)}
                                placeholder="Nama lengkap"
                                disabled={saving}
                                aria-invalid={!!errors.name}
                                required
                                />
                                {errors.name && (
                                <p className="text-xs text-red-600 mt-1">
                                    {errors.name}
                                </p>
                                )}
                            </div>

                            {/* Company */}
                            <div className="space-y-2">
                                <Label htmlFor="company">Company *</Label>
                                <Input
                                id="company"
                                value={form.company}
                                onChange={(e) =>
                                    handleChange("company", e.target.value)
                                }
                                onBlur={() =>
                                    validateField("company", form.company)
                                }
                                placeholder="Nama perusahaan"
                                disabled={saving}
                                aria-invalid={!!errors.company}
                                required
                                />
                                {errors.company && (
                                <p className="text-xs text-red-600 mt-1">
                                    {errors.company}
                                </p>
                                )}
                            </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(e) =>
                                    handleChange("email", e.target.value)
                                }
                                onBlur={() => validateField("email", form.email)}
                                placeholder="owner@company.id"
                                disabled={saving}
                                aria-invalid={!!errors.email}
                                required
                                />
                                {errors.email && (
                                <p className="text-xs text-red-600 mt-1">
                                    {errors.email}
                                </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <Input
                                id="phone"
                                value={form.phone}
                                onChange={(e) =>
                                    handleChange("phone", e.target.value)
                                }
                                onBlur={() => validateField("phone", form.phone)}
                                placeholder="+62xxxxxxxxx / 08xxxxxxxxx"
                                disabled={saving}
                                aria-invalid={!!errors.phone}
                                required
                                />
                                {errors.phone && (
                                <p className="text-xs text-red-600 mt-1">
                                    {errors.phone}
                                </p>
                                )}
                            </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <Label htmlFor="address">Address *</Label>
                                <Textarea
                                    id="address"
                                    value={form.address}
                                    onChange={(e) =>
                                    handleChange("address", e.target.value)
                                    }
                                    onBlur={() => validateField("address", form.address)}
                                    placeholder="Tulis alamat lengkap di sini"
                                    disabled={saving}
                                    aria-invalid={!!errors.address}
                                    required
                                    className="min-h-[100px] resize-y"
                                />
                                {errors.address && (
                                    <p className="text-xs text-red-600 mt-1">
                                    {errors.address}
                                    </p>
                                )}
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

