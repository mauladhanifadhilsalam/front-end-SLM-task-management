"use client"

import * as React from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

import { AppSidebarDev } from "@/components/app-sidebardev"
import { AppSidebarPm } from "../dashboard/pm/components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  NotificationList,
  Notification,
} from "./components/notification-list"

const API_BASE = import.meta.env.VITE_API_BASE

const normalizeArray = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.data)) return raw.data
  if (Array.isArray(raw?.items)) return raw.items
  if (Array.isArray(raw?.notifications)) return raw.notifications
  if (Array.isArray(raw?.data?.notifications)) return raw.data.notifications
  if (raw && typeof raw === "object") return [raw]
  return []
}

export default function NotificationPage() {
    const navigate = useNavigate()

    const [notifications, setNotifications] = React.useState<Notification[]>([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [updating, setUpdating] = React.useState(false)

    const tokenHeader = React.useMemo(() => {
        const token = localStorage.getItem("token")
        return token ? { Authorization: `Bearer ${token}` } : undefined
    }, [])

    const unwrap = (res: any) => res?.data?.data ?? res?.data ?? []

    const fetchNotifications = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const res = await axios.get(`${API_BASE}/notifications`, {
            headers: tokenHeader,
        })
        const arr = normalizeArray(unwrap(res))
        const list: Notification[] = arr.map((n: any) => ({
            id: n.id,
            recipientId: n.recipientId,
            targetType: n.targetType,
            targetId: n.targetId ?? null,
            ticketProjectId:
              n.ticketProjectId ??
              n.projectId ??
              n.project_id ??
              n.ticket?.projectId ??
              n.ticket?.project_id ??
              n.ticket?.project?.id ??
              null,
            ticketType: n.ticketType ?? n.type ?? n.ticket?.type ?? null,
            message: n.message,
            state: n.state,
            createdAt: n.createdAt,
            readAt: n.readAt ?? null,
            status: n.status ?? null,
            emailError: n.emailError ?? null,
            recipient: n.recipient
            ? {
                id: n.recipient.id,
                fullName: n.recipient.fullName ?? n.recipient.name ?? "",
                email: n.recipient.email ?? "",
                role: n.recipient.role,
                }
            : undefined,
        }))
        setNotifications(list)
        } catch (e: any) {
        setError(e?.response?.data?.message || "Gagal memuat notifikasi")
        } finally {
        setLoading(false)
        }
    }, [tokenHeader])

    React.useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])
    const role = React.useMemo(() => {
    return localStorage.getItem("role") 
  }, [])

  const basePath =
  role === "project_manager"
    ? "/project-manager/dashboard"
    : role === "developer"
    ? "/developer/dashboard"
    : "/admin/dashboard"

    const resolveTicketInfo = React.useCallback(
        async (n: Notification) => {
        let ticketType = n.ticketType?.toString().toUpperCase() ?? null
        let projectId =
            n.ticketProjectId != null ? Number(n.ticketProjectId) : null

        if (ticketType && projectId) {
            return { ticketType, projectId }
        }

        if (!n.targetId) {
            return { ticketType, projectId }
        }

        try {
            const res = await axios.get(`${API_BASE}/tickets/${n.targetId}`, {
            headers: tokenHeader,
            })

            const data = unwrap(res)

            ticketType =
            ticketType ??
            data.type ??
            data.ticketType ??
            data.ticket?.type ??
            null

            const resolvedProjectId = Number(
            projectId ??
                data.projectId ??
                data.project_id ??
                data.project?.id ??
                data.ticket?.projectId ??
                data.ticket?.project_id ??
                data.ticket?.project?.id ??
                0,
            )

            projectId =
            Number.isFinite(resolvedProjectId) && resolvedProjectId > 0
                ? resolvedProjectId
                : null
        } catch (err) {
            console.error("Failed to resolve ticket info", err)
        }

        return {
            ticketType: ticketType ? ticketType.toString().toUpperCase() : null,
            projectId,
        }
        },
        [tokenHeader],
    )

    const handleOpen = React.useCallback(
        async (n: Notification) => {
        if (n.targetType === "TICKET" && n.targetId) {
            const { ticketType, projectId } = await resolveTicketInfo(n)
            const upperType = ticketType?.toString().toUpperCase() ?? ""

            if (role === "project_manager") {
            if (upperType === "TASK" && projectId) {
                navigate(
                `/project-manager/dashboard/projects/${projectId}/tasks/${n.targetId}`,
                )
                return
            }

            navigate(`/project-manager/dashboard/ticket-issue/view/${n.targetId}`)
            return
            }

            if (role === "developer") {
            if (upperType === "TASK" && projectId) {
                navigate(
                `/developer-dashboard/projects/${projectId}/tasks/${n.targetId}`,
                )
                return
            }

            if (projectId) {
                navigate(
                `/developer-dashboard/projects/${projectId}/issues/${n.targetId}`,
                )
                return
            }

            navigate("/developer-dashboard/projects")
            return
            }

            navigate(`/admin/dashboard/tickets/view/${n.targetId}`)
            return
        }
        if (n.targetType === "PROJECT" && n.targetId) {
            navigate(`${basePath}/projects/view/${n.targetId}`)
            return
        }
        },
        [resolveTicketInfo, role, navigate, basePath],
    )



    const handleMarkAsRead = async (n: Notification) => {
        if (n.state === "READ") return

        const prev = notifications
        const nowIso = new Date().toISOString()

        setNotifications((current) =>
        current.map((x) =>
            x.id === n.id ? { ...x, state: "READ", readAt: nowIso } : x,
        ),
        )

        try {
        await axios.patch(
            `${API_BASE}/notifications/${n.id}/state`,
            { state: "READ" },
            {
            headers: {
                "Content-Type": "application/json",
                ...(tokenHeader ?? {}),
            },
            },
        )
        } catch {
        setNotifications(prev)
        }
    }

    const handleMarkAllAsRead = async () => {
        const unread = notifications.filter((n) => n.state === "UNREAD")
        if (unread.length === 0) return

        const prev = notifications
        const nowIso = new Date().toISOString()

        setUpdating(true)
        setNotifications((current) =>
        current.map((n) =>
            n.state === "UNREAD"
            ? { ...n, state: "READ", readAt: nowIso }
            : n,
        ),
        )

        try {
        await Promise.all(
            unread.map((n) =>
            axios.patch(
                `${API_BASE}/notifications/${n.id}/state`,
                { state: "READ" },
                {
                headers: {
                    "Content-Type": "application/json",
                    ...(tokenHeader ?? {}),
                },
                },
            ),
            ),
        )
        } catch {
        setNotifications(prev)
        } finally {
        setUpdating(false)
        }
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
        {role === "project_manager" ? (
        <AppSidebarPm variant="inset" />
      ) : (
        <AppSidebarDev variant="inset" />
      )}
        <SidebarInset>
            <SiteHeader />

            <main className="flex flex-1 flex-col px-4 py-4 lg:px-6 lg:py-6">
                <div className="">
                    <NotificationList
                    notifications={notifications}
                    loading={loading || updating}
                    error={error}
                    onReload={fetchNotifications}
                    onOpen={handleOpen}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    />
                </div>
            </main>
        </SidebarInset>
        </SidebarProvider>
    )
}
