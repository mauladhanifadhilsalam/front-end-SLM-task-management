
import * as React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
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
import { Badge } from "@/components/ui/badge";
import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react";

type Owner = {
  id: number;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  createdAt?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE
export default function ViewProjectOwnerPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();


    const [owner, setOwner] = React.useState<Owner | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [deleting, setDeleting] = React.useState(false);

    React.useEffect(() => {
        if (!id) return;
        const fetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_BASE}/project-owners/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            const d: any = res.data?.data ?? res.data;
            setOwner({
            id: Number(d.id),
            name: d.name ?? "",
            company: d.company ?? null,
            email: d.email ?? null,
            phone: d.phone ?? null,
            address: d.address ?? null,
            createdAt: d.createdAt ?? d.created_at ?? null,
            });
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Gagal memuat data project owner.";
            setError(msg);
        } finally {
            setLoading(false);
        }
        };

        fetch();
    }, [id]);

    const formatDate = (iso?: string) => {
        if (!iso) return "-";
        try {
        return new Date(iso).toLocaleString("id-ID");
        } catch {
        return iso;
        }
    };

    const handleDelete = async () => {
        if (!owner) return;
        const confirm = await Swal.fire({
        title: "Hapus project owner?",
        text: `Yakin ingin menghapus "${owner.name}"? Tindakan ini tidak dapat dikembalikan.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, hapus",
        cancelButtonText: "Batal",
        reverseButtons: true,
        });
        if (!confirm.isConfirmed) return;

        setDeleting(true);
        try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE}/project-owners/${owner.id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        await Swal.fire({
            title: "Terhapus",
            text: "Owner berhasil dihapus.",
            icon: "success",
            timer: 1200,
            showConfirmButton: false,
        });
        navigate("/admin/dashboard/project-owners");
        } catch (err: any) {
        const msg = err?.response?.data?.message || "Gagal menghapus owner.";
        await Swal.fire({ title: "Gagal", text: msg, icon: "error" });
        setDeleting(false);
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
                        <IconArrowLeft className="h-4 w-4" />
                        Kembali
                        </Button>

                        <div className="ml-auto flex items-center gap-2">
                        {owner && (
                            <Link to={`/admin/dashboard/project-owners/edit/${owner.id}`}>
                            <Button size="sm" variant="outline" className="flex items-center gap-2 cursor-pointer">
                                <IconEdit className="h-4 w-4" />
                                Edit
                            </Button>
                            </Link>
                        )}
                        <Button size="sm" variant="destructive" onClick={handleDelete} className="flex items-center gap-2 cursor-pointer" disabled={deleting}>
                            <IconTrash className="h-4 w-4" />
                            {deleting ? "Menghapus..." : "Delete"}
                        </Button>
                        </div>
                    </div>

                    <h1 className="text-2xl font-semibold">Detail Project Owner</h1>
                    <p className="text-muted-foreground">Lihat informasi lengkap pemilik proyek.</p>
                    </div>

                    <div className="px-4 lg:px-6">
                    {loading ? (
                        <Card>
                        <CardContent>
                            <div className="animate-pulse space-y-3">
                            <div className="h-6 w-48 bg-muted/30 rounded" />
                            <div className="h-4 w-full bg-muted/30 rounded" />
                            <div className="h-4 w-full bg-muted/30 rounded" />
                            </div>
                        </CardContent>
                        </Card>
                    ) : error ? (
                        <div className="rounded border p-6 text-red-600">{error}</div>
                    ) : !owner ? (
                        <div className="rounded border p-6">Owner tidak ditemukan.</div>
                    ) : (
                        <Card>
                        <CardHeader>
                            <CardTitle>{owner.name}</CardTitle>
                            <CardDescription>Informasi kontak dan meta</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-muted-foreground">ID</div>
                                <div className="font-medium">{owner.id}</div>
                            </div>

                            <div>
                                <div className="text-sm text-muted-foreground">Company</div>
                                <div className="font-medium">{owner.company || "-"}</div>
                            </div>

                            <div>
                                <div className="text-sm text-muted-foreground">Email</div>
                                <div className="font-medium">{owner.email || "-"}</div>
                            </div>

                            <div>
                                <div className="text-sm text-muted-foreground">Phone</div>
                                <div className="font-medium">{owner.phone || "-"}</div>
                            </div>

                            <div className="md:col-span-2">
                                <div className="text-sm text-muted-foreground">Address</div>
                                <div className="font-medium">{owner.address || "-"}</div>
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
