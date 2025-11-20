"use client"

import * as React from "react"
import axios from "axios"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  IconLayoutGrid,
  IconChevronDown,
  IconTrash,
  IconReload,
} from "@tabler/icons-react"
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

export type ActivityLog = {
  id: number
  userId: number
  action: string
  targetType: string
  targetId: number
  details: any
  occurredAt: string
  user: {
    id: number
    fullName: string
    email: string
    role: string
  }
}

const API_BASE = import.meta.env.VITE_API_BASE

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = React.useState<ActivityLog[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [search, setSearch] = React.useState("")

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [logToDelete, setLogToDelete] = React.useState<ActivityLog | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const [cols, setCols] = React.useState({
    id: true,
    action: true,
    user: true,
    role: true,
    targetType: true,
    targetId: true,
    details: true,
    occurredAt: true,
    actions: true,
  })

  const getAuthHeaders = React.useCallback(() => {
    const token = localStorage.getItem("token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }, [])

  const normalizeArray = (raw: any): any[] => {
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw?.data)) return raw.data
    if (Array.isArray(raw?.items)) return raw.items
    if (Array.isArray(raw?.logs)) return raw.logs
    if (Array.isArray(raw?.data?.logs)) return raw.data.logs
    if (raw && typeof raw === "object") return [raw]
    return []
  }

  const fetchLogs = React.useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await axios.get(`${API_BASE}/activity-logs`, {
        headers: getAuthHeaders(),
      })

      const list = normalizeArray(res?.data).map(
        (item: any): ActivityLog => ({
          id: Number(item.id),
          userId: Number(item.userId ?? item.user_id ?? item.user?.id ?? 0),
          action: String(item.action ?? ""),
          targetType: String(item.targetType ?? item.target_type ?? "-"),
          targetId: Number(item.targetId ?? item.target_id ?? 0),
          details: item.details ?? {},
          occurredAt: String(
            item.occurredAt ?? item.occurred_at ?? item.createdAt ?? item.created_at ?? new Date().toISOString(),
          ),
          user: {
            id: Number(item.user?.id ?? item.userId ?? item.user_id ?? 0),
            fullName:
              item.user?.fullName ??
              item.user?.name ??
              "Unknown User",
            email: item.user?.email ?? "-",
            role: item.user?.role ?? "-",
          },
        }),
      ) as ActivityLog[]

      // urut terbaru di atas
      list.sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() -
          new Date(a.occurredAt).getTime(),
      )

      setLogs(list)
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Gagal memuat data."
      setError(msg)
      toast.error("Gagal memuat activity logs", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  React.useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const openDeleteDialog = (log: ActivityLog) => {
    setLogToDelete(log)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteLog = async () => {
    if (!logToDelete) return

    setIsDeleting(true)
    const prev = logs
    setLogs((p) => p.filter((l) => l.id !== logToDelete.id))

    try {
      await axios.delete(`${API_BASE}/activity-logs/${logToDelete.id}`, {
        headers: getAuthHeaders(),
      })

      toast.success("Log berhasil dihapus", {
        description: `ID: ${logToDelete.id} • ${logToDelete.action}`,
      })

      setIsDeleteDialogOpen(false)
      setLogToDelete(null)
    } catch (e: any) {
      setLogs(prev)
      const msg = e?.response?.data?.message || "Gagal menghapus log."
      setError(msg)
      toast.error("Gagal menghapus log", { description: msg })
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase()
    if (!q) return true
    return (
      log.action.toLowerCase().includes(q) ||
      log.targetType.toLowerCase().includes(q) ||
      log.user.fullName.toLowerCase().includes(q) ||
      log.user.email.toLowerCase().includes(q) ||
      log.user.role.toLowerCase().includes(q)
    )
  })

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const actionVariant = (action: string) => {
    const upper = action.toUpperCase()
    if (upper.includes("AUTH")) return "secondary"
    if (upper.includes("DELETE")) return "destructive"
    if (upper.includes("UPDATE")) return "default"
    if (upper.includes("CREATE")) return "success"
    return "outline"
  }

  const visibleColCount = Object.values(cols).filter(Boolean).length

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
                {/* Header */}
                <div className="px-4 lg:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold">
                        Activity Logs
                      </h1>
                      <p className="text-muted-foreground">
                        Riwayat aktivitas pengguna di seluruh sistem.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchLogs}
                        className="cursor-pointer"
                        title="Refresh"
                      >
                        <IconReload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Toolbar (filter + columns) */}
                <div className="px-4 lg:px-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <Input
                      placeholder="Cari action, user, email, role, atau target..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full md:w-[28rem]"
                    />
                    <div className="flex items-center gap-2 md:ml-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <IconLayoutGrid className="h-4 w-4" />
                            <span>Colums</span>
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
                            NO
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.action}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, action: !!v }))
                            }
                          >
                            Action
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.user}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, user: !!v }))
                            }
                          >
                            User
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.role}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, role: !!v }))
                            }
                          >
                            Role
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.targetType}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, targetType: !!v }))
                            }
                          >
                            Target Type
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.targetId}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, targetId: !!v }))
                            }
                          >
                            Target ID
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.details}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, details: !!v }))
                            }
                          >
                            Details
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.occurredAt}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, occurredAt: !!v }))
                            }
                          >
                            Occurred At
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
                </div>

                {/* Table */}
                <div className="px-4 lg:px-6">
                  <Card className="rounded-md border overflow-x-auto">
                    <table className="min-w-full divide-y divide-border text-sm">
                      <thead className="bg-muted/50">
                        <tr className="text-left">
                          {cols.id && (
                            <th className="px-4 py-3 font-medium whitespace-nowrap">
                              NO
                            </th>
                          )}
                          {cols.action && (
                            <th className="px-4 py-3 font-medium whitespace-nowrap">
                              Action
                            </th>
                          )}
                          {cols.user && (
                            <th className="px-4 py-3 font-medium whitespace-nowrap">
                              User
                            </th>
                          )}
                          {cols.role && (
                            <th className="px-4 py-3 font-medium whitespace-nowrap">
                              Role
                            </th>
                          )}
                          {cols.targetType && (
                            <th className="px-4 py-3 font-medium whitespace-nowrap">
                              Target Type
                            </th>
                          )}
                          {cols.targetId && (
                            <th className="px-4 py-3 font-medium whitespace-nowrap">
                              Target ID
                            </th>
                          )}
                          {cols.details && (
                            <th className="px-4 py-3 font-medium whitespace-nowrap">
                              Details
                            </th>
                          )}
                          {cols.occurredAt && (
                            <th className="px-4 py-3 font-medium whitespace-nowrap">
                              Occurred At
                            </th>
                          )}
                          {cols.actions && (
                            <th className="px-4 py-3 font-medium whitespace-nowrap">
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-background">
                        {loading ? (
                          <tr>
                            <td
                              colSpan={visibleColCount || 1}
                              className="px-4 py-6 text-center"
                            >
                              Memuat data...
                            </td>
                          </tr>
                        ) : error ? (
                          <tr>
                            <td
                              colSpan={visibleColCount || 1}
                              className="px-4 py-6 text-center text-red-600"
                            >
                              {error}
                            </td>
                          </tr>
                        ) : filteredLogs.length === 0 ? (
                          <tr>
                            <td
                              colSpan={visibleColCount || 1}
                              className="px-4 py-6 text-center text-muted-foreground"
                            >
                              Tidak ada data.
                            </td>
                          </tr>
                        ) : (
                          filteredLogs.map((log) => (
                            <tr key={log.id} className="align-top">
                              {cols.id && (
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {log.id}
                                </td>
                              )}

                              {cols.action && (
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <Badge variant={actionVariant(log.action) as any}>
                                    {log.action}
                                  </Badge>
                                </td>
                              )}

                              {cols.user && (
                                <td className="px-4 py-3 min-w-[180px]">
                                  <div className="font-medium">
                                    {log.user.fullName}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {log.user.email}
                                  </div>
                                </td>
                              )}

                              {cols.role && (
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <Badge variant="outline" className="uppercase">
                                    {log.user.role}
                                  </Badge>
                                </td>
                              )}

                              {cols.targetType && (
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {log.targetType}
                                </td>
                              )}

                              {cols.targetId && (
                                <td className="px-4 py-3 whitespace-nowrap">
                                  #{log.targetId}
                                </td>
                              )}

                              {cols.details && (
                                <td className="px-4 py-3 max-w-[260px]">
                                  <div className="space-y-0.5">
                                    {Object.entries(log.details || {}).map(
                                      ([key, value]) => (
                                        <div
                                          key={key}
                                          className="text-xs truncate"
                                          title={`${key}: ${String(value)}`}
                                        >
                                          <span className="font-medium">
                                            {key}:{" "}
                                          </span>
                                          {String(value)}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </td>
                              )}

                              {cols.occurredAt && (
                                <td className="px-4 py-3 whitespace-nowrap text-xs md:text-sm">
                                  {formatDate(log.occurredAt)}
                                </td>
                              )}

                              {cols.actions && (
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openDeleteDialog(log)}
                                    className="text-red-500 hover:text-red-600"
                                  >
                                    <IconTrash className="h-4 w-4" />
                                  </Button>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* AlertDialog konfirmasi hapus */}
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={(open) => {
              if (!open && !isDeleting) {
                setIsDeleteDialogOpen(false)
                setLogToDelete(null)
              }
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus activity log?</AlertDialogTitle>
                <AlertDialogDescription>
                  Log yang dihapus akan hilang secara permanen dan tidak dapat dikembalikan.
                </AlertDialogDescription>
              </AlertDialogHeader>

              {logToDelete && (
                <div className="mb-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 px-3 py-2 text-xs">
                  <p><span className="font-semibold">ID:</span> {logToDelete.id}</p>
                  <p><span className="font-semibold">Action:</span> {logToDelete.action}</p>
                  <p><span className="font-semibold">User:</span> {logToDelete.user.fullName}</p>
                </div>
              )}

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Batal
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteLog}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Menghapus..." : "Hapus"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
