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
// import axios from "axios"; // ❌ Dihapus karena menggunakan data dummy
import Swal from "sweetalert2";
import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react";

// Tipe data untuk Penanggung Jawab (Assignee)
type Assignee = {
  id: number;
  name: string;
  email: string;
};

// Tipe data untuk Tiket
type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "PENDING";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type Ticket = {
  id: number;
  title: string;
  description: string;
  reporterName: string; // Pelapor Tiket
  assigneeId: number | null;
  assignee?: Assignee; // Penanggung Jawab
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  createdAt: string;
  updatedAt: string;
};

// --- DATA DUMMY LOKAL UNTUK SIMULASI ---
const DUMMY_TICKETS: Ticket[] = [
    {
      id: 1,
      title: "Bug: Gagal Login di Chrome Mobile",
      description: "Saat mencoba login menggunakan Chrome di Android, form selalu kembali kosong setelah submit. Ini terjadi pada versi Chrome 118 ke atas.",
      reporterName: "Joko Susilo",
      assigneeId: 101,
      assignee: { id: 101, name: "Budi Santoso", email: "budi@example.com" },
      status: "IN_PROGRESS",
      priority: "HIGH",
      category: "Frontend Bug",
      createdAt: "2025-10-31T09:00:00Z",
      updatedAt: "2025-11-01T14:30:00Z",
    },
    {
      id: 2,
      title: "Permintaan Fitur: Export Laporan PDF",
      description: "Perlu menambahkan tombol untuk mengekspor data laporan bulanan ke format PDF. Fitur ini harus tersedia untuk semua pengguna Admin dan Finance.",
      reporterName: "Dewi Lestari",
      assigneeId: 102,
      assignee: { id: 102, name: "Citra Ayu", email: "citra@example.com" },
      status: "OPEN",
      priority: "MEDIUM",
      category: "New Feature",
      createdAt: "2025-11-01T10:15:00Z",
      updatedAt: "2025-11-01T10:15:00Z",
    },
    {
      id: 3,
      title: "Database Server Low Memory",
      description: "Peringatan otomatis terdeteksi bahwa server DB memiliki memori rendah dalam 24 jam terakhir. Harus segera diperiksa oleh tim infrastruktur.",
      reporterName: "System Admin",
      assigneeId: null,
      assignee: undefined,
      status: "PENDING",
      priority: "URGENT",
      category: "Infrastructure",
      createdAt: "2025-11-02T16:45:00Z",
      updatedAt: "2025-11-02T16:45:00Z",
    },
];
// --- AKHIR DATA DUMMY ---


export default function ViewTicket() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = React.useState<Ticket | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");

//   const API_BASE = "http://localhost:3000"; // ❌ Dihapus

  // 🔄 Fetch ticket data by ID menggunakan data dummy
  const fetchTicket = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");

    try {
      // Simulasikan penundaan API
      await new Promise(resolve => setTimeout(resolve, 500)); 

      // Cari tiket di data dummy
      const ticketId = parseInt(id, 10);
      const foundTicket = DUMMY_TICKETS.find(t => t.id === ticketId);

      if (foundTicket) {
        setTicket(foundTicket);
      } else {
        setError("Tiket dengan ID tersebut tidak ditemukan di data dummy.");
      }
    } catch (e) {
      // Error ini hanya terjadi jika ada masalah pada logika lokal
      setError("Gagal memproses data dummy.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  // 🗑️ Handle Delete Ticket (Simulasi)
  const handleDelete = async () => {
    if (!ticket) return;

    const confirm = await Swal.fire({
      title: "Hapus Tiket (Dummy)?",
      text: `Yakin ingin menghapus tiket "${ticket.title}"? (Tindakan ini tidak menghapus data asli)`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      // Simulasikan panggilan delete berhasil
      await new Promise(resolve => setTimeout(resolve, 300)); 

      await Swal.fire({
        title: "Berhasil (Simulasi)",
        text: `Tiket "${ticket.title}" berhasil dihapus secara simulasi.`,
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });

      // Karena ini data dummy dan kita tidak memodifikasi array DUMMY_TICKETS, 
      // kita navigasi saja seolah-olah berhasil dihapus.
      navigate("/admin/dashboard/tickets"); 
    } catch (e: any) {
      // Ini hanya untuk menangani error simulasi
      await Swal.fire({ title: "Gagal", text: "Gagal menghapus tiket secara simulasi.", icon: "error" });
    }
  };

  // 🔹 Helper untuk format tanggal
  const formatDate = (iso?: string) => {
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

  // 🔹 Helper untuk badge Status
  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "OPEN":
        return <Badge variant="destructive">Open</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">In Progress</Badge>;
      case "RESOLVED":
        return <Badge className="bg-green-500 hover:bg-green-600">Resolved</Badge>;
      case "CLOSED":
        return <Badge variant="outline">Closed</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // 🔹 Helper untuk badge Priority
  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case "LOW":
        return <Badge variant="outline">Low</Badge>;
      case "MEDIUM":
        return <Badge variant="secondary">Medium</Badge>;
      case "HIGH":
        return <Badge variant="destructive">High</Badge>;
      case "URGENT":
        return <Badge className="bg-red-700 hover:bg-red-800 text-white">URGENT</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/dashboard/tickets")} // Navigasi ke daftar tiket
              className="flex items-center gap-2"
            >
              <IconArrowLeft className="h-4 w-4" />
              Kembali
            </Button>

            <div className="ml-auto flex items-center gap-2">
              {ticket && (
                <Link to={`/admin/dashboard/tickets/edit/${ticket.id}`}>
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
                Hapus (Dummy)
              </Button>
            </div>
          </div>

          <h1 className="text-2xl font-semibold mb-2">Detail Tiket 🎫 (Data Dummy)</h1>
          <p className="text-muted-foreground mb-6">
            Lihat informasi lengkap dan detail penugasan tiket ini.
          </p>

          {loading ? (
            <div className="p-6">Memuat data dummy...</div>
          ) : error ? (
            <div className="p-6 text-red-600">{error}</div>
          ) : !ticket ? (
            <div className="p-6">Tiket tidak ditemukan.</div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{ticket.title}</CardTitle>
                <CardDescription>
                  Dilaporkan oleh **{ticket.reporterName || "Anonim"}**
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Baris 1: ID, Status, Priority */}
                  <div>
                    <div className="text-sm text-muted-foreground">ID Tiket</div>
                    <div className="font-medium">{ticket.id}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Prioritas</div>
                    {getPriorityBadge(ticket.priority)}
                  </div>

                  {/* Baris 2: Category, Assignee, Created At */}
                  <div>
                    <div className="text-sm text-muted-foreground">Kategori</div>
                    <div className="font-medium">{ticket.category || "-"}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Penanggung Jawab</div>
                    <div className="font-medium">
                      {ticket.assignee?.name || "Belum Ditugaskan"}
                    </div>
                    {ticket.assignee?.email && (
                      <div className="text-xs text-muted-foreground">
                        {ticket.assignee.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Dibuat Pada</div>
                    <div className="font-medium">{formatDate(ticket.createdAt)}</div>
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Deskripsi</div>
                  <div className="font-medium whitespace-pre-wrap">
                    {ticket.description || "-"}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}