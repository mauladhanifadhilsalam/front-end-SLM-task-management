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
  IconPlus,
  IconTrash,
  IconEye,
  IconReload,
  IconChevronLeft,
  IconChevronRight,
  IconEdit,
} from "@tabler/icons-react"

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

const API_BASE = import.meta.env.VITE_API_BASE

type UserLite = {
  id: number
  fullName?: string
  name?: string
  email?: string
  role?: string
}

type TicketLite = {
  id: number
  title?: string
  project?: { id: number; name?: string } | null
}

type AdminComment = {
  id: number
  ticketId: number
  userId: number
  message: string
  createdAt: string
  user?: UserLite | null
  ticket?: TicketLite | null
}

const fmtHuman = (iso?: string | null) => {
  if (!iso) return "-"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return "-"
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const s = Math.floor(diffMs / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const days = Math.floor(h / 24)
  if (s < 60) return "baru saja"
  if (m < 60) return `${m} menit lalu`
  if (h < 24) return `${h} jam lalu`
  if (days === 1) return "kemarin"
  if (days < 7) return `${days} hari lalu`
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`
  if (days < 365) return `${Math.floor(days / 30)} bulan lalu`
  return `${Math.floor(days / 365)} tahun lalu`
}

export default function AdminComments() {
  const navigate = useNavigate()

  const [rows, setRows] = React.useState<AdminComment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  // query/filter & columns
  const [q, setQ] = React.useState("")
  const [cols, setCols] = React.useState({
    sel: true, // kolom checkbox
    id: true,
    ticket: true,
    user: true,
    message: true,
    created: true,
    actions: true,
  })

  // pagination
  const [page, setPage] = React.useState(1) // 1-based
  const [rowsPerPage, setRowsPerPage] = React.useState(10)

  // selection
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set())

  const tokenHeader = React.useMemo(() => {
    const token = localStorage.getItem("token")
    return token ? { Authorization: `Bearer ${token}` } : undefined
  }, [])

  const normalizeToArray = (raw: any): any[] => {
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw?.data)) return raw.data
    if (Array.isArray(raw?.items)) return raw.items
    if (Array.isArray(raw?.comments)) return raw.comments
    if (Array.isArray(raw?.data?.items)) return raw.data.items
    if (Array.isArray(raw?.data?.comments)) return raw.data.comments
    if (raw && typeof raw === "object") return [raw]
    return []
  }

  const fetchComments = React.useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await axios.get(`${API_BASE}/comments`, { headers: tokenHeader })
      const candidate = normalizeToArray(res?.data)

      const list: AdminComment[] = candidate.map((c: any): AdminComment => ({
        id: Number(c.id),
        ticketId: Number(c.ticketId ?? c.ticket_id ?? c.ticket?.id ?? 0),
        userId: Number(c.userId ?? c.user_id ?? c.user?.id ?? 0),
        message: String(c.message ?? ""),
        createdAt: String(
          c.createdAt ?? c.created_at ?? new Date().toISOString(),
        ),
        user: c.user
          ? {
              id: Number(c.user.id),
              fullName: c.user.fullName ?? c.user.name ?? undefined,
              name: c.user.name ?? undefined,
              email: c.user.email ?? undefined,
              role: c.user.role ?? undefined,
            }
          : null,
        ticket: c.ticket
          ? {
              id: Number(c.ticket.id),
              title: c.ticket.title ?? undefined,
              project: c.ticket.project
                ? {
                    id: Number(c.ticket.project.id),
                    name: c.ticket.project.name ?? undefined,
                  }
                : null,
            }
          : { id: Number(c.ticketId ?? c.ticket_id ?? 0) },
      }))

      // urut terbaru di atas
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      setRows(list)
      setSelectedIds(new Set()) // reset selection saat refresh
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load comments")
    } finally {
      setLoading(false)
    }
  }, [tokenHeader])

  React.useEffect(() => {
    fetchComments()
  }, [fetchComments])

  // filter
  const filtered = React.useMemo(() => {
    const query = q.toLowerCase().trim()
    if (!query) return rows
    return rows.filter((c) => {
      const tId = String(c.ticketId)
      const tTitle = c.ticket?.title?.toLowerCase() ?? ""
      const pName = c.ticket?.project?.name?.toLowerCase() ?? ""
      const msg = c.message.toLowerCase()
      const uname =
        c.user?.fullName?.toLowerCase() ?? c.user?.name?.toLowerCase() ?? ""
      const uemail = c.user?.email?.toLowerCase() ?? ""
      const urole = c.user?.role?.toLowerCase() ?? ""

      return (
        msg.includes(query) ||
        uname.includes(query) ||
        uemail.includes(query) ||
        urole.includes(query) ||
        tId.includes(query) ||
        tTitle.includes(query) ||
        pName.includes(query)
      )
    })
  }, [rows, q])

  // clamp page saat filter/rowsPerPage berubah
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages)
    if (page < 1) setPage(1)
  }, [page, totalPages])

  const pageStart = (page - 1) * rowsPerPage
  const pageEnd = pageStart + rowsPerPage
  const pageRows = filtered.slice(pageStart, pageEnd)

  // selection helpers
  const isRowSelected = (id: number) => selectedIds.has(id)
  const toggleRow = (id: number) =>
    setSelectedIds((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const currentPageAllSelected =
    pageRows.length > 0 && pageRows.every((r) => selectedIds.has(r.id))

  const toggleSelectAllOnPage = () =>
    setSelectedIds((prev) => {
      const n = new Set(prev)
      if (currentPageAllSelected) {
        pageRows.forEach((r) => n.delete(r.id))
      } else {
        pageRows.forEach((r) => n.add(r.id))
      }
      return n
    })

  const clearSelection = () => setSelectedIds(new Set())

  // 🔥 Delete comment pakai AlertDialog + toast
  const handleDelete = async (id: number) => {
    const target = rows.find((x) => x.id === id)
    const prev = rows

    // optimistic update
    setRows((p) => p.filter((x) => x.id !== id))
    setSelectedIds((s) => {
      const n = new Set(s)
      n.delete(id)
      return n
    })

    try {
      await axios.delete(`${API_BASE}/comments/${id}`, { headers: tokenHeader })
      toast.success("Comment deleted", {
        description: target?.message
          ? `“${target.message.slice(0, 60)}${target.message.length > 60 ? "..." : ""}”`
          : `Comment #${id} berhasil dihapus.`,
      })
    } catch (err: any) {
      setRows(prev)
      const msg = err?.response?.data?.message || "Failed to delete comment"
      setError(msg)
      toast.error("Failed to delete comment", {
        description: msg,
      })
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
                {/* Header */}
                <div className="px-4 lg:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold">
                        Ticket Comments
                      </h1>
                      <p className="text-muted-foreground">
                        Manage all ticket comments across projects
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchComments()}
                        className="cursor-pointer"
                        title="Refresh"
                      >
                        <IconReload className="h-4 w-4" />
                      </Button>
                      {/* Add Comment */}
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate("/admin/dashboard/comments/create")
                        }
                        className="cursor-pointer"
                        title="Create a new comment"
                      >
                        <IconPlus className="mr-2 h-4 w-4" />
                        Add Comment
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Toolbar (filter + columns) */}
                <div className="px-4 lg:px-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Input
                      placeholder="Filter by message, user, email, role, ticket title/project…"
                      value={q}
                      onChange={(e) => {
                        setQ(e.target.value)
                        setPage(1) // balik ke page 1 saat filter
                      }}
                      className="w-[28rem]"
                    />
                    <div className="ml-auto flex items-center gap-2">
                      {selectedIds.size > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearSelection}
                          title="Clear selection"
                        >
                          Clear selection
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <IconLayoutGrid className="h-4 w-4" />
                            <span>Columns</span>
                            <IconChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuCheckboxItem
                            checked={cols.sel}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, sel: !!v }))
                            }
                          >
                            Selection
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.id}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, id: !!v }))
                            }
                          >
                            ID
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.ticket}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, ticket: !!v }))
                            }
                          >
                            Ticket
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
                            checked={cols.message}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, message: !!v }))
                            }
                          >
                            Message
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.created}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, created: !!v }))
                            }
                          >
                            Created
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

                  {/* Table */}
                  <Card className="rounded-md border overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted/50">
                        <tr className="text-left">
                          {cols.sel && (
                            <th className="px-4 py-3 text-sm font-medium">
                              <input
                                type="checkbox"
                                aria-label="Select all on this page"
                                checked={
                                  currentPageAllSelected &&
                                  pageRows.length > 0
                                }
                                onChange={toggleSelectAllOnPage}
                              />
                            </th>
                          )}
                          {cols.id && (
                            <th className="px-4 py-3 text-sm font-medium">
                              ID
                            </th>
                          )}
                          {cols.ticket && (
                            <th className="px-4 py-3 text-sm font-medium">
                              Ticket
                            </th>
                          )}
                          {cols.user && (
                            <th className="px-4 py-3 text-sm font-medium">
                              User
                            </th>
                          )}
                          {cols.message && (
                            <th className="px-4 py-3 text-sm font-medium">
                              Message
                            </th>
                          )}
                          {cols.created && (
                            <th className="px-4 py-3 text-sm font-medium">
                              Created
                            </th>
                          )}
                          {cols.actions && (
                            <th className="px-4 py-3 text-sm font-medium">
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-background">
                        {loading ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-4 py-6 text-center"
                            >
                              Loading...
                            </td>
                          </tr>
                        ) : error ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-4 py-6 text-center text-red-600"
                            >
                              {error}
                            </td>
                          </tr>
                        ) : pageRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-4 py-6 text-center text-muted-foreground"
                            >
                              No comments found
                            </td>
                          </tr>
                        ) : (
                          pageRows.map((c) => {
                            const uname =
                              c.user?.fullName ||
                              c.user?.name ||
                              c.user?.email ||
                              `User#${c.userId}`
                            const urole = c.user?.role
                            const tTitle =
                              c.ticket?.title ||
                              (c.ticket?.project?.name
                                ? `${c.ticket?.project?.name}`
                                : undefined)
                            return (
                              <tr key={c.id} className="align-top">
                                {cols.sel && (
                                  <td className="px-4 py-3">
                                    <input
                                      type="checkbox"
                                      aria-label={`Select row ${c.id}`}
                                      checked={isRowSelected(c.id)}
                                      onChange={() => toggleRow(c.id)}
                                    />
                                  </td>
                                )}
                                {cols.id && (
                                  <td className="px-4 py-3 text-sm">{c.id}</td>
                                )}
                                {cols.ticket && (
                                  <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">
                                        #{c.ticketId}
                                      </Badge>
                                      {tTitle && (
                                        <span className="text-muted-foreground">
                                          {tTitle}
                                        </span>
                                      )}
                                      <Link
                                        to={`/admin/dashboard/tickets/view/${
                                          c.ticket?.id ?? c.ticketId
                                        }`}
                                        title="View Ticket"
                                        className="ml-1 inline-flex"
                                      >
                                        <IconEye className="h-4 w-4" />
                                      </Link>
                                    </div>
                                  </td>
                                )}
                                {cols.user && (
                                  <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        {uname}
                                      </span>
                                      {urole && (
                                        <Badge
                                          variant="outline"
                                          className="uppercase"
                                        >
                                          {urole}
                                        </Badge>
                                      )}
                                    </div>
                                  </td>
                                )}
                                {cols.message && (
                                  <td className="px-4 py-3 text-sm whitespace-pre-wrap max-w-[520px]">
                                    {c.message}
                                  </td>
                                )}
                                {cols.created && (
                                  <td className="px-4 py-3 text-sm text-muted-foreground">
                                    {fmtHuman(c.createdAt)}
                                  </td>
                                )}
                                {cols.actions && (
                                  <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center gap-3">
                                      <Link
                                        to={`/admin/dashboard/comments/view/${c.id}`}
                                      >
                                        <IconEye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                      </Link>
                                      <Link
                                        to={`/admin/dashboard/comments/edit/${c.id}`}
                                      >
                                        <IconEdit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                      </Link>

                                      {/* 🔻 Delete pakai AlertDialog + toast */}
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <button
                                            className="text-red-600 cursor-pointer"
                                            title="Delete"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <IconTrash className="h-4 w-4" />
                                          </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>
                                              Delete comment?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Comment{" "}
                                              <span className="font-semibold">
                                                #{c.id}
                                              </span>{" "}
                                              akan dihapus secara permanen. Tindakan
                                              ini tidak dapat dibatalkan.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>
                                              Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              className="bg-red-600 hover:bg-red-700"
                                              onClick={() =>
                                                handleDelete(c.id)
                                              }
                                            >
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>

                    {/* Footer: selection + pagination */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 gap-3">
                      <div className="text-sm text-muted-foreground text-center sm:text-left">
                        {selectedIds.size} of {filtered.length} row(s) selected.
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Rows per page</span>
                          <select
                            className="h-9 rounded-md border bg-background px-2 text-sm"
                            value={rowsPerPage}
                            onChange={(e) => {
                              const v = Number(e.target.value) || 10
                              setRowsPerPage(v)
                              setPage(1)
                            }}
                          >
                            {[10, 25, 50, 100].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Pagination control */}
                        <div className="flex items-center gap-2 justify-center sm:justify-end w-full sm:w-auto">
                          <span className="text-sm">
                            Page {totalPages === 0 ? 0 : page} of {totalPages}
                          </span>
                          <div className="flex">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-r-none"
                              title="First page"
                              onClick={() => setPage(1)}
                              disabled={page <= 1}
                            >
                              «
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-none -ml-px"
                              title="Previous page"
                              onClick={() =>
                                setPage((p) => Math.max(1, p - 1))
                              }
                              disabled={page <= 1}
                            >
                              <IconChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-none -ml-px"
                              title="Next page"
                              onClick={() =>
                                setPage((p) =>
                                  Math.min(totalPages, p + 1),
                                )
                              }
                              disabled={page >= totalPages}
                            >
                              <IconChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-l-none -ml-px"
                              title="Last page"
                              onClick={() => setPage(totalPages)}
                              disabled={page >= totalPages}
                            >
                              »
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
                {/* End content */}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
