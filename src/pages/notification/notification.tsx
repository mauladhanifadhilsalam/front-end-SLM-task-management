"use client"

import * as React from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

import { AppSidebar } from "@/components/app-sidebar"
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

    const fetchNotifications = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const res = await axios.get(`${API_BASE}/notifications`, {
            headers: tokenHeader,
        })
        const arr = normalizeArray(res.data)
        const list: Notification[] = arr.map((n: any) => ({
            id: n.id,
            recipientId: n.recipientId,
            targetType: n.targetType,
            targetId: n.targetId ?? null,
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

    const handleOpen = (n: Notification) => {
        if (n.targetType === "TICKET" && n.targetId) {
        navigate(`${basePath}/tickets/view/${n.targetId}`)
        return
        }
        if (n.targetType === "PROJECT" && n.targetId) {
        navigate(`${basePath}/projects/view/${n.targetId}`)
        return
        }
    }



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
        <AppSidebar variant="inset" />
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
