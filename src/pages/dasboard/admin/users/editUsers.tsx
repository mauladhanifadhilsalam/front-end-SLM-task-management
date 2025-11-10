import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { z } from "zod";

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


const RoleEnum = ["PROJECT_MANAGER", "DEVELOPER"] as const;
type Role = typeof RoleEnum[number];

const editUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Nama lengkap wajib diisi.")
    .min(3, "Nama minimal 3 karakter."),
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Format email tidak valid."),
  role: z
    .string()
    .min(1, "Role wajib dipilih.")
    .pipe(z.enum(RoleEnum, { message: "Role tidak valid." })),
  password: z
    .union([
      z.literal(""), // izinkan kosong
      z
        .string()
        .min(8, "Password minimal 8 karakter.")
        .regex(/[a-z]/, "Harus mengandung huruf kecil (a–z).")
        .regex(/[A-Z]/, "Harus mengandung huruf besar (A–Z).")
        .regex(
          /[!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~]/,
          "Harus mengandung karakter spesial."
        ),
    ])
    .optional(),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof editUserSchema>, string>>;

export default function EditUsers() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = React.useState<boolean>(true);
    const [saving, setSaving] = React.useState<boolean>(false);

    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

    const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

    const [form, setForm] = React.useState<{
        fullName: string;
        email: string;
        role: Role;
        password?: string; // optional (boleh kosong)
    }>({
        fullName: "",
        email: "",
        role: "DEVELOPER",
        password: "",
    });

    const API_BASE = "http://localhost:3000";

    const normalizeRole = (v: unknown): Role => {
        if (v === "PROJECT_MANAGER" || v === "DEVELOPER") return v;
        return "DEVELOPER";
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
            password: "", // kosong = tidak mengubah
            });
        } catch (e: any) {
            setErrorMsg(e?.response?.data?.message || "Gagal memuat data user.");
        } finally {
            setLoading(false);
        }
        };

        fetchUser();
    }, [id]);

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm((p) => ({ ...p, [field]: value }));
        // bersihkan error field saat user mengetik
        setFieldErrors((fe) => ({ ...fe, [field]: undefined }));
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
            const key = issue.path[0] as keyof FieldErrors;
            if (!fe[key]) fe[key] = issue.message;
        }
        setFieldErrors(fe);
        setSaving(false);
        return;
        }

        // Siapkan payload:
        const payload: any = {
        fullName: parsed.data.fullName.trim(),
        email: parsed.data.email.trim(),
        role: parsed.data.role,
        };
        if (parsed.data.password && parsed.data.password.length > 0) {
        payload.password = parsed.data.password;
        }

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
            text:
            err?.response?.data?.message ||
            "Terjadi kesalahan saat menyimpan perubahan.",
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
                    <p className="text-muted-foreground">
                        Perbarui informasi user di sini.
                    </p>
                    </div>

                    <div className="px-4 lg:px-6">
                    <Card>
                        <CardHeader>
                        <CardTitle>Informasi User</CardTitle>
                        <CardDescription>
                            Ubah data user kemudian simpan.
                        </CardDescription>
                        </CardHeader>
                        <CardContent>
                        {loading ? (
                            <div className="rounded border p-6">Memuat data...</div>
                        ) : (
                            <>
                            {errorMsg && (
                                <div className="rounded border p-4 mb-4 text-sm text-red-600">
                                {errorMsg}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Nama Lengkap *</Label>
                                    <Input
                                    id="fullName"
                                    value={form.fullName}
                                    onChange={(e) => handleChange("fullName", e.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                    disabled={saving}
                                    />
                                    {fieldErrors.fullName && (
                                    <p className="text-xs pl-1 text-red-600">
                                        {fieldErrors.fullName}
                                    </p>
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
                                    />
                                    {fieldErrors.email && (
                                    <p className="text-xs pl-1 text-red-600">
                                        {fieldErrors.email}
                                    </p>
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
                                        <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                                        <SelectItem value="DEVELOPER">Developer</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    {fieldErrors.role && (
                                    <p className="text-xs pl-1 text-red-600">
                                        {fieldErrors.role}
                                    </p>
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
                                    />
                                    {fieldErrors.password && (
                                    <p className="text-xs pl-1 text-red-600">
                                        {fieldErrors.password}
                                    </p>
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
                            </>
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