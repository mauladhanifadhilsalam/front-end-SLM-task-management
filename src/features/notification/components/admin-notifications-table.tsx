"use client"

import * as React from "react"
import { Link } from "react-router-dom"
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
import { NotificationDeleteDialog } from "./notification-delete-dialog"
import {
  IconLayoutGrid,
  IconChevronDown,
  IconEye,
  IconTrash,
  IconReload,
} from "@tabler/icons-react"
import type { Notification, NotificationState } from "@/types/notification.type"
import type { PaginationMeta } from "@/types/pagination"
import { TablePaginationControls } from "@/components/table-pagination-controls"

type ColState = {
  id: boolean
  subject: boolean
  message: boolean
  target: boolean
  recipient: boolean
  state: boolean
  emailInfo: boolean
  emailStatus: boolean
  createdAt: boolean
  readAt: boolean
  actions: boolean
}

type Props = {
  search: string
  onSearchChange: (value: string) => void
  stateFilter: NotificationState | "all"
  onStateFilterChange: (value: NotificationState | "all") => void
  cols: ColState
  onToggleColumn: (key: keyof ColState, value: boolean | "indeterminate") => void
  loading: boolean
  error: string
  notifications: Notification[]
  pagination: PaginationMeta
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  formatDate: (value: string | null) => string
  stateBadgeVariant: (
    state: Notification["state"],
  ) => "default" | "outline" | "secondary"
  stateLabel: (state: Notification["state"]) => string
  notifyStatusVariant: (
    status: Notification["status"],
  ) => "default" | "outline" | "secondary" | "destructive"
  notifyStatusLabel: (status: Notification["status"]) => string
  targetLabel: (type: Notification["targetType"], id: number) => string
  onDeleteClick: (id: number) => void
  deleteDialogOpen: boolean
  deleting: boolean
  onDeleteConfirm: () => void
  onDeleteDialogChange: (open: boolean) => void
  onResend: (notification: Notification) => void
}

export const AdminNotificationsTable: React.FC<Props> = ({
    
  search,
  onSearchChange,
  stateFilter,
  onStateFilterChange,
  cols,
  onToggleColumn,
  loading,
  error,
  notifications,
  pagination,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  formatDate,
  stateBadgeVariant,
  stateLabel,
  notifyStatusVariant,
  notifyStatusLabel,
  targetLabel,
  onDeleteClick,
  deleteDialogOpen,
  deleting,
  onDeleteConfirm,
  onDeleteDialogChange,
  onResend,
}) => {
  return (
    <>
      <main className="flex flex-1 flex-col space-y-4 p-4 md:space-y-6 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="flex items-center gap-2 text-xl font-semibold md:text-2xl">
              Daftar Notifikasi
            </h1>
            <p className="text-sm text-muted-foreground">
              Lihat semua notifikasi sistem untuk pengguna.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <Input
              placeholder="Cari pesan, subject, email, target, atau penerima..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full sm:w-80"
            />
            <Select
              value={stateFilter}
              onValueChange={(value) =>
                onStateFilterChange(value as NotificationState | "all")
              }
            >
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
                {(Object.keys(cols) as (keyof ColState)[]).map((key) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={cols[key]}
                    onCheckedChange={(v) => onToggleColumn(key, v)}
                  >
                    {key}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {error && !loading && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="rounded-md border px-4 py-6 text-center text-sm text-muted-foreground">
            Tidak ada data notifikasi.
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-[700px] text-sm md:min-w-[1100px]">
              <thead className="bg-muted/50 text-center">
                <tr>
                  {cols.id && (
                    <th className="hidden px-4 py-3 font-medium md:table-cell">
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
                    <th className="hidden px-4 py-3 font-medium lg:table-cell">
                      Target
                    </th>
                  )}
                  {cols.recipient && (
                    <th className="px-4 py-3 font-medium">Penerima</th>
                  )}
                  {cols.state && (
                    <th className="hidden px-4 py-3 font-medium sm:table-cell">
                      Status Baca
                    </th>
                  )}
                  {cols.emailStatus && (
                    <th className="hidden px-4 py-3 font-medium sm:table-cell">
                      Status Pengiriman
                    </th>
                  )}
                  {cols.createdAt && (
                    <th className="hidden px-4 py-3 font-medium lg:table-cell">
                      Dikirim
                    </th>
                  )}
                  {cols.readAt && (
                    <th className="hidden px-4 py-3 font-medium lg:table-cell">
                      Dibaca
                    </th>
                  )}
                  {cols.actions && (
                    <th className="px-4 py-3 font-medium">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {notifications.map((n) => (
                  <tr
                    key={n.id}
                    className="border-t align-top text-center"
                  >
                    {cols.id && (
                      <td className="hidden px-4 py-3 md:table-cell">
                        {n.id}
                      </td>
                    )}

                    {cols.subject && (
                      <td className="max-w-[160px] px-4 py-3 align-top text-left md:max-w-xs">
                        <div className="line-clamp-2 break-words text-sm font-medium md:text-base">
                          {n.subject || "(no subject)"}
                        </div>
                      </td>
                    )}

                    {cols.message && (
                      <td className="max-w-[200px] px-4 py-3 align-top text-left md:max-w-md">
                        <div className="line-clamp-3 break-words text-xs md:text-sm">
                          {n.message}
                        </div>
                        {n.emailError && (
                          <div className="mt-1 break-words text-xs text-red-600">
                            Error email: {n.emailError}
                          </div>
                        )}
                      </td>
                    )}

                    {cols.target && (
                      <td className="hidden px-4 py-3 lg:table-cell">
                        {targetLabel(n.targetType, n.targetId)}
                      </td>
                    )}

                    {cols.recipient && (
                      <td className="px-4 py-3 align-top text-left">
                        {n.recipient ? (
                          <>
                            <div className="line-clamp-1 break-words font-medium">
                              {n.recipient.fullName}
                            </div>
                            <div className="line-clamp-1 break-words text-xs text-muted-foreground">
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
                      <td className="hidden px-4 py-3 align-top sm:table-cell">
                        <Badge variant={stateBadgeVariant(n.state)}>
                          {stateLabel(n.state)}
                        </Badge>
                      </td>
                    )}

                    {cols.emailStatus && (
                      <td className="hidden px-4 py-3 align-center sm:table-cell">
                        <Badge variant={notifyStatusVariant(n.status)}>
                          {notifyStatusLabel(n.status)}
                        </Badge>
                      </td>
                    )}

                    {cols.createdAt && (
                      <td className="hidden px-4 py-3 align-top sm:table-cell">
                        {formatDate(n.createdAt)}
                      </td>
                    )}

                    {cols.readAt && (
                      <td className="hidden px-4 py-3 align-top lg:table-cell">
                        {formatDate(n.readAt)}
                      </td>
                    )}

                    {cols.actions && (
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-w items-center justify-center gap-2 md:justify-start">
                          <Link to={`/admin-dashboard/notifications/view/${n.id}`}>
                            <IconEye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => onDeleteClick(n.id)}
                            className="cursor-pointer text-red-600 hover:text-red-700"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>

                          {n.status === "FAILED" && (
                            <button
                              onClick={() => onResend(n)}
                              className="flex cursor-pointer items-center gap-1 text-blue-600 hover:text-blue-700"
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
            <TablePaginationControls
              total={pagination.total}
              page={page}
              pageSize={pageSize}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              label="notifications"
            />
          </div>
        )}

        {loading && (
          <div className="rounded-md border px-4 py-6 text-sm text-muted-foreground">
            Memuat data...
          </div>
        )}
      </main>

        <NotificationDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!deleting) {
            onDeleteDialogChange(open)
          }
        }}
        loading={deleting}
        
        onConfirm={onDeleteConfirm}
      />

    </>
  )
}
