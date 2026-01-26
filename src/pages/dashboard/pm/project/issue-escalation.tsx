"use client"

import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import ReactMarkdown from "react-markdown"
import {
  IconSearch,
  IconTrash,
  IconEdit,
  IconEye,
} from "@tabler/icons-react"
import { ArrowLeft } from "lucide-react"

import { AppSidebarPm } from "../components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { TablePaginationControls } from "@/components/table-pagination-controls"

type Ticket = {
  id: number
  projectId: number
  type: "ISSUE" | "TASK"
  description: string
  actionPlan: string | null
  status: string
  startDate: string
  dueDate: string
  requesterName?: string
  requester?: { fullName: string }
}

const statusLabel: Record<string, string> = {
  NEW: "NEW",
  TO_DO: "TO DO",
  IN_PROGRESS: "IN PROGRESS",
  IN_REVIEW: "IN REVIEW",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
}

const formatDate = (date: string) => {
  return date
    ? new Date(date).toLocaleDateString("id-ID")
    : "-"
}

export default function IssueEscalationPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const [tickets, setTickets] = React.useState<Ticket[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [openActionPlan, setOpenActionPlan] = React.useState<Ticket | null>(null)

  React.useEffect(() => {
    setLoading(true)
    axios
      .get("http://localhost:3000/tickets")
      .then((res) => {
        setTickets(
          res.data.data.filter(
            (t: Ticket) =>
              t.type === "ISSUE" && t.projectId === Number(projectId)
          )
        )
        setLoading(false)
      })
      .catch(() => {
        setError("Gagal memuat data")
        setLoading(false)
      })
  }, [projectId])

  const filtered = tickets.filter((t) => {
    const q = searchQuery.toLowerCase()
    return (
      (statusFilter === "ALL" || t.status === statusFilter) &&
      (!searchQuery || t.description.toLowerCase().includes(q) || t.id.toString().includes(q))
    )
  })

  const totalPages = Math.ceil(filtered.length / pageSize)
  const currentTickets = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/tickets/${id}`)
      setTickets((p) => p.filter((t) => t.id !== id))
    } catch (err) {
      setError("Gagal menghapus issue")
    }
  }

  const handleViewDetail = (issueId: number) => {
    navigate(`/project-manager/dashboard/projects/${projectId}/issues/${issueId}`)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  const pagination = {
    total: filtered.length,
    page: currentPage,
    pageSize: pageSize,
    totalPages: totalPages,
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
      <AppSidebarPm variant="inset" />
      <SidebarInset className="overflow-x-hidden"> 
        <SiteHeader />

        <div className="flex flex-col gap-5 px-4 lg:px-6 py-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/project-manager/dashboard/projects`)} 
            className="w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
          </Button>

          <h1 className="text-2xl font-semibold">Issue & Escalation</h1>

          {/* FILTER SECTION */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Cari issue / ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                {Object.keys(statusLabel).map((s) => (
                  <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* TABLE SECTION */}
          <div className="rounded border">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-center">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Deskripsi</th>
                    <th className="px-4 py-3 font-medium">Developer</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Ditemukan</th>
                    <th className="px-4 py-3 font-medium">Selesai</th>
                    <th className="px-4 py-3 font-medium">Action Plan</th>
                    <th className="px-4 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center">
                        Memuat data...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-red-600">
                        {error}
                      </td>
                    </tr>
                  ) : currentTickets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center">
                        Tidak ada data ditemukan.
                      </td>
                    </tr>
                  ) : (
                    currentTickets.map((t) => (
                      <tr key={t.id} className="border-t text-center">
                        <td className="px-4 py-3">{t.id}</td>
                        <td className="px-4 py-3 min-w-[200px] max-w-[300px]">
                          <p className="font-medium leading-relaxed">{t.description}</p>
                        </td>
                        <td className="px-4 py-3">
                          {t.requesterName || t.requester?.fullName ? (
                            <>
                              <div className="font-medium">
                                {t.requesterName || t.requester?.fullName}
                              </div>
                            </>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">
                            {t.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{formatDate(t.startDate)}</td>
                        <td className="px-4 py-3">{formatDate(t.dueDate)}</td>
                        <td className="px-4 py-3 min-w-[500px] max-w-[600px]">
                          {t.actionPlan ? (
                            <div className="flex justify-center">
                              <div className="text-left whitespace-pre-wrap leading-relaxed">
                                {t.actionPlan}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center items-center gap-5">
                            <button 
                              onClick={() => handleViewDetail(t.id)} 
                              title="Lihat Detail"
                            >
                              <IconEye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </button>
                            <button 
                              onClick={() => navigate(`/project-manager/dashboard/projects/${projectId}/issues/${t.id}/edit`)} 
                              title="Edit"
                            >
                              <IconEdit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </button>
                            
                            {/* AlertDialog for Delete Confirmation */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button title="Hapus">
                                  <IconTrash className="h-4 w-4 text-red-600 hover:text-red-700" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus issue ini?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tindakan ini tidak dapat dibatalkan. Issue dengan ID #{t.id} akan dihapus secara permanen dari sistem.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(t.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Ya, hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <TablePaginationControls
              total={pagination.total}
              page={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
              label="issues"
            />
          </div>
        </div>
      </SidebarInset>

      {/* MODAL ACTION PLAN */}
      <Dialog open={!!openActionPlan} onOpenChange={() => setOpenActionPlan(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl">
              Action Plan – Issue #{openActionPlan?.id}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto py-4 px-2 prose prose-sm max-w-none dark:prose-invert">
            {openActionPlan?.actionPlan ? (
              <ReactMarkdown>
                {openActionPlan.actionPlan}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">Tidak ada action plan tersedia.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}