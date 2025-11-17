"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
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
export type TicketAssignee = {
  id: number
  ticketId: number
  userId: number
  ticket: {
    id: number
    title: string
    description: string | null
    status: string
    priority: string
    type: string
  }
  user: {
    id: number
    name: string
    email: string
  }
  createdAt: string
}

// --- KOMPONEN UTAMA ---
export default function AdminTicketAssignees() {
  const [assignees, setAssignees] = React.useState<TicketAssignee[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")

  const [cols, setCols] = React.useState({
    id: true,
    ticket: true,
    assignee: true,
    type: true,
    priority: true,
    status: true,
    createdAt: true,
    actions: true,
  })

  const navigate = useNavigate()
  const API_BASE = import.meta.env.VITE_API_BASE;

  // 🔒 Helper untuk ambil header Authorization
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // 🔄 FETCH DATA DARI API
  const fetchTicketAssignees = async () => {
    try {
      setLoading(true)
      setError("")

      const token = localStorage.getItem("token")
      if (!token) {
        setError("Sesi otentikasi tidak ditemukan. Harap login.")
        setLoading(false)
        return
      }

      // Ambil semua tickets untuk mendapatkan assignees
      const res = await axios.get(`${API_BASE}/tickets`, {
        headers: getAuthHeaders(),
      })

      // Transform data dari tickets menjadi list assignees
      const allAssignees: TicketAssignee[] = []
      res.data.forEach((ticket: any) => {
        if (ticket.assignees && ticket.assignees.length > 0) {
          ticket.assignees.forEach((assignee: any) => {
            allAssignees.push({
              id: assignee.id,
              ticketId: ticket.id,
              userId: assignee.user.id,
              ticket: {
                id: ticket.id,
                title: ticket.title,
                description: ticket.description,
                status: ticket.status,
                priority: ticket.priority,
                type: ticket.type,
              },
              user: assignee.user,
              createdAt: assignee.createdAt || ticket.createdAt,
            })
          })
        }
      })

      setAssignees(allAssignees)
    } catch (e: any) {
      console.error(e)
      if (e.response?.status === 401) {
        setError("Akses ditolak atau sesi kedaluwarsa. Silakan login kembali.")
      } else {
        setError("Gagal memuat data ticket assignee dari server.")
      }
    } finally {
      setLoading(false)
    }
  }

  // 🗑️ DELETE DATA
  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Hapus Assignment?",
      text: "Assignee akan dihapus dari ticket.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
    })

    if (!confirm.isConfirmed) return

    try {
      await axios.delete(`${API_BASE}/ticket-assignees/${id}`, {
        headers: getAuthHeaders(),
      })

      setAssignees((prev) => prev.filter((a) => a.id !== id))

      await Swal.fire({
        title: "Terhapus",
        text: `Assignment #${id} berhasil dihapus.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (e: any) {
      console.error(e)
      setError("Gagal menghapus assignment dari server.")
      await Swal.fire({
        title: "Gagal",
        text: e.response?.data?.message || "Gagal menghapus assignment.",
        icon: "error",
      })
    }
  }

  React.useEffect(() => {
    fetchTicketAssignees()
  }, [])

  // 🔹 Filter data
  const filteredAssignees = React.useMemo(() => {
    const ql = search.trim().toLowerCase()
    return assignees
      .filter((a) => {
        if (statusFilter !== "all" && a.ticket.status !== statusFilter) return false
        if (!ql) return true
        return (
          a.ticket.title.toLowerCase().includes(ql) ||
          a.user.name.toLowerCase().includes(ql) ||
          a.user.email.toLowerCase().includes(ql)
        )
      })
      .sort((a, b) => b.id - a.id)
  }, [assignees, search, statusFilter])

  // 🔖 Badge helpers (konsisten dengan AdminTickets)
  const statusVariant = (status?: string) => {
    switch (status) {
      case "NEW":
      case "TO_DO":
      case "OPEN":
        return "secondary";
      case "IN_PROGRESS":
        return "default";
      case "IN_REVIEW":
        return "outline";
      case "DONE":
      case "RESOLVED":
      case "CLOSED":
        return "default";
      case "BLOCKED":
      case "PENDING":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const priorityVariant = (p?: string) => {
    switch (p) {
      case "LOW":
        return "outline";
      case "MEDIUM":
        return "secondary";
      case "HIGH":
        return "default";
      case "CRITICAL":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const typeVariant = (type?: string) => {
    // Menggunakan variant serupa untuk konsistensi; bisa disesuaikan jika diperlukan
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

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    } catch {
      return iso
    }
  }

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
        <main className="flex flex-col flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Ticket Assignments</h1>
              <p className="text-muted-foreground">
                Kelola assignment ticket ke user/developer.
              </p>
            </div>
            <Button onClick={() => navigate("/admin/dashboard/ticket-assignees/create")}>
              <IconPlus className="mr-2 h-4 w-4" />
              Assign Ticket Baru
            </Button>
          </div>

          {/* Filter */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3">
              <Input
                placeholder="Cari ticket atau assignee..."
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
                  <SelectItem value="NEW">NEW</SelectItem>
                  <SelectItem value="TO_DO">TO_DO</SelectItem>
                  <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                  <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                  <SelectItem value="CLOSED">CLOSED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Kolom toggle */}
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
              <div className="p-6">Memuat data dari server...</div>
            ) : error ? (
              <div className="p-6 text-red-600">Error: {error}</div>
            ) : filteredAssignees.length === 0 ? (
              <div className="p-6">Tidak ada data ticket assignment ditemukan.</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50 text-center">
                  <tr>
                    {cols.id && <th className="px-4 py-3 font-medium">ID</th>}
                    {cols.ticket && <th className="px-4 py-3 font-medium">Ticket</th>}
                    {cols.assignee && <th className="px-4 py-3 font-medium">Assignee</th>}
                    {cols.type && <th className="px-4 py-3 font-medium">Type</th>}
                    {cols.priority && <th className="px-4 py-3 font-medium">Priority</th>}
                    {cols.status && <th className="px-4 py-3 font-medium">Status</th>}
                    {cols.createdAt && <th className="px-4 py-3 font-medium">Assigned At</th>}
                    {cols.actions && <th className="px-4 py-3 font-medium">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignees.map((a) => (
                    <tr
                      key={a.id}
                      className="border-t text-center hover:bg-muted/50 transition-colors"
                    >
                      {cols.id && <td className="px-4 py-3">{a.id}</td>}
                      {cols.ticket && (
                        <td className="px-4 py-3 text-left">
                          <div className="font-medium">{a.ticket.title}</div>
                          <div className="text-xs text-muted-foreground">
                            Ticket #{a.ticket.id}
                          </div>
                        </td>
                      )}
                      {cols.assignee && (
                        <td className="px-4 py-3 text-left">
                          <div className="font-medium">{a.user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {a.user.email}
                          </div>
                        </td>
                      )}
                      {cols.type && (
                        <td className="px-4 py-3">
                          <Badge variant={typeVariant(a.ticket.type)}>{a.ticket.type || "-"}</Badge>
                        </td>
                      )}
                      {cols.priority && (
                        <td className="px-4 py-3">
                          <Badge variant={priorityVariant(a.ticket.priority)}>{a.ticket.priority || "-"}</Badge>
                        </td>
                      )}
                      {cols.status && (
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant(a.ticket.status)}>{a.ticket.status}</Badge>
                        </td>
                      )}
                      {cols.createdAt && (
                        <td className="px-4 py-3">{formatDate(a.createdAt)}</td>
                      )}
                      {cols.actions && (
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-3">
                            <Link to={`/admin/dashboard/ticket-assignees/view/${a.ticket.id}`}>
                              <IconEye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/admin/dashboard/ticket-assignees/edit/${a.ticket.id}`}
                              className="cursor-pointer"
                            >
                              <IconEdit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(a.id)}
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
