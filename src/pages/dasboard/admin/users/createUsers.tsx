import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { z } from "zod"; 
import Swal from "sweetalert2";


const RoleEnum = z.enum(["PROJECT_MANAGER", "DEVELOPER"] as const);

const userSchema = z.object({
  fullName: z.string().trim().min(1, "Nama lengkap wajib diisi.").min(3, "Nama minimal 3 karakter."),
  email: z.string().trim().min(1, "Email wajib diisi.").email("Format email tidak valid."),
    role: z
    .string()
    .min(1,"Role wajib dipilih.")
    .pipe(RoleEnum),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter.")
    .regex(/[a-z]/, "Harus mengandung huruf kecil (a–z).")
    .regex(/[A-Z]/, "Harus mengandung huruf besar (A–Z).")
    .regex(/[!@#$%^&*()_\-+=[\]{};:'\",.<>/?\\|`~]/, "Harus mengandung karakter spesial."),
});

export default function CreateUserPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

    const [formData, setFormData] = React.useState({
        fullName: "",
        email: "",
        role: "PROJECT_MANAGER",
        password: "",
    });


    const [fieldErrors, setFieldErrors] = React.useState<Record<string, string | null>>({});

    const API_BASE = "http://localhost:3000";

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setLoading(true);
            setErrorMsg(null);
            setSuccessMsg(null);
            setFieldErrors({});

            const parsed = userSchema.safeParse(formData);
            if (!parsed.success) {
                const newErrors: Record<string, string> = {};
                parsed.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
                });
                setFieldErrors(newErrors);
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem("token") || "";
                const res = await axios.post(`${API_BASE}/users`, parsed.data, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });

                const createdUser = res.data;

                await Swal.fire({
                title: "Berhasil",
                text: `User "${createdUser.fullName}" berhasil dibuat.`,
                icon: "success",
                timer: 1400,
                showConfirmButton: false,
                });

                navigate("/admin/dashboard/users");
            } catch (err: any) {
                if (err?.response?.status === 400 && err.response.data) {
                const zodFmt = err.response.data;
                const firstIssue =
                    zodFmt?.fullName?._errors?.[0] ||
                    zodFmt?.email?._errors?.[0] ||
                    zodFmt?.role?._errors?.[0] ||
                    zodFmt?.password?._errors?.[0] ||
                    zodFmt?._errors?.[0];
                setErrorMsg(firstIssue || "Data tidak valid.");
                } else if (err?.response?.status === 409) {
                setErrorMsg(err.response.data?.message || "Email sudah digunakan.");
                } else {
                setErrorMsg(err?.response?.data?.message || "Gagal membuat user.");
                }

                await Swal.fire({
                title: "Gagal",
                text: err?.response?.data?.message || "Terjadi kesalahan saat membuat user.",
                icon: "error",
                });
            } finally {
                setLoading(false);
            }
            }

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
                    <h1 className="text-2xl font-semibold">Tambah User Baru</h1>
                    <p className="text-muted-foreground">Buat user baru di sini.</p>
                    </div>

                    <div className="px-4 lg:px-6">
                    <Card>
                        <CardHeader>
                        <CardTitle>Informasi User</CardTitle>
                        <CardDescription>Isi informasi user yang diperlukan.</CardDescription>
                        </CardHeader>

                        <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Nama Lengkap *</Label>
                                <Input
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange("fullName", e.target.value)}
                                placeholder="Masukkan nama lengkap"
                                disabled={loading}
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
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                placeholder="user@example.com"
                                disabled={loading}
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
                                value={formData.role}
                                onValueChange={(value) => handleInputChange("role", value)}
                                disabled={loading}
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
                                <p className="text-xs pl-1 text-red-600">{fieldErrors.role}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                                placeholder="Masukkan password"
                                disabled={loading}
                                />
                                {fieldErrors.password && (
                                <p className="text-xs text-red-600">{fieldErrors.password}</p>
                                )}
                            </div>
                            </div>

                            <div className="flex justify-end gap-3">
                            <Button type="submit" disabled={loading}>
                                <IconCheck className="mr-2 h-4 w-4" />
                                {loading ? "Menyimpan..." : "Simpan User"}
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
