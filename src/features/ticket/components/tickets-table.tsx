"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import {
  IconLayoutGrid,
  IconChevronDown,
  IconPlus,
  IconTrash,
  IconEdit,
  IconEye,
} from "@tabler/icons-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TablePaginationControls } from "@/components/table-pagination-controls"
import type { PaginationMeta } from "@/types/pagination"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
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

import type { AdminTicket,AdminTicketColumns,TicketStatus, TicketPriority, TicketType } from "@/types/ticket-type"

type Props = {
  tickets: AdminTicket[]
  loading: boolean
  error: string
  q: string
  cols: AdminTicketColumns
  onSearchChange: (value: string) => void
  onToggleColumn: (key: keyof AdminTicketColumns, value: boolean) => void
  onDelete: (id: number) => void
  onCreate: () => void
  formatDate: (iso?: string) => string
  hasFilter: boolean
  pagination: PaginationMeta
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const statusVariant = (
  status?: TicketStatus | string,
): "default" | "destructive" | "outline" | "secondary" | "success" | "warning" | null | undefined => {
  switch (status) {
    case "NEW":
    case "TO_DO":
      return "secondary"
    case "IN_PROGRESS":
      return "default"
    case "IN_REVIEW":
      return "outline"
    case "DONE":
    case "RESOLVED":
    case "CLOSED":
      return "default"
    case "BLOCKED":
      return "destructive"
    default:
      return "secondary"
  }
}

const priorityVariant = (
  p?: TicketPriority | string,
): "default" | "destructive" | "outline" | "secondary" | "success" | "warning" | null | undefined => {
  switch (p) {
    case "LOW":
      return "outline"
    case "MEDIUM":
      return "secondary"
    case "HIGH":
      return "default"
    case "CRITICAL":
      return "destructive"
    default:
      return "secondary"
  }
}

const typeLabelVariant = (
  type?: TicketType | string,
): "default" | "destructive" | "outline" | "secondary" | "success" | "warning" | null | undefined => {
  if (!type) return "secondary"
  return "secondary"
}

export function TicketsTable({
  tickets,
  loading,
  error,
  q,
  cols,
  onSearchChange,
  onToggleColumn,
  onDelete,
  onCreate,
  formatDate,
  hasFilter,
  pagination,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: Props) {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Tickets</h1>
          <p className="text-muted-foreground pt-2">
            Daftar tiket (bug/feature/task) di semua proyek.
          </p>
        </div>
      </div>

      {/* Toolbar - Responsive Layout */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Mobile & Tablet: Stack vertically, Desktop: Single row with space-between */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          {/* Left Group: Search Input */}
          <Input
            placeholder="Cari title, status, priority, requester, atau project..."
            value={q}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full lg:flex-1 lg:max-w-md"
          />

          {/* Right Group: Buttons - Only visible on Desktop */}
          <div className="hidden lg:flex lg:items-center lg:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="flex items-center gap-2 cursor-pointer">
                  <IconLayoutGrid className="h-4 w-4" />
                  <span>Columns</span>
                  <IconChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={cols.id}
                  onCheckedChange={(v) => onToggleColumn("id", !!v)}
                >
                  ID
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={cols.title}
                  onCheckedChange={(v) => onToggleColumn("title", !!v)}
                >
                  Title
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={cols.type}
                  onCheckedChange={(v) => onToggleColumn("type", !!v)}
                >
                  Type
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={cols.priority}
                  onCheckedChange={(v) => onToggleColumn("priority", !!v)}
                >
                  Priority
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={cols.status}
                  onCheckedChange={(v) => onToggleColumn("status", !!v)}
                >
                  Status
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={cols.requester}
                  onCheckedChange={(v) => onToggleColumn("requester", !!v)}
                >
                  Requester
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={cols.project}
                  onCheckedChange={(v) => onToggleColumn("project", !!v)}
                >
                  Project
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={cols.startDate}
                  onCheckedChange={(v) => onToggleColumn("startDate", !!v)}
                >
                  Start
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={cols.dueDate}
                  onCheckedChange={(v) => onToggleColumn("dueDate", !!v)}
                >
                  Due
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={cols.actions}
                  onCheckedChange={(v) => onToggleColumn("actions", !!v)}
                >
                  Actions
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              onClick={onCreate}
              className="cursor-pointer"
            >
              <IconPlus className="mr-2 h-4 w-4" />
              Add Ticket
            </Button>
          </div>
        </div>

        {/* Buttons Row - Only visible on Mobile & Tablet */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="self-start sm:self-auto flex items-center gap-2 cursor-pointer">
                <IconLayoutGrid className="h-4 w-4" />
                <span>Columns</span>
                <IconChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuCheckboxItem
                checked={cols.id}
                onCheckedChange={(v) => onToggleColumn("id", !!v)}
              >
                ID
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.title}
                onCheckedChange={(v) => onToggleColumn("title", !!v)}
              >
                Title
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.type}
                onCheckedChange={(v) => onToggleColumn("type", !!v)}
              >
                Type
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.priority}
                onCheckedChange={(v) => onToggleColumn("priority", !!v)}
              >
                Priority
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.status}
                onCheckedChange={(v) => onToggleColumn("status", !!v)}
              >
                Status
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.requester}
                onCheckedChange={(v) => onToggleColumn("requester", !!v)}
              >
                Requester
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.project}
                onCheckedChange={(v) => onToggleColumn("project", !!v)}
              >
                Project
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.startDate}
                onCheckedChange={(v) => onToggleColumn("startDate", !!v)}
              >
                Start
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.dueDate}
                onCheckedChange={(v) => onToggleColumn("dueDate", !!v)}
              >
                Due
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.actions}
                onCheckedChange={(v) => onToggleColumn("actions", !!v)}
              >
                Actions
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            onClick={onCreate}
            className="w-full sm:w-auto cursor-pointer"
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Add Ticket
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-center">
              {cols.id && <th className="px-4 py-3 font-medium">ID</th>}
              {cols.title && <th className="px-4 py-3 font-medium">Title</th>}
              {cols.type && <th className="px-4 py-3 font-medium">Type</th>}
              {cols.priority && <th className="px-4 py-3 font-medium">Priority</th>}
              {cols.status && <th className="px-4 py-3 font-medium">Status</th>}
              {cols.requester && <th className="px-4 py-3 font-medium">Requester</th>}
              {cols.project && <th className="px-4 py-3 font-medium">Project</th>}
              {cols.startDate && <th className="px-4 py-3 font-medium">Start</th>}
              {cols.dueDate && <th className="px-4 py-3 font-medium">Due</th>}
              {cols.actions && <th className="px-4 py-3 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center">
                  Memuat data...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-red-600">
                  {error}
                </td>
              </tr>
            ) : (
              tickets.map((t) => (
                <tr key={t.id} className="border-t text-center">
                  {cols.id && <td className="px-4 py-3">{t.id}</td>}
                  {cols.title && <td className="px-4 py-3">{t.title}</td>}
                  {cols.type && (
                    <td className="px-4 py-3">
                      <Badge variant={typeLabelVariant(t.type)}>{t.type || "-"}</Badge>
                    </td>
                  )}
                  {cols.priority && (
                    <td className="px-4 py-3">
                      <Badge variant={priorityVariant(t.priority)}>
                        {t.priority || "-"}
                      </Badge>
                    </td>
                  )}
                  {cols.status && (
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                    </td>
                  )}
                  {cols.requester && (
                    <td className="px-4 py-3">
                      {t.requesterName || `#${t.requesterId}`}
                    </td>
                  )}
                  {cols.project && (
                    <td className="px-4 py-3">
                      {t.projectName || `Project #${t.projectId}`}
                    </td>
                  )}
                  {cols.startDate && (
                    <td className="px-4 py-3">{formatDate(t.startDate)}</td>
                  )}
                  {cols.dueDate && (
                    <td className="px-4 py-3">{formatDate(t.dueDate)}</td>
                  )}
                  {cols.actions && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/admin/dashboard/tickets/view/${t.id}`}
                          className="px-2 py-1 rounded"
                        >
                          <IconEye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/dashboard/tickets/edit/${t.id}`}
                          className="px-2 py-1 rounded"
                        >
                          <IconEdit className="h-4 w-4" />
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="px-2 py-1 rounded text-red-600 hover:text-red-700 cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <IconTrash className="h-4 w-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Hapus ticket "{t.title}"?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Ticket akan
                                dihapus secara permanen dari sistem.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => onDelete(t.id)}
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

        {!loading && tickets.length === 0 && (
          hasFilter ? (
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
                  <h3 className="text-sm font-medium">Hasil Pencarian</h3>
                  <p className="text-sm text-muted-foreground">
                    Tidak ditemukan hasil untuk{" "}
                    <span className="font-medium text-foreground">"{q}"</span>.
                  </p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground">
                  Periksa ejaan kata kunci atau coba gunakan kata kunci yang
                  lebih umum.
                </p>
                <div className="mt-4 flex gap-3">
                  <Button variant="outline" onClick={() => onSearchChange("")}>
                    Bersihkan Pencarian
                  </Button>
                  <Button onClick={onCreate}>Tambah Ticket</Button>
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
                  <h3 className="text-sm font-medium">Data Tickets</h3>
                  <p className="text-sm text-muted-foreground">
                    Belum ada data yang ditampilkan.
                  </p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground">
                  Tambahkan ticket untuk mulai mengelola isu/permintaan pada
                  proyek.
                </p>
                <div className="mt-4">
                  <Button onClick={onCreate}>Tambah Ticket</Button>
                </div>
              </div>
            </Card>
          )
        )}
      </div>

      <TablePaginationControls
        total={pagination.total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        label="tickets"
      />
    </div>
  )
}