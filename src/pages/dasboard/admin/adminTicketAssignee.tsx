"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
// import axios from "axios" // ❌ Dihapus karena menggunakan data dummy
import Swal from "sweetalert2"
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconEye,
  IconLayoutGrid,
  IconChevronDown,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// --- TIPE DATA ---

export type Assignee = {
  id: number
  name: string
  email: string
}

export type Ticket = {
  id: number
  title: string
  description: string
  reporterName: string // Pelapor
  assigneeId: number | null
  assignee?: Assignee
  status: string // OPEN, IN_PROGRESS, RESOLVED, CLOSED, PENDING
  priority: string // LOW, MEDIUM, HIGH, URGENT
  category: string
  createdAt: string
  updatedAt: string
}

// --- DATA DUMMY LOKAL ---

// Gunakan React.useRef agar data dummy ini tidak dibuat ulang setiap re-render.
// Ini membantu mensimulasikan database lokal yang tetap saat filter dan state lain berubah.
const initialTickets: Ticket[] = [
  {
    id: 1,
    title: "Bug: Gagal Login di Chrome Mobile",
    description: "Saat mencoba login menggunakan Chrome di Android, form selalu kembali kosong setelah submit.",
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
    description: "Perlu menambahkan tombol untuk mengekspor data laporan bulanan ke format PDF.",
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
    description: "Peringatan otomatis terdeteksi bahwa server DB memiliki memori rendah dalam 24 jam terakhir.",
    reporterName: "System Admin",
    assigneeId: null,
    assignee: undefined,
    status: "PENDING",
    priority: "URGENT",
    category: "Infrastructure",
    createdAt: "2025-11-02T16:45:00Z",
    updatedAt: "2025-11-02T16:45:00Z",
  },
  {
    id: 4,
    title: "Tanya Jawab: Cara reset password",
    description: "Pengguna bingung cara menggunakan fitur lupa password.",
    reporterName: "Lia Mariana",
    assigneeId: 101,
    assignee: { id: 101, name: "Budi Santoso", email: "budi@example.com" },
    status: "RESOLVED",
    priority: "LOW",
    category: "Support",
    createdAt: "2025-10-25T11:20:00Z",
    updatedAt: "2025-10-25T15:00:00Z",
  },
];


// --- KOMPONEN UTAMA ---

export default function AdminTickets() {
  const [tickets, setTickets] = React.useState<Ticket[]>([]) 
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  
  const [cols, setCols] = React.useState({
    id: true,
    title: true,
    category: true,
    reporter: true,
    assignee: true,
    priority: true,
    status: true,
    createdAt: true,
    actions: true,
  })

  const navigate = useNavigate()
  // const API_BASE = "http://localhost:3000" // ❌ Dihapus

  // 🔄 FUNGSI FETCH DUMMY DATA
  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Simulasikan penundaan API (misalnya 500ms)
      await new Promise(resolve => setTimeout(resolve, 500)) 
      
      // Menggunakan data dummy
      setTickets(initialTickets) 
      
    } catch (e: any) {
      setError("Gagal memuat data tiket dari dummy data.")
    } finally {
      setLoading(false)
    }
  }

  // 🗑️ FUNGSI DELETE DUMMY DATA
  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Hapus Tiket?",
      text: "Tindakan ini hanya berlaku pada data lokal (dummy).", 
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
    })

    if (!confirm.isConfirmed) return

    const ticketToDelete = tickets.find(t => t.id === id);

    try {
      // 1. Filter state lokal
      setTickets((prev) => prev.filter((x) => x.id !== id))

      // 2. Simulasikan penundaan
      await new Promise(resolve => setTimeout(resolve, 300)) 
      
      await Swal.fire({
        title: "Terhapus",
        text: `Tiket #${id} (${ticketToDelete?.title}) berhasil dihapus secara lokal.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      })
      
    } catch (e: any) {
      // Untuk error lokal, set kembali tiket sebelumnya
      setError("Gagal menghapus tiket secara lokal.")
      await Swal.fire({ title: "Gagal", text: "Gagal menghapus tiket secara lokal.", icon: "error" })
    }
  }

  React.useEffect(() => {
    fetchTickets()
  }, [])

  // 🔹 Filter dan Sorting Data (Logika ini tetap sama)
  const filteredTickets = React.useMemo(() => {
    const ql = search.trim().toLowerCase()

    const filtered = tickets.filter((t) => {
      // Pastikan perbandingan status case-insensitive jika statusFilter dibuat uppercase di SelectItem, 
      // namun di sini kita asumsikan status data dummy dan filter sama (misal OPEN)
      if (statusFilter !== "all" && t.status !== statusFilter) return false
      if (!ql) return true
      return (
        t.title.toLowerCase().includes(ql) ||
        t.description.toLowerCase().includes(ql) ||
        t.reporterName.toLowerCase().includes(ql) ||
        t.assignee?.name?.toLowerCase().includes(ql)
      )
    })

    return filtered.sort((a, b) => a.id - b.id)
  }, [tickets, search, statusFilter])

  // Helper untuk Badge Status Tiket
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Badge variant="destructive">Open</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">In Progress</Badge>
      case "RESOLVED":
        return <Badge className="bg-green-500 hover:bg-green-600">Resolved</Badge>
      case "CLOSED":
        return <Badge variant="outline">Closed</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  // Helper untuk Badge Priority Tiket
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "LOW":
        return <Badge variant="outline">Low</Badge>
      case "MEDIUM":
        return <Badge variant="secondary">Medium</Badge>
      case "HIGH":
        return <Badge variant="destructive">High</Badge>
      case "URGENT":
        return <Badge className="bg-red-700 hover:bg-red-800 text-white">URGENT</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  // Helper untuk format tanggal
  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("id-ID", {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return iso
    }
  }


  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex flex-col flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Daftar Tiket 🎫 (Data Dummy)</h1>
              <p className="text-muted-foreground">
                Lihat dan kelola semua tiket masuk.
              </p>
            </div>
            {/* Mengubah navigasi ke create ticket */}
            <Button onClick={() => navigate("/admin/dashboard/tickets/create")}>
              <IconPlus className="mr-2 h-4 w-4" />
              Buat Tiket Baru
            </Button>
          </div>

          {/* Filter & Controls */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3">
              <Input
                placeholder="Cari judul, pelapor, atau assignee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-80"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ALL</SelectItem>
                  {/* Menyesuaikan Status Tiket */}
                  <SelectItem value="OPEN">OPEN</SelectItem>
                  <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                  <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                  <SelectItem value="CLOSED">CLOSED</SelectItem>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <IconLayoutGrid className="h-4 w-4" />
                  Kolom
                  <IconChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.keys(cols).map((key) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={(cols as any)[key]}
                    onCheckedChange={(v) =>
                      setCols((c) => ({ ...c, [key]: !!v }))
                    }
                  >
                    {key.toUpperCase()}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            {loading ? (
              <div className="p-6">Memuat data dummy...</div>
            ) : error ? (
              <div className="p-6 text-red-600">Error: {error}</div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-6">Tidak ada data tiket ditemukan.</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50 text-center">
                  <tr>
                    {cols.id && <th className="px-4 py-3 font-medium">ID</th>}
                    {cols.title && <th className="px-4 py-3 font-medium">Judul</th>}
                    {cols.category && (
                      <th className="px-4 py-3 font-medium">Kategori</th>
                    )}
                    {cols.reporter && <th className="px-4 py-3 font-medium">Pelapor</th>}
                    {cols.assignee && <th className="px-4 py-3 font-medium">Assignee</th>}
                    {cols.priority && <th className="px-4 py-3 font-medium">Priority</th>}
                    {cols.status && <th className="px-4 py-3 font-medium">Status</th>}
                    {cols.createdAt && (
                      <th className="px-4 py-3 font-medium">Dibuat</th>
                    )}
                    {cols.actions && (
                      <th className="px-4 py-3 font-medium">Aksi</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((t) => (
                    <tr key={t.id} className="border-t text-center hover:bg-muted/50 transition-colors">
                      {cols.id && <td className="px-4 py-3">{t.id}</td>}
                      {cols.title && <td className="px-4 py-3 text-left font-medium">{t.title}</td>}
                      {cols.category && (
                        <td className="px-4 py-3">{t.category || "-"}</td>
                      )}
                      {cols.reporter && (
                        <td className="px-4 py-3">{t.reporterName}</td>
                      )}
                      {cols.assignee && (
                        <td className="px-4 py-3">
                          {t.assignee ? (
                            <div className="font-medium">{t.assignee.name}</div>
                          ) : (
                            "-"
                          )}
                        </td>
                      )}
                      {cols.priority && (
                        <td className="px-4 py-3">
                          {getPriorityBadge(t.priority)}
                        </td>
                      )}
                      {cols.status && (
                        <td className="px-4 py-3">
                          {getStatusBadge(t.status)}
                        </td>
                      )}
                      {cols.createdAt && (
                        <td className="px-4 py-3">
                          {formatDate(t.createdAt)}
                        </td>
                      )}
                      {cols.actions && (
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-3">
                            {/* Mengubah navigasi ke view ticket */}
                            <Link to={`/admin/dashboard/tickets/view/${t.id}`}>
                              <IconEye className="h-4 w-4 text-blue-600 hover:text-blue-700" />
                            </Link>
                            {/* Mengubah navigasi ke edit ticket */}
                            <Link to={`/admin/dashboard/tickets/edit/${t.id}`}>
                              <IconEdit className="h-4 w-4 text-yellow-600 hover:text-yellow-700" />
                            </Link>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <IconTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}