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

export type Project = {
  id: number
  name: string
  categories: string[]
  ownerId: number
  owner?: {
    id: number
    name: string
    company: string
    email: string
  }
  startDate: string
  endDate: string
  status: string
  completion: string
  notes: string
  phases?: {
    id: number
    name: string
    startDate: string
    endDate: string
  }[]
}

export default function AdminProjects() {
  const [projects, setProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [cols, setCols] = React.useState({
    id: true,
    name: true,
    categories: true,
    owner: true,
    status: true,
    completion: true,
    startDate: true,
    endDate: true,
    actions: true,
  })

  const navigate = useNavigate()
  const API_BASE = "http://localhost:3000"

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError("")

      const token = localStorage.getItem("token")
      const res = await axios.get(`${API_BASE}/projects`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      const data = Array.isArray(res.data) ? res.data : res.data?.data || []
      setProjects(data)
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal memuat data proyek")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Hapus proyek?",
      text: "Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
    })

    if (!confirm.isConfirmed) return

    const prev = projects
    setProjects((p) => p.filter((x) => x.id !== id))

    try {
      const token = localStorage.getItem("token")
      await axios.delete(`${API_BASE}/projects/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      await Swal.fire({
        title: "Terhapus",
        text: `Proyek #${id} berhasil dihapus.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (e: any) {
      setProjects(prev)
      const msg = e?.response?.data?.message || "Gagal menghapus proyek"
      setError(msg)
      await Swal.fire({ title: "Gagal", text: msg, icon: "error" })
    }
  }

  React.useEffect(() => {
    fetchProjects()
  }, [])

  const filteredProjects = React.useMemo(() => {
  const ql = search.trim().toLowerCase()

  // 🔹 Filter data sesuai status & pencarian
  const filtered = projects.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false
    if (!ql) return true
    return (
      p.name.toLowerCase().includes(ql) ||
      p.notes.toLowerCase().includes(ql) ||
      p.owner?.name?.toLowerCase().includes(ql)
    )
  })

  // 🔹 Urutkan berdasarkan ID (ascending)
  return filtered.sort((a, b) => a.id - b.id)
}, [projects, search, statusFilter])


  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex flex-col flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Daftar Project</h1>
              <p className="text-muted-foreground">
                Lihat dan kelola semua project aktif.
              </p>
            </div>
            <Button onClick={() => navigate("/admin/dashboard/projects/create")}>
              <IconPlus className="mr-2 h-4 w-4" />
              Tambah Project
            </Button>
          </div>

          {/* Filter & Controls */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3">
              <Input
                placeholder="Cari nama, owner, atau catatan..."
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
                  <SelectItem value="NOT_STARTED">NOT_STARTED</SelectItem>
                  <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
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
                    {key}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            {loading ? (
              <div className="p-6">Memuat data...</div>
            ) : error ? (
              <div className="p-6 text-red-600">{error}</div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-6">Tidak ada data ditemukan.</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50 text-center">
                  <tr>
                    {cols.id && <th className="px-4 py-3 font-medium">ID</th>}
                    {cols.name && <th className="px-4 py-3 font-medium">Nama</th>}
                    {cols.categories && (
                      <th className="px-4 py-3 font-medium">Kategori</th>
                    )}
                    {cols.owner && <th className="px-4 py-3 font-medium">Owner</th>}
                    {cols.status && <th className="px-4 py-3 font-medium">Status</th>}
                    {cols.completion && (
                      <th className="px-4 py-3 font-medium">% Selesai</th>
                    )}
                    {cols.startDate && (
                      <th className="px-4 py-3 font-medium">Mulai</th>
                    )}
                    {cols.endDate && <th className="px-4 py-3 font-medium">Selesai</th>}
                    {cols.actions && (
                      <th className="px-4 py-3 font-medium">Aksi</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((p) => (
                    <tr key={p.id} className="border-t text-center">
                      {cols.id && <td className="px-4 py-3">{p.id}</td>}
                      {cols.name && <td className="px-4 py-3">{p.name}</td>}
                      {cols.categories && (
                        <td className="px-4 py-3">
                          {p.categories?.length
                            ? p.categories.join(", ")
                            : "-"}
                        </td>
                      )}
                      {cols.owner && (
                        <td className="px-4 py-3">
                          {p.owner ? (
                            <>
                              <div className="font-medium">{p.owner.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {p.owner.company}
                              </div>
                            </>
                          ) : (
                            "-"
                          )}
                        </td>
                      )}
                      {cols.status && (
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{p.status}</Badge>
                        </td>
                      )}
                      {cols.completion && (
                        <td className="px-4 py-3">{p.completion}%</td>
                      )}
                      {cols.startDate && (
                        <td className="px-4 py-3">
                          {new Date(p.startDate).toLocaleDateString("id-ID")}
                        </td>
                      )}
                      {cols.endDate && (
                        <td className="px-4 py-3">
                          {new Date(p.endDate).toLocaleDateString("id-ID")}
                        </td>
                      )}
                      {cols.actions && (
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-3">
                            <Link to={`/admin/dashboard/projects/view/${p.id}`}>
                              <IconEye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </Link>
                            <Link to={`/admin/dashboard/projects/edit/${p.id}`}>
                              <IconEdit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </Link>
                            <button
                              onClick={() => handleDelete(p.id)}
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
