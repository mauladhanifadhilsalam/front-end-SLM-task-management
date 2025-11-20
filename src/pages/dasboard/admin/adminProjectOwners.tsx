import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  IconLayoutGrid,
  IconChevronDown,
  IconPlus,
  IconTrash,
  IconEdit,
  IconEye,
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

type Owner = {
  id: number
  name: string
  company?: string
  email?: string
  phone?: string
  address?: string
  createdAt?: string
  updatedAt?: string
}

const API_BASE = import.meta.env.VITE_API_BASE

export default function AdminProjectOwners() {
  const navigate = useNavigate()

  const [owners, setOwners] = React.useState<Owner[]>([])
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string>("")

  const [q, setQ] = React.useState("")
  const [cols, setCols] = React.useState({
    id: true,
    name: true,
    email: true,
    phone: true,
    company: true,
    address: true,
    actions: true,
  })

  const fetchOwners = React.useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get(`${API_BASE}/project-owners`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      const raw: any[] = Array.isArray(res.data) ? res.data : res.data?.data ?? []
      const normalized: Owner[] = raw.map((o) => ({
        id: Number(o.id),
        name: o.name,
        company: o.company ?? "",
        email: o.email ?? "",
        phone: o.phone ?? "",
        address: o.address ?? "",
        createdAt: o.createdAt ?? o.created_at ?? o.createdAt,
        updatedAt: o.updatedAt ?? o.updated_at ?? o.updatedAt,
      }))
      setOwners(normalized)
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal memuat data project owners")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchOwners()
  }, [fetchOwners])

  const formatDate = (iso?: string) => {
    if (!iso) return "-"
    try {
      return new Date(iso).toLocaleString("id-ID")
    } catch {
      return iso
    }
  }

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return owners
    return owners.filter(
      (o) =>
        String(o.name ?? "").toLowerCase().includes(s) ||
        String(o.email ?? "").toLowerCase().includes(s) ||
        String(o.company ?? "").toLowerCase().includes(s),
    )
  }, [owners, q])

  // 🔥 Fungsi delete yang dipanggil dari AlertDialogAction
  const deleteOwner = async (id: number) => {
    const o = owners.find((x) => x.id === id)
    const prev = owners

    // optimistic update
    setOwners((p) => p.filter((x) => x.id !== id))

    try {
      const token = localStorage.getItem("token")
      await axios.delete(`${API_BASE}/project-owners/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      toast.success("Owner terhapus", {
        description: `${o?.name ?? "Owner"} berhasil dihapus.`,
      })
    } catch (err: any) {
      setOwners(prev)
      const msg = err?.response?.data?.message || "Gagal menghapus owner."
      setError(msg)
      toast.error("Gagal menghapus owner", {
        description: msg,
      })
    }
  }

  const colSpan = Object.values(cols).filter(Boolean).length || 7

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
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold">Project Owners</h1>
                      <p className="text-muted-foreground pt-2">
                        Daftar pemilik/project owner
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate("/admin/dashboard/project-owners/create")
                        }
                        className="cursor-pointer"
                      >
                        <IconPlus className="mr-2 h-4 w-4" />
                        Add Owner
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="px-4 lg:px-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Input
                      placeholder="Filter by name, email or company..."
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      className="w-80"
                    />
                    <div className="ml-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <IconLayoutGrid className="h-4 w-4" />
                            <span>Columns</span>
                            <IconChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuCheckboxItem
                            checked={cols.id}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, id: !!v }))
                            }
                          >
                            ID
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.name}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, name: !!v }))
                            }
                          >
                            Name
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.company}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, company: !!v }))
                            }
                          >
                            Company
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.email}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, email: !!v }))
                            }
                          >
                            Email
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.phone}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, phone: !!v }))
                            }
                          >
                            Phone
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.address}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, address: !!v }))
                            }
                          >
                            Address
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.actions}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, actions: !!v }))
                            }
                          >
                            Actions
                          </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded border">
                    <table className="min-w-full text-sm">
                      <thead className="bg-muted/50 ">
                        <tr className="text-center">
                          {cols.id && (
                            <th className="px-4 py-3 font-medium">ID</th>
                          )}
                          {cols.name && (
                            <th className="px-4 py-3 font-medium">Name</th>
                          )}
                          {cols.company && (
                            <th className="px-4 py-3 font-medium">Company</th>
                          )}
                          {cols.email && (
                            <th className="px-4 py-3 font-medium">Email</th>
                          )}
                          {cols.phone && (
                            <th className="px-4 py-3 font-medium">Phone</th>
                          )}
                          {cols.address && (
                            <th className="px-4 py-3 font-medium">Address</th>
                          )}
                          {cols.actions && (
                            <th className="px-4 py-3 font-medium ">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td
                              colSpan={colSpan}
                              className="px-4 py-6 text-center"
                            >
                              Memuat data...
                            </td>
                          </tr>
                        ) : error ? (
                          <tr>
                            <td
                              colSpan={colSpan}
                              className="px-4 py-6 text-center text-red-600"
                            >
                              {error}
                            </td>
                          </tr>
                        ) : (
                          filtered.map((o) => (
                            <tr key={o.id} className="border-t text-center">
                              {cols.id && (
                                <td className="px-4 py-3">{o.id}</td>
                              )}
                              {cols.name && (
                                <td className="px-4 py-3">{o.name}</td>
                              )}
                              {cols.company && (
                                <td className="px-4 py-3">
                                  <Badge variant="secondary">
                                    {o.company || "-"}
                                  </Badge>
                                </td>
                              )}
                              {cols.email && (
                                <td className="px-4 py-3">{o.email}</td>
                              )}
                              {cols.phone && (
                                <td className="px-4 py-3">
                                  {o.phone || "-"}
                                </td>
                              )}
                              {cols.address && (
                                <td className="px-4 py-3">
                                  {o.address || "-"}
                                </td>
                              )}
                              {cols.actions && (
                                <td className="px-4 py-3 ">
                                  <div className="flex items-center justify-center  gap-2">
                                    <Link
                                      to={`/admin/dashboard/project-owners/view/${o.id}`}
                                      className="px-2 py-1 rounded "
                                    >
                                      <IconEye className="h-4 w-4" />
                                    </Link>
                                    <Link
                                      to={`/admin/dashboard/project-owners/edit/${o.id}`}
                                      className="px-2 py-1 rounded "
                                    >
                                      <IconEdit className="h-4 w-4" />
                                    </Link>

                                    {/* 🔻 Delete pakai AlertDialog + toast */}
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <button
                                          className="px-2 py-1 rounded text-red-600 cursor-pointer "
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <IconTrash className="h-4 w-4" />
                                        </button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Hapus project owner?
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Yakin ingin menghapus{" "}
                                            <span className="font-semibold">
                                              {o.name}
                                            </span>
                                            ? Tindakan ini tidak dapat
                                            dikembalikan.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Batal
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-600 hover:bg-red-700"
                                            onClick={() => deleteOwner(o.id)}
                                          >
                                            Hapus
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    {!loading && filtered.length === 0 && (
                      q.trim() !== "" ? (
                        <Card className="bg-background border-t">
                          <div className="flex items-center gap-3 p-4 border-b">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                              <svg
                                viewBox="0 0 24 24"
                                className="h-5 w-5 text-muted-foreground"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                                />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">
                                Hasil Pencarian
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Tidak ditemukan hasil untuk{" "}
                                <span className="font-medium text-foreground">
                                  “{q}”
                                </span>
                                .
                              </p>
                            </div>
                          </div>
                          <div className="p-6">
                            <p className="text-sm text-muted-foreground">
                              Periksa ejaan kata kunci atau coba gunakan kata
                              kunci yang lebih umum.
                            </p>
                            <div className="mt-4 flex gap-3">
                              <Button
                                variant="outline"
                                onClick={() => setQ("")}
                              >
                                Bersihkan Pencarian
                              </Button>
                              <Button
                                onClick={() =>
                                  navigate(
                                    "/admin/dashboard/project-owners/create",
                                  )
                                }
                              >
                                Tambah Project Owner
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ) : (
                        <Card className="bg-background border-t">
                          <div className="flex items-center gap-3 p-4 border-b">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                              <svg
                                viewBox="0 0 24 24"
                                className="h-5 w-5 text-muted-foreground"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16 14a4 4 0 10-8 0m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2v-2m12 4v-6a2 2 0 00-2-2h-1M5 18v-6a2 2 0 012-2h1"
                                />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">
                                Data Project Owner
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Belum ada data yang ditampilkan.
                              </p>
                            </div>
                          </div>
                          <div className="p-6">
                            <p className="text-sm text-muted-foreground">
                              Tambahkan project owner untuk mulai mengelola
                              kepemilikan dan akses proyek.
                            </p>
                            <div className="mt-4">
                              <Button
                                onClick={() =>
                                  navigate(
                                    "/admin/dashboard/project-owners/create",
                                  )
                                }
                              >
                                Tambah Project Owner
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
