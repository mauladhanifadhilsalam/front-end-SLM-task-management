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
  NotificationsSearchEmptyState,
  NotificationsEmptyState,
} from "./notifications-empty-state"
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
import { Skeleton } from "@/components/ui/skeleton"


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
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h1 className="flex items-center gap-2 text-xl font-semibold md:text-2xl">
                  Daftar Notifikasi
                </h1>
                <p className="pt-1 text-sm text-muted-foreground">
                  Lihat semua notifikasi sistem untuk pengguna.
                </p>
              </div>
            </div>

            {/* Toolbar - Responsive Layout */}
            <div className="flex flex-col gap-3">
              {/* Mobile & Tablet: Stack vertically, Desktop: Single row with space-between */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
                {/* Left Group: Search & Filter */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 lg:flex-1">
                  {/* Search Input */}
                  <Input
                    placeholder="Cari pesan, subject, email, target, atau penerima..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full lg:flex-1 lg:max-w-md"
                  />
                  
                  {/* Status Filter */}
                  <Select
                    value={stateFilter}
                    onValueChange={(value) =>
                      onStateFilterChange(value as NotificationState | "all")
                    }
                  >
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Filter status baca" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ALL</SelectItem>
                      <SelectItem value="UNREAD">UNREAD</SelectItem>
                      <SelectItem value="READ">READ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Right Group: Columns Button */}
                <div className="self-start lg:self-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <IconLayoutGrid className="h-4 w-4" />
                        Columns
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
            </div>

            {error && !loading && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {loading ? (
              <div className="overflow-x-auto rounded border">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-center">
                      {cols.id && <th className="px-4 py-3 font-medium">ID</th>}
                      {cols.subject && <th className="px-4 py-3 font-medium">Subject</th>}
                      {cols.message && <th className="px-4 py-3 font-medium">Pesan</th>}
                      {cols.target && <th className="px-4 py-3 font-medium">Target</th>}
                      {cols.recipient && <th className="px-4 py-3 font-medium">Penerima</th>}
                      {cols.state && <th className="px-4 py-3 font-medium">Status Baca</th>}
                      {cols.emailStatus && (
                        <th className="px-4 py-3 font-medium">Status Pengiriman</th>
                      )}
                      {cols.createdAt && <th className="px-4 py-3 font-medium">Dikirim</th>}
                      {cols.readAt && <th className="px-4 py-3 font-medium">Dibaca</th>}
                      {cols.actions && <th className="px-4 py-3 font-medium">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: pageSize }).map((_, i) => (
                      <tr key={i} className="border-t text-center">
                        {cols.id && (
                          <td className="px-4 py-3">
                            <Skeleton className="h-4 w-10 mx-auto" />
                          </td>
                        )}
                        {cols.subject && (
                          <td className="px-4 py-3 text-left">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-32 mt-1" />
                          </td>
                        )}
                        {cols.message && (
                          <td className="px-4 py-3 text-left">
                            <Skeleton className="h-4 w-full max-w-[420px]" />
                            <Skeleton className="h-4 w-3/4 mt-1" />
                          </td>
                        )}
                        {cols.target && (
                          <td className="px-4 py-3">
                            <Skeleton className="h-4 w-28 mx-auto" />
                          </td>
                        )}
                        {cols.recipient && (
                          <td className="px-4 py-3 text-left">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40 mt-1" />
                            <Skeleton className="h-4 w-16 rounded-full mt-1" />
                          </td>
                        )}
                        {cols.state && (
                          <td className="px-4 py-3">
                            <Skeleton className="h-4 w-20 mx-auto" />
                          </td>
                        )}
                        {cols.emailStatus && (
                          <td className="px-4 py-3">
                            <Skeleton className="h-4 w-28 mx-auto" />
                          </td>
                        )}
                        {cols.createdAt && (
                          <td className="px-4 py-3">
                            <Skeleton className="h-4 w-24 mx-auto" />
                          </td>
                        )}
                        {cols.readAt && (
                          <td className="px-4 py-3">
                            <Skeleton className="h-4 w-24 mx-auto" />
                          </td>
                        )}
                        {cols.actions && (
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-2">
                              <Skeleton className="h-8 w-8 rounded-md" />
                              <Skeleton className="h-8 w-8 rounded-md" />
                              <Skeleton className="h-8 w-16 rounded-md" />
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : !error && notifications.length === 0 ? (
              search.trim() !== "" || stateFilter !== "all" ? (
                <NotificationsSearchEmptyState
                  query={search || stateFilter}
                  onClear={() => {
                    onSearchChange("")
                    onStateFilterChange("all")
                  }}
                />
              ) : (
                <NotificationsEmptyState />
              )
            ) : !error && notifications.length > 0 ? (
              <div className="overflow-x-auto rounded border">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-center">
                      {cols.id && (
                        <th className="px-4 py-3 font-medium">ID</th>
                      )}
                      {cols.subject && (
                        <th className="px-4 py-3 font-medium">Subject</th>
                      )}
                      {cols.message && (
                        <th className="px-4 py-3 font-medium">Pesan</th>
                      )}
                      {cols.target && (
                        <th className="px-4 py-3 font-medium">Target</th>
                      )}
                      {cols.recipient && (
                        <th className="px-4 py-3 font-medium">Penerima</th>
                      )}
                      {cols.state && (
                        <th className="px-4 py-3 font-medium">Status Baca</th>
                      )}
                      {cols.emailStatus && (
                        <th className="px-4 py-3 font-medium">
                          Status Pengiriman
                        </th>
                      )}
                      {cols.createdAt && (
                        <th className="px-4 py-3 font-medium">Dikirim</th>
                      )}
                      {cols.readAt && (
                        <th className="px-4 py-3 font-medium">Dibaca</th>
                      )}
                      {cols.actions && (
                        <th className="px-4 py-3 font-medium">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((n) => (
                      <tr key={n.id} className="border-t text-center">
                        {cols.id && (
                          <td className="px-4 py-3">{n.id}</td>
                        )}

                        {cols.subject && (
                          <td className="px-4 py-3 text-left">
                            <div className="line-clamp-2 break-words text-sm font-medium">
                              {n.subject || "(no subject)"}
                            </div>
                          </td>
                        )}

                        {cols.message && (
                          <td className="px-4 py-3 text-left">
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
                          <td className="px-4 py-3">
                            {targetLabel(n.targetType, n.targetId)}
                          </td>
                        )}

                        {cols.recipient && (
                          <td className="px-4 py-3 text-left">
                            {n.recipient ? (
                              <>
                                <div className="line-clamp-1 break-words font-medium">
                                  {n.recipient.fullName}
                                </div>
                                <div className="line-clamp-1 break-words text-xs text-muted-foreground">
                                  {n.recipient.email}
                                </div>
                                <div className="mt-1">
                                  <Badge variant="outline" className="uppercase">
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
                          <td className="px-4 py-3">
                            <Badge variant={stateBadgeVariant(n.state)}>
                              {stateLabel(n.state)}
                            </Badge>
                          </td>
                        )}

                        {cols.emailStatus && (
                          <td className="px-4 py-3">
                            <Badge variant={notifyStatusVariant(n.status)}>
                              {notifyStatusLabel(n.status)}
                            </Badge>
                          </td>
                        )}

                        {cols.createdAt && (
                          <td className="px-4 py-3">
                            {formatDate(n.createdAt)}
                          </td>
                        )}

                        {cols.readAt && (
                          <td className="px-4 py-3">
                            {formatDate(n.readAt)}
                          </td>
                        )}

                        {cols.actions && (
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
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
            ) : null}
          </div>
        </div>
      </div>

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