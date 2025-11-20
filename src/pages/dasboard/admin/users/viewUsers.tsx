import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import * as React from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import axios from "axios"
import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Role = "admin" | "project_manager" | "developer"

type User = {
  id: number
  fullName: string
  email: string
  role: Role
  createdAt: string
}

const API_BASE = import.meta.env.VITE_API_BASE

export default function ViewUser() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string>("")
  const [deleting, setDeleting] = React.useState(false)

  const fetchUser = React.useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get(`${API_BASE}/users/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      const d: any = res.data?.data ?? res.data
      const normalized: User = {
        id: Number(d.id),
        fullName: d.fullName ?? d.name ?? d.full_name ?? "",
        email: d.email ?? "",
        role: (d.role as Role) ?? (d.user_role as Role) ?? "developer",
        createdAt: d.createdAt ?? d.created_at ?? new Date().toISOString(),
      }
      setUser(normalized)
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Gagal memuat data user"
      setError(msg)
      toast.error("Gagal memuat user", {
        description: msg,
      })
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleConfirmDelete = async () => {
    if (!user) return
    setDeleting(true)
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`${API_BASE}/users/${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      toast.success("User dihapus", {
        description: `User "${user.fullName}" berhasil dihapus.`,
      })

      navigate("/admin/dashboard/users")
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Gagal menghapus user"
      setError(msg)
      toast.error("Gagal menghapus user", {
        description: msg,
      })
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (iso?: string) => {
    if (!iso) return "-"
    try {
      return new Date(iso).toLocaleString("id-ID")
    } catch {
      return iso
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
                    <div className="ml-auto flex items-center gap-2">
                      {user && (
                        <Link to={`/admin/dashboard/users/edit/${user.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <IconEdit className="h-4 w-4" />
                            Edit
                          </Button>
                        </Link>
                      )}

                      {/* AlertDialog untuk konfirmasi delete */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex items-center gap-2"
                            disabled={!user || deleting}
                          >
                            <IconTrash className="h-4 w-4" />
                            {deleting ? "Menghapus..." : "Delete"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus user?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {user
                                ? `Yakin ingin menghapus user "${user.fullName}"? Tindakan ini tidak dapat dikembalikan.`
                                : "Yakin ingin menghapus user ini? Tindakan ini tidak dapat dikembalikan."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleting}>
                              Batal
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleConfirmDelete}
                              disabled={deleting}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deleting ? "Menghapus..." : "Ya, hapus"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <h1 className="text-2xl font-semibold">Detail User</h1>
                  <p className="text-muted-foreground">
                    Lihat informasi lengkap user.
                  </p>
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
                    <div className="rounded border p-6 text-red-600">
                      {error}
                    </div>
                  ) : !user ? (
                    <div className="rounded border p-6">
                      User tidak ditemukan.
                    </div>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>{user.fullName || "-"}</CardTitle>
                        <CardDescription>
                          Informasi akun dan meta
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">
                              ID
                            </div>
                            <div className="font-medium">{user.id}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Role
                            </div>
                            <div className="mt-1">
                              <Badge className="capitalize">
                                {user.role.replace("_", " ")}
                              </Badge>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground">
                              Email
                            </div>
                            <div className="font-medium">{user.email}</div>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground">
                              Dibuat
                            </div>
                            <div className="font-medium">
                              {formatDate(user.createdAt)}
                            </div>
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
  )
}
