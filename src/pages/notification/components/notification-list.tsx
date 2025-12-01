"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import {
  IconBell,
  IconCircleDot,
  IconCircleCheck,
  IconArrowRight,
} from "@tabler/icons-react"

export type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER" | "USER" | string
export type NotificationState = "READ" | "UNREAD" | string
export type NotificationTargetType =
  | "COMMENT"
  | "TICKET"
  | "PROJECT"
  | string
export type NotifyStatusType = "PENDING" | "SENT" | "FAILED" | string | null

export type Recipient = {
  id: number
  fullName: string
  email: string
  role: Role
}

export type Notification = {
  id: number
  recipientId: number
  targetType: NotificationTargetType
  targetId: number | null
  ticketType?: string | null
  ticketProjectId?: number | null
  message: string
  state: NotificationState
  createdAt: string
  readAt: string | null
  status: NotifyStatusType
  emailError: string | null
  recipient?: Recipient
}

function formatDateTime(value: string | null) {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "-"

  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) {
    return "Baru saja"
  }

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) {
    return `${diffMin} menit lalu`
  }

  const diffHours = Math.floor(diffMin / 60)
  const isSameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()

  if (diffHours < 24 && isSameDay) {
    return `${diffHours} jam lalu`
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()

  if (isYesterday) {
    return `Kemarin, ${d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })}`
  }

  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

type Props = {
  notifications: Notification[]
  loading?: boolean
  error?: string | null
  onReload?: () => void
  onOpen?: (n: Notification) => void
  onMarkAsRead?: (n: Notification) => void
  onMarkAllAsRead?: () => void
}

export function NotificationList({
    notifications,
    loading,
    error,
    onReload,
    onOpen,
    onMarkAsRead,
    onMarkAllAsRead,
    }: Props) {
    const [search, setSearch] = React.useState("")
    const [targetFilter, setTargetFilter] = React.useState<string>("ALL")

    const filteredAndSorted = React.useMemo(() => {
        let list = [...notifications]

        if (search.trim()) {
        const q = search.toLowerCase()
        list = list.filter((n) => {
            const message = n.message?.toLowerCase() ?? ""
            const targetType = n.targetType?.toString().toLowerCase() ?? ""
            const targetId = n.targetId ? `#${n.targetId}` : ""
            return (
            message.includes(q) ||
            targetType.includes(q) ||
            targetId.toLowerCase().includes(q)
            )
        })
        }

        if (targetFilter !== "ALL") {
        list = list.filter(
            (n) => n.targetType?.toString().toUpperCase() === targetFilter,
        )
        }

        list.sort((a, b) => {
        if (a.state === "UNREAD" && b.state !== "UNREAD") return -1
        if (a.state !== "UNREAD" && b.state === "UNREAD") return 1
        return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        })

        return list
    }, [notifications, search, targetFilter])

    return (
        <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <IconBell className="h-4 w-4" />
                Notifications
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
                Semua notifikasi kamu
            </CardDescription>
            </div>

            <div className="flex w-full items-center justify-start gap-2 sm:w-auto sm:justify-end">
            {onReload && (
                <Button
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={onReload}
                className="h-8 px-3 text-xs sm:h-9 sm:text-sm"
                >
                {loading ? "Loading..." : "Refresh"}
                </Button>
            )}
            {onMarkAllAsRead && (
                <Button
                variant="outline"
                size="sm"
                disabled={notifications.length === 0 || loading}
                onClick={onMarkAllAsRead}
                className="h-8 px-3 text-xs sm:h-9 sm:text-sm"
                >
                Mark all as read
                </Button>
            )}
            </div>
        </CardHeader>

        <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-t border-b px-3 py-3 text-xs sm:px-4 sm:text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                placeholder="Cari notifikasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-full text-xs sm:h-9 sm:max-w-xs sm:text-sm"
                />

                <Select
                value={targetFilter}
                onValueChange={(value) => setTargetFilter(value)}
                >
                <SelectTrigger className="h-8 w-full text-xs sm:h-9 sm:w-40 sm:text-sm">
                    <SelectValue placeholder="Filter jenis" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">Semua jenis</SelectItem>
                    <SelectItem value="TICKET">Ticket</SelectItem>
                    <SelectItem value="COMMENT">Komentar</SelectItem>
                    <SelectItem value="PROJECT">Project</SelectItem>
                </SelectContent>
                </Select>
            </div>
            </div>

            {error && (
            <div className="bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
            </div>
            )}

            {!loading && filteredAndSorted.length === 0 && !error && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Tidak ada notifikasi yang cocok dengan filter.
            </div>
            )}

            {loading && (
            <div className="space-y-2 px-4 py-4">
                <div className="h-12 w-full animate-pulse rounded bg-muted/50" />
                <div className="h-12 w-full animate-pulse rounded bg-muted/50" />
            </div>
            )}

            {!loading && !error && filteredAndSorted.length > 0 && (
            <div>
                {filteredAndSorted.map((n) => (
                <div
                    key={n.id}
                    className={`border-t px-3 py-3 transition hover:bg-muted/60 md:px-4 ${
                    n.state === "UNREAD"
                        ? "border-l-2 border-l-primary bg-primary/5"
                        : "border-l-2 border-l-transparent"
                    }`}
                    onClick={() => onOpen?.(n)}
                >
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <div className="flex flex-1 gap-2 sm:gap-3">
                        <div className="pt-0.5">
                        {n.state === "UNREAD" ? (
                            <IconCircleDot className="h-4 w-4 text-primary" />
                        ) : (
                            <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
                        )}
                        </div>

                        <div className="flex-1">
                        <p className="text-sm font-medium sm:text-[0.95rem]">
                            {n.message}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground sm:text-xs">
                            {n.targetType && (
                            <span>
                                {n.targetType}
                                {n.targetId ? ` #${n.targetId}` : ""}
                            </span>
                            )}
                            <span>•</span>
                            <span>{formatDateTime(n.createdAt)}</span>
                            {n.status && (
                            <>
                                <span>•</span>
                                <Badge
                                variant="outline"
                                className="text-[10px] uppercase tracking-tight"
                                >
                                {n.status}
                                </Badge>
                            </>
                            )}
                        </div>

                        {n.emailError && (
                            <p className="mt-1 text-[11px] text-red-600 sm:text-xs">
                            Email error: {n.emailError}
                            </p>
                        )}
                        </div>
                    </div>

                    <div className="mt-1 flex items-center justify-end gap-1 sm:mt-0 sm:flex-col sm:items-end sm:justify-center sm:gap-1">
                        <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={(e) => {
                            e.stopPropagation()
                            onOpen?.(n)
                        }}
                        >
                        <IconArrowRight className="h-4 w-4" />
                        </Button>

                        {n.state === "UNREAD" && onMarkAsRead && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="px-2 text-[10px]"
                            onClick={(e) => {
                            e.stopPropagation()
                            onMarkAsRead(n)
                            }}
                        >
                            Mark as read
                        </Button>
                        )}
                    </div>
                    </div>
                </div>
                ))}
            </div>
            )}
        </CardContent>
        </Card>
    )
}
