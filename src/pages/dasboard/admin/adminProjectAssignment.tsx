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
import { Badge } from "@/components/ui/badge"
import {
  IconLayoutGrid,
  IconChevronDown,
  IconPlus,
  IconTrash,
  IconEdit,
  IconEye,
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

type AssignmentStatus = "PLANNED" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | string

type ProjectAssignment = {
  id: number
  projectId?: number
  projectName?: string
  assigneeId?: number
  assigneeName?: string
  roleInProject?: string
  startDate?: string
  endDate?: string
  status?: AssignmentStatus
  createdAt?: string
}

const API_BASE = import.meta.env.VITE_API_BASE

export default function AdminProjectAssignment() {
  const navigate = useNavigate()

  const [assignments, setAssignments] = React.useState<ProjectAssignment[]>([])
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string>("")

  const [q, setQ] = React.useState("")
  const [cols, setCols] = React.useState({
    id: true,
    project: true,
    assignee: true,
    roleInProject: true,
    period: true,
    status: true,
    actions: true,
  })

  // state untuk AlertDialog delete
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<number | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const fetchAssignments = React.useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const res = await axios.get(`${API_BASE}/project-assignments`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      const raw: any[] = Array.isArray(res.data) ? res.data : res.data?.data ?? []

      const normalized: ProjectAssignment[] = raw.map((a) => ({
        id: Number(a.id),
        projectId: Number(a.projectId ?? a.project_id ?? a.project?.id),
        projectName: a.projectName ?? a.project_name ?? a.project?.name ?? "",
        assigneeId: Number(a.assigneeId ?? a.userId ?? a.assignee_id ?? a.user?.id),
        assigneeName:
          a.assigneeName ??
          a.assignee_name ??
          a.userName ??
          a.user_name ??
          a.assignee?.fullName ??
          a.user?.fullName ??
          "",
        roleInProject: a.roleInProject ?? a.assignmentRole ?? "",
        startDate: a.startDate ?? a.start_date,
        endDate: a.endDate ?? a.end_date,
        status: a.status ?? "PLANNED",
        createdAt: a.createdAt ?? a.created_at,
        updatedAt: a.updatedAt ?? a.updated_at,
      }))

      setAssignments(normalized)
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Gagal memuat data project assignments"
      setError(msg)
      toast.error("Gagal memuat data assignments", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  const formatDate = (iso?: string) => {
    if (!iso) return "-"
    try {
      return new Date(iso).toLocaleDateString("id-ID")
    } catch {
      return iso
    }
  }

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return assignments

    return assignments.filter((a) => {
      const project = String(a.projectName ?? "").toLowerCase()
      const assignee = String(a.assigneeName ?? "").toLowerCase()
      const role = String(a.roleInProject ?? "").toLowerCase()
      const status = String(a.status ?? "").toLowerCase()
      return (
        project.includes(s) ||
        assignee.includes(s) ||
        role.includes(s) ||
        status.includes(s)
      )
    })
  }, [assignments, q])

  const statusVariant = (status?: AssignmentStatus) => {
    const s = String(status ?? "").toUpperCase()
    if (s === "IN_PROGRESS") return "default" as const
    if (s === "COMPLETED") return "secondary" as const
    if (s === "ON_HOLD") return "outline" as const
    if (s === "PLANNED") return "outline" as const
    return "secondary" as const
  }

  // buka dialog konfirmasi
  const requestDelete = (id: number) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  // eksekusi delete setelah konfirmasi
  const confirmDelete = async () => {
    if (!deletingId) return

    const assignment = assignments.find((x) => x.id === deletingId)
    const prev = assignments

    setDeleting(true)
    setAssignments((p) => p.filter((x) => x.id !== deletingId))

    try {
      const token = localStorage.getItem("token")
      await axios.delete(`${API_BASE}/project-assignments/${deletingId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      toast.success("Assignment berhasil dihapus", {
        description:
          assignment
            ? `${assignment.assigneeName ?? "User"} – ${assignment.projectName ?? "Project"}`
            : undefined,
      })
    } catch (err: any) {
      setAssignments(prev)
      const msg = err?.response?.data?.message || "Gagal menghapus assignment."
      toast.error("Gagal menghapus assignment", { description: msg })
    } finally {
      setDeleting(false)
      setDeletingId(null)
      setDeleteDialogOpen(false)
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold">Project Assignments</h1>
                      <p className="pt-2 text-muted-foreground">
                        Daftar penugasan anggota ke proyek.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate("/admin/dashboard/project-assignments/create")
                        }
                        className="cursor-pointer"
                      >
                        <IconPlus className="mr-2 h-4 w-4" />
                        Add Assignment
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="px-4 lg:px-6">
                  <div className="mb-4 flex items-center gap-3">
                    <Input
                      placeholder="Filter by project, assignee, role, or status..."
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
                            checked={cols.project}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, project: !!v }))
                            }
                          >
                            Project
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.assignee}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, assignee: !!v }))
                            }
                          >
                            Assignee
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={cols.roleInProject}
                            onCheckedChange={(v) =>
                              setCols((c) => ({ ...c, roleInProject: !!v }))
                            }
                          >
                            Role
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
                      <thead className="bg-muted/50">
                        <tr className="text-center">
                          {cols.id && (
                            <th className="px-4 py-3 font-medium">ID</th>
                          )}
                          {cols.project && (
                            <th className="px-4 py-3 font-medium">Project</th>
                          )}
                          {cols.assignee && (
                            <th className="px-4 py-3 font-medium">Assignee</th>
                          )}
                          {cols.roleInProject && (
                            <th className="px-4 py-3 font-medium">Role</th>
                          )}
                          {cols.actions && (
                            <th className="px-4 py-3 font-medium">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-4 py-6 text-center"
                            >
                              Memuat data...
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
                        ) : (
                          filtered.map((a) => (
                            <tr
                              key={a.id}
                              className="border-t text-center"
                            >
                              {cols.id && (
                                <td className="px-4 py-3">{a.id}</td>
                              )}
                              {cols.project && (
                                <td className="px-4 py-3">
                                  {a.projectName || "-"}
                                </td>
                              )}
                              {cols.assignee && (
                                <td className="px-4 py-3">
                                  {a.assigneeName || "-"}
                                </td>
                              )}
                              {cols.roleInProject && (
                                <td className="px-4 py-3">
                                  {a.roleInProject ? (
                                    <Badge variant="secondary">{a.roleInProject}</Badge>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                              )}

                              {cols.actions && (
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => requestDelete(a.id)}
                                      className="cursor-pointer rounded px-2 py-1 text-red-600 hover:text-red-700"
                                    >
                                      <IconTrash className="h-4 w-4" />
                                    </button>
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
                        <Card className="border-t bg-background">
                          <div className="flex items-center gap-3 border-b p-4">
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
                                    "/admin/dashboard/project-assignments/create",
                                  )
                                }
                              >
                                Tambah Assignment
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ) : (
                        <Card className="border-t bg-background">
                          <div className="flex items-center gap-3 border-b p-4">
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
                                Data Project Assignment
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Belum ada data yang ditampilkan.
                              </p>
                            </div>
                          </div>
                          <div className="p-6">
                            <p className="text-sm text-muted-foreground">
                              Tambahkan project assignment untuk mulai mengatur
                              siapa yang bertanggung jawab pada setiap proyek.
                            </p>
                            <div className="mt-4">
                              <Button
                                onClick={() =>
                                  navigate(
                                    "/admin/dashboard/project-assignments/create",
                                  )
                                }
                              >
                                Tambah Assignment
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

      {/* AlertDialog konfirmasi hapus */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Assignment yang dihapus tidak bisa dipulihkan.
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
    </div>
  )
}
