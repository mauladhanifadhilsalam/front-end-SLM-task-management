"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { useNavigate, Link } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import * as React from "react"
import axios from "axios"
import {
  IconLayoutGrid,
  IconChevronDown,
  IconRefresh,
  IconEye,
  IconPlus,
  IconEdit,
  IconTrash,
  IconReload,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER" | "USER" | string
type NotificationState = "READ" | "UNREAD" | string
type NotificationTargetType =
  | "COMMENT"
  | "TICKET"
  | "SYSTEM"
  | "STATUS"
  | "PROJECT"
  | string
type NotifyStatusType = "PENDING" | "SENT" | "FAILED" | string | null

type Recipient = {
  id: number
  fullName: string
  email: string
  role: Role
}

export type Notification = {
  id: number
  recipientId: number
  targetType: NotificationTargetType
  targetId: number
  message: string
  subject?: string | null
  emailFrom?: string | null
  emailReplyTo?: string | null
  state: NotificationState
  createdAt: string
  readAt: string | null
  status: NotifyStatusType
  sentAt: string | null
  emailError: string | null
  recipient?: Recipient
}

export default function AdminNotification() {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string>("")
  const [search, setSearch] = React.useState<string>("")
  const [stateFilter, setStateFilter] = React.useState<string>("all")
  const [cols, setCols] = React.useState({
    id: true,
    subject: true,
    message: true,
    target: true,
    recipient: true,
    state: true,
    emailInfo: true,
    emailStatus: true,
    createdAt: true,
    readAt: true,
    actions: true,
  })

  // state untuk AlertDialog delete
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<number | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE
  const navigate = useNavigate()

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError("")

      const token = localStorage.getItem("token")
      const res = await axios.get<Notification[]>(`${API_BASE}/notifications`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      const data = Array.isArray(res.data)
        ? res.data
        : ((res.data as any)?.data as Notification[]) || []
      setNotifications(data)
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Gagal memuat data notifikasi"
      setError(msg)
      toast.error("Gagal memuat notifikasi", { description: msg })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchNotifications()
  }, [])

  const filteredNotifications = React.useMemo(() => {
    const ql = search.trim().toLowerCase()

    const filtered = notifications.filter((n) => {
      if (stateFilter !== "all" && n.state !== stateFilter) return false
      if (!ql) return true

      return (
        n.message.toLowerCase().includes(ql) ||
        (n.subject ?? "").toLowerCase().includes(ql) ||
        n.targetType.toLowerCase().includes(ql) ||
        String(n.targetId).includes(ql) ||
        n.recipient?.fullName?.toLowerCase().includes(ql) ||
        n.recipient?.email?.toLowerCase().includes(ql) ||
        (n.emailFrom ?? "").toLowerCase().includes(ql) ||
        (n.emailReplyTo ?? "").toLowerCase().includes(ql)
      )
    })

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }, [notifications, search, stateFilter])

  const formatDate = (value: string | null) => {
    if (!value) return "-"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return "-"
    return d.toLocaleString("id-ID")
  }

  const stateBadgeVariant = (
    state: NotificationState,
  ): "default" | "outline" | "secondary" => {
    if (state === "UNREAD") return "default"
    if (state === "READ") return "outline"
    return "secondary"
  }

  const stateLabel = (state: NotificationState) => {
    if (state === "UNREAD") return "UNREAD"
    if (state === "READ") return "READ"
    return state
  }

  const notifyStatusVariant = (
    status: NotifyStatusType,
  ): "default" | "outline" | "secondary" | "destructive" => {
    if (status === "PENDING") return "secondary"
    if (status === "SENT") return "default"
    if (status === "FAILED") return "destructive"
    return "outline"
  }

  const notifyStatusLabel = (status: NotifyStatusType) => {
    if (!status) return "-"
    return status
  }

  const targetLabel = (type: NotificationTargetType, id: number) =>
    `${type} #${id}`

  // buka dialog delete
  const handleDelete = (id: number) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  // eksekusi delete setelah konfirmasi
  const confirmDelete = async () => {
    if (!deletingId) return

    const prev = notifications
    const target = notifications.find((n) => n.id === deletingId)

    setDeleting(true)
    setNotifications((current) => current.filter((n) => n.id !== deletingId))

    try {
      const token = localStorage.getItem("token")
      await axios.delete(`${API_BASE}/notifications/${deletingId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      toast.success(`Notifikasi #${deletingId} berhasil dihapus`, {
        description: target?.subject || target?.message?.slice(0, 80),
      })
    } catch (e: any) {
      setNotifications(prev)
      const msg = e?.response?.data?.message || "Gagal menghapus notifikasi"
      toast.error("Gagal menghapus notifikasi", { description: msg })
    } finally {
      setDeleting(false)
      setDeletingId(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleResend = async (notification: Notification) => {
    try {
      const token = localStorage.getItem("token")

      const res = await axios.post<Notification>(
        `${API_BASE}/notifications/${notification.id}/resend`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      )

      const updated = res.data

      setNotifications((current) =>
        current.map((n) => (n.id === updated.id ? { ...n, ...updated } : n)),
      )

      toast.success("Email notifikasi berhasil dikirim ulang", {
        description: updated.subject || updated.message?.slice(0, 80),
      })
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || "Gagal mengirim ulang email notifikasi"
      toast.error("Gagal mengirim ulang notifikasi", { description: msg })
    }
  }

  return (
    <>
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

          <main className="flex flex-col flex-1 p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
                  Daftar Notifikasi
                </h1>
                <p className="text-sm text-muted-foreground">
                  Lihat semua notifikasi sistem untuk pengguna.
                </p>
              </div>
            </div>

            {/* Filter & Controls */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col w-full gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Input
                  placeholder="Cari pesan, subject, email, target, atau penerima..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-80"
                />
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter status baca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ALL</SelectItem>
                    <SelectItem value="UNREAD">UNREAD</SelectItem>
                    <SelectItem value="READ">READ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="self-start md:self-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
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
            </div>

            {/* Error / empty state */}
            {error && !loading && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {!loading && !error && filteredNotifications.length === 0 && (
              <div className="rounded-md border px-4 py-6 text-sm text-muted-foreground text-center">
                Tidak ada data notifikasi.
              </div>
            )}

            {/* Table */}
            {!loading && !error && filteredNotifications.length > 0 && (
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full min-w-[700px] md:min-w-[1100px] text-sm">
                  <thead className="bg-muted/50 text-center">
                    <tr>
                      {cols.id && (
                        <th className="px-4 py-3 font-medium hidden md:table-cell">
                          ID
                        </th>
                      )}
                      {cols.subject && (
                        <th className="px-4 py-3 font-medium">Subject</th>
                      )}
                      {cols.message && (
                        <th className="px-4 py-3 font-medium">Pesan</th>
                      )}
                      {cols.target && (
                        <th className="px-4 py-3 font-medium hidden lg:table-cell">
                          Target
                        </th>
                      )}
                      {cols.recipient && (
                        <th className="px-4 py-3 font-medium">Penerima</th>
                      )}
                      {cols.state && (
                        <th className="px-4 py-3 font-medium hidden sm:table-cell">
                          Status Baca
                        </th>
                      )}
                      {cols.emailStatus && (
                        <th className="px-4 py-3 font-medium hidden sm:table-cell">
                          Status Pengiriman
                        </th>
                      )}
                      {cols.createdAt && (
                        <th className="px-4 py-3 font-medium hidden lg:table-cell">
                          Dikirim
                        </th>
                      )}
                      {cols.readAt && (
                        <th className="px-4 py-3 font-medium hidden lg:table-cell">
                          Dibaca
                        </th>
                      )}
                      {cols.actions && (
                        <th className="px-4 py-3 font-medium">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotifications.map((n) => (
                      <tr
                        key={n.id}
                        className="border-t text-center align-top"
                      >
                        {cols.id && (
                          <td className="px-4 py-3 hidden md:table-cell">
                            {n.id}
                          </td>
                        )}

                        {cols.subject && (
                          <td className="px-4 py-3 text-left align-top max-w-[160px] md:max-w-xs">
                            <div className="font-medium text-sm md:text-base line-clamp-2 break-words">
                              {n.subject || "(no subject)"}
                            </div>
                          </td>
                        )}

                        {cols.message && (
                          <td className="px-4 py-3 text-left align-top max-w-[200px] md:max-w-md">
                            <div className="text-xs md:text-sm line-clamp-3 break-words">
                              {n.message}
                            </div>
                            {n.emailError && (
                              <div className="text-xs text-red-600 mt-1 break-words">
                                Error email: {n.emailError}
                              </div>
                            )}
                          </td>
                        )}

                        {cols.target && (
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {targetLabel(n.targetType, n.targetId)}
                          </td>
                        )}

                        {cols.recipient && (
                          <td className="px-4 py-3 text-left align-top">
                            {n.recipient ? (
                              <>
                                <div className="font-medium line-clamp-1 break-words">
                                  {n.recipient.fullName}
                                </div>
                                <div className="text-xs text-muted-foreground line-clamp-1 break-words">
                                  {n.recipient.email}
                                </div>
                                <div className="mt-1">
                                  <Badge
                                    variant="outline"
                                    className="uppercase"
                                  >
                                    {n.recipient.role}
                                  </Badge>
                                </div>
                              </>
                            ) : (
                              "-"
                            )}
                          </td>
                        )}

                        {cols.state && (
                          <td className="px-4 py-3 hidden sm:table-cell align-top">
                            <Badge variant={stateBadgeVariant(n.state)}>
                              {stateLabel(n.state)}
                            </Badge>
                          </td>
                        )}

                        {cols.emailStatus && (
                          <td className="px-4 py-3 hidden sm:table-cell align-center">
                            <Badge variant={notifyStatusVariant(n.status)}>
                              {notifyStatusLabel(n.status)}
                            </Badge>
                          </td>
                        )}

                        {cols.createdAt && (
                          <td className="px-4 py-3 hidden sm:table-cell align-top">
                            {formatDate(n.createdAt)}
                          </td>
                        )}

                        {cols.readAt && (
                          <td className="px-4 py-3 hidden lg:table-cell align-top">
                            {formatDate(n.readAt)}
                          </td>
                        )}

                        {cols.actions && (
                          <td className="px-4 py-3 align-top">
                            <div className="flex justify-center md:justify-start items-center flex-w gap-2">
                              <Link
                                to={`/admin-dashboard/notifications/view/${n.id}`}
                              >
                                <IconEye className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(n.id)}
                                className="text-red-600 hover:text-red-700 cursor-pointer"
                              >
                                <IconTrash className="h-4 w-4" />
                              </button>

                              {n.status === "FAILED" && (
                                <button
                                  onClick={() => handleResend(n)}
                                  className="text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
                                >
                                  <IconReload className="h-4 w-4" />
                                  <span className="text-xs">Resend</span>
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {loading && (
              <div className="rounded-md border px-4 py-6 text-sm text-muted-foreground">
                Memuat data...
              </div>
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>

      {/* AlertDialog konfirmasi hapus */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus notifikasi?</AlertDialogTitle>
            <AlertDialogDescription>
              Notifikasi yang dihapus akan hilang secara permanen dan tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
