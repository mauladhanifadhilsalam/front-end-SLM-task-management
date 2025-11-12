"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "PENDING";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type TicketType = "TASK" | "ISSUE" | "BUG";

// --- PERUBAHAN TIPE DATA ---
type UserDetails = {
    id: number;
    fullName: string; // Ganti 'name' menjadi 'fullName'
    email: string;
};

type Assignee = {
    id: number;
    user: UserDetails; // Menggunakan UserDetails yang sudah diperbarui
};

type Ticket = {
    id: number;
    title: string;
    description: string | null;
    type: TicketType;
    status: TicketStatus;
    priority: TicketPriority;
    projectId: number;
    requesterId: number;
    requester?: UserDetails; // Menggunakan UserDetails yang sudah diperbarui
    assignees: Assignee[];
    startDate: string | null;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
};

export default function ViewTicketAssignee() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [ticket, setTicket] = React.useState<Ticket | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string>("");

    const API_BASE = import.meta.env.VITE_API_BASE;

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // Fetch ticket data by ID
    const fetchTicket = React.useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Sesi otentikasi tidak ditemukan. Harap login.");
                setLoading(false);
                return;
            }

            // Menggunakan `Ticket` dengan tipe data yang diperbarui
            const res = await axios.get<Ticket>(`${API_BASE}/tickets/${id}`, { 
                headers: getAuthHeaders(),
            });

            setTicket(res.data);
        } catch (e: any) {
            console.error(e);
            if (e.response?.status === 404) {
                setError("Tiket tidak ditemukan.");
            } else if (e.response?.status === 401) {
                setError("Akses ditolak. Silakan login kembali.");
            } else {
                setError("Gagal memuat data tiket.");
            }
        } finally {
            setLoading(false);
        }
    }, [id]);

    React.useEffect(() => {
        fetchTicket();
    }, [fetchTicket]);

    // Handle Delete Ticket (Logika tidak diubah)
    const handleDelete = async () => {
        if (!ticket) return;

        const confirm = await Swal.fire({
            title: "Hapus Tiket?",
            text: `Yakin ingin menghapus tiket "${ticket.title}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
            reverseButtons: true,
        });

        if (!confirm.isConfirmed) return;

        try {
            await axios.delete(`${API_BASE}/tickets/${ticket.id}`, {
                headers: getAuthHeaders(),
            });

            await Swal.fire({
                title: "Berhasil",
                text: `Tiket "${ticket.title}" berhasil dihapus.`,
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });

            navigate("/admin/dashboard/ticket-assignee");
        } catch (e: any) {
            console.error(e);
            const message = e?.response?.data?.message || "Gagal menghapus tiket.";
            await Swal.fire({
                title: "Gagal",
                text: message,
                icon: "error",
            });
        }
    };

    // Format tanggal (Tidak diubah)
    const formatDate = (iso?: string | null) => {
        if (!iso) return "-";
        try {
            return new Date(iso).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return iso;
        }
    };

    // Format tanggal pendek (Tidak diubah)
    const formatDateShort = (iso?: string | null) => {
        if (!iso) return "-";
        try {
            return new Date(iso).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch {
            return iso;
        }
    };

    // 🔖 Badge helpers (konsisten dengan AdminTickets)
    const statusVariant = (status?: TicketStatus) => {
        switch (status) {
            case "OPEN":
            case "PENDING":
                return "secondary";
            case "IN_PROGRESS":
                return "default";
            case "RESOLVED":
            case "CLOSED":
                return "default";
            default:
                return "secondary";
        }
    };

    const priorityVariant = (p?: TicketPriority) => {
        switch (p) {
            case "LOW":
                return "outline";
            case "MEDIUM":
                return "secondary";
            case "HIGH":
                return "default";
            case "URGENT":
                return "destructive"; // Menggunakan "destructive" untuk URGENT, mirip CRITICAL
            default:
                return "secondary";
        }
    };

    const typeVariant = (type?: TicketType) => {
        switch (type) {
            case "TASK":
                return "secondary";
            case "ISSUE":
            case "BUG":
                return "destructive";
            default:
                return "outline";
        }
    };

    return (
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
                <div className="flex flex-1 flex-col p-6">
                    {/* ... (Header aksi tidak diubah) ... */}
                    <div className="flex items-center gap-4 mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/admin/dashboard/ticket-assignees")}
                            className="flex items-center gap-2"
                        >
                            <IconArrowLeft className="h-4 w-4" />
                            Back
                        </Button>

                        <div className="ml-auto flex items-center gap-2">
                            {ticket && (
                                <Link to={`/admin/dashboard/ticket-assignee/edit/${ticket.id}`}>
                                    <Button size="sm" variant="outline" className="flex items-center gap-2">
                                        <IconEdit className="h-4 w-4" />
                                        Edit
                                    </Button>
                                </Link>
                            )}
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={handleDelete}
                                className="flex items-center gap-2"
                            >
                                <IconTrash className="h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </div>

                    <h1 className="text-2xl font-semibold mb-2">Detail Ticket Assignment</h1>
                    <p className="text-muted-foreground mb-6">
                        Lihat informasi lengkap dan detail assignment tiket ini.
                    </p>

                    {loading ? (
                        <div className="p-6">Memuat data tiket...</div>
                    ) : error ? (
                        <div className="p-6 text-red-600">{error}</div>
                    ) : !ticket ? (
                        <div className="p-6">Tiket tidak ditemukan.</div>
                    ) : (
                        <div className="space-y-6">
                            {/* Card Utama */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{ticket.title}</CardTitle>
                                    <CardDescription>
                                        {/* PERUBAHAN DI SINI: Menggunakan fullName atau email */}
                                        Dilaporkan oleh <strong>{ticket.requester?.fullName || ticket.requester?.email || "Requester Tidak Diketahui"}</strong>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* ID Tiket (Tidak diubah) */}
                                        <div>
                                            <div className="text-sm text-muted-foreground">ID Tiket</div>
                                            <div className="font-medium">#{ticket.id}</div>
                                        </div>

                                        {/* Type (Diubah untuk konsistensi) */}
                                        <div>
                                            <div className="text-sm text-muted-foreground">Type</div>
                                            <Badge variant={typeVariant(ticket.type)}>{ticket.type}</Badge>
                                        </div>

                                        {/* Status (Diubah untuk konsistensi) */}
                                        <div>
                                            <div className="text-sm text-muted-foreground">Status</div>
                                            <Badge variant={statusVariant(ticket.status)}>{ticket.status}</Badge>
                                        </div>

                                        {/* Priority (Diubah untuk konsistensi) */}
                                        <div>
                                            <div className="text-sm text-muted-foreground">Priority</div>
                                            <Badge variant={priorityVariant(ticket.priority)}>{ticket.priority}</Badge>
                                        </div>

                                        {/* Project ID (Tidak diubah) */}
                                        <div>
                                            <div className="text-sm text-muted-foreground">Project ID</div>
                                            <div className="font-medium">#{ticket.projectId}</div>
                                        </div>

                                        {/* Requester */}
                                        <div>
                                            <div className="text-sm text-muted-foreground">Requester</div>
                                            <div className="font-medium">
                                                {/* PERUBAHAN DI SINI: Menggunakan fullName atau email */}
                                                {ticket.requester?.fullName || ticket.requester?.email || "Requester Tidak Diketahui"}
                                            </div>
                                            {ticket.requester?.email && (
                                                <div className="text-xs text-muted-foreground">
                                                    {ticket.requester.email}
                                                </div>
                                            )}
                                        </div>

                                        {/* Start Date (Tidak diubah) */}
                                        <div>
                                            <div className="text-sm text-muted-foreground">Start Date</div>
                                            <div className="font-medium">{formatDate(ticket.startDate)}</div>
                                        </div>

                                        {/* Due Date (Tidak diubah) */}
                                        <div>
                                            <div className="text-sm text-muted-foreground">Due Date</div>
                                            <div className="font-medium">{formatDate(ticket.dueDate)}</div>
                                        </div>

                                        {/* Created At (Tidak diubah) */}
                                        <div>
                                            <div className="text-sm text-muted-foreground">Created</div>
                                            <div className="font-medium">{formatDate(ticket.createdAt)}</div>
                                        </div>
                                    </div>

                                    {/* Deskripsi (Tidak diubah) */}
                                    <div>
                                        <div className="text-sm text-muted-foreground mb-1">Deskripsi</div>
                                        <div className="font-medium whitespace-pre-wrap">
                                            {ticket.description || "-"}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Card Assignees */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Assignees</CardTitle>
                                    <CardDescription>
                                        Daftar user yang ditugaskan untuk ticket ini
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {ticket.assignees.length > 0 ? (
                                        <div className="space-y-3">
                                            {ticket.assignees.map((assignee) => (
                                                <div
                                                    key={assignee.id}
                                                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                                                        {/* PERUBAHAN DI SINI: Menggunakan fullName */}
                                                        {assignee.user?.fullName?.charAt(0)?.toUpperCase() || "?"}
                                                    </div>
                                                    <div className="flex-1">
                                                        {/* PERUBAHAN DI SINI: Menggunakan fullName atau email */}
                                                        <div className="font-medium">{assignee.user?.fullName || assignee.user?.email || "Unknown Assignee"}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {assignee.user?.email || "-"}
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline">Assigned</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            Belum ada assignee untuk ticket ini
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
