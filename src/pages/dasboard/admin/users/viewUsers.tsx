
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react";

type Role = "admin" | "project_manager" | "developer";
type User = {
    id: number;
    fullName: string;
    email: string;
    role: Role;
    createdAt: string;
};

export default function ViewUser() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string>("");

    const API_BASE = "http://localhost:3000";

    const fetchUser = React.useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError("");
        try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/users/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const d: any = res.data?.data ?? res.data;
        const normalized: User = {
            id: Number(d.id),
            fullName: d.fullName ?? d.name ?? d.full_name ?? "",
            email: d.email ?? "",
            role: (d.role as Role) ?? (d.user_role as Role) ?? "developer",
            createdAt: d.createdAt ?? d.created_at ?? new Date().toISOString(),
        };
        setUser(normalized);
        } catch (e: any) {
        setError(e?.response?.data?.message || "Gagal memuat data user");
        } finally {
        setLoading(false);
        }
    }, [id]);

    React.useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleDelete = async () => {
        if (!user) return;
        const confirm = await Swal.fire({
        title: "Hapus user?",
        text: `Yakin ingin menghapus user "${user.fullName}"? Tindakan ini tidak dapat dikembalikan.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, hapus",
        cancelButtonText: "Batal",
        reverseButtons: true,
        });
        if (!confirm.isConfirmed) return;

        try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE}/users/${user.id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        await Swal.fire({
            title: "Terhapus",
            text: `User "${user.fullName}" berhasil dihapus.`,
            icon: "success",
            timer: 1400,
            showConfirmButton: false,
        });
        navigate("/admin/dashboard/users");
        } catch (e: any) {
        const msg = e?.response?.data?.message || "Gagal menghapus user";
        await Swal.fire({ title: "Gagal", text: msg, icon: "error" });
        }
    };

    const formatDate = (iso?: string) => {
        if (!iso) return "-";
        try {
        return new Date(iso).toLocaleString("id-ID");
        } catch {
        return iso;
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
                        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dashboard/users")} className="flex items-center gap-2">
                        <IconArrowLeft className="h-4 w-4" />
                        Kembali
                        </Button>
                        <div className="ml-auto flex items-center gap-2">
                        {user && (
                            <Link to={`/admin/dashboard/users/edit/${user.id}`}>
                            <Button size="sm" variant="outline" className="flex items-center gap-2">
                                <IconEdit className="h-4 w-4" />
                                Edit
                            </Button>
                            </Link>
                        )}
                        <Button size="sm" variant="destructive" onClick={handleDelete} className="flex items-center gap-2">
                            <IconTrash className="h-4 w-4" />
                            Delete
                        </Button>
                        </div>
                    </div>

                    <h1 className="text-2xl font-semibold">Detail User</h1>
                    <p className="text-muted-foreground">Lihat informasi lengkap user.</p>
                    </div>

                    <div className="px-4 lg:px-6">
                    {loading ? (
                        <Card>
                        <CardContent>
                            <div className="animate-pulse space-y-4">
                            <div className="h-6 w-1/3 bg-muted/30 rounded" />
                            <div className="h-4 w-full bg-muted/30 rounded" />
                            <div className="h-4 w-full bg-muted/30 rounded" />
                            </div>
                        </CardContent>
                        </Card>
                    ) : error ? (
                        <div className="rounded border p-6 text-red-600">{error}</div>
                    ) : !user ? (
                        <div className="rounded border p-6">User tidak ditemukan.</div>
                    ) : (
                        <Card>
                        <CardHeader>
                            <CardTitle>{user.fullName || "-"}</CardTitle>
                            <CardDescription>Informasi akun dan meta</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-muted-foreground">ID</div>
                                <div className="font-medium">{user.id}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Role</div>
                                <div className="mt-1">
                                <Badge className="capitalize">{user.role.replace("_", " ")}</Badge>
                                </div>
                            </div>

                            <div>
                                <div className="text-sm text-muted-foreground">Email</div>
                                <div className="font-medium">{user.email}</div>
                            </div>

                            <div>
                                <div className="text-sm text-muted-foreground">Dibuat</div>
                                <div className="font-medium">{formatDate(user.createdAt)}</div>
                            </div>
                            </div>
                        </CardContent>
                        </Card>
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
