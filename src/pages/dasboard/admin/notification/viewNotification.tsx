// src/pages/admin/ViewNotification.tsx

"use client"

import * as React from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import axios from "axios"
import Swal from "sweetalert2"
import {
  IconArrowLeft,
  IconBell,
  IconAlertCircle,
  IconMail,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const API_BASE = import.meta.env.VITE_API_BASE

type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER" | "USER" | string
type NotificationState = "READ" | "UNREAD" | string
type NotificationTargetType =
  | "COMMENT"
  | "TICKET"
  | "PROJECT"
  | "SYSTEM"
  | "STATUS"
  | string

type NotifyStatusType = "PENDING" | "SENT" | "FAILED" | string | null

type Recipient = {
  id: number
  fullName: string
  email: string
  role: Role
}

type Notification = {
  id: number
  recipientId: number
  targetType: NotificationTargetType
  targetId: number | null
  message: string
  state: NotificationState
  createdAt: string
  readAt: string | null
  status: NotifyStatusType
  sentAt: string | null
  emailError: string | null
  recipient?: Recipient
}

export default function ViewNotification() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()

  const [notification, setNotification] = React.useState<Notification | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const id = React.useMemo(() => {
    const n = Number(params.id)
    return Number.isFinite(n) && n > 0 ? n : null
  }, [params.id])

  const formatDateTime = (value: string | null) => {
    if (!value) return "-"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return "-"
    return d.toLocaleString("id-ID")
  }

  const stateBadgeVariant = (
    state: NotificationState,
  ): "default" | "outline" | "secondary" => {
    if (state === "UNREAD") return "default"
    if (state === "READ") return "outline"
    return "secondary"
  }

  const statusBadgeVariant = (
    status: NotifyStatusType,
  ): "default" | "outline" | "destructive" | "secondary" => {
    if (!status) return "secondary"
    if (status === "PENDING") return "outline"
    if (status === "SENT") return "default"
    if (status === "FAILED") return "destructive"
    return "secondary"
  }

  React.useEffect(() => {
    if (!id) {
      setError("Invalid notification ID")
      setLoading(false)
      return
    }

    const fetchNotification = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem("token")
        const res = await axios.get<Notification>(`${API_BASE}/notifications/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })

        setNotification(res.data ?? res.data)
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to load notification")
      } finally {
        setLoading(false)
      }
    }

    fetchNotification()
  }, [id])

  const handleDelete = async () => {
    if (!notification) return

    const confirm = await Swal.fire({
      title: "Delete notification?",
      text: `Are you sure you want to delete notification #${notification.id}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    })

    if (!confirm.isConfirmed) return

    setDeleting(true)
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`${API_BASE}/notifications/${notification.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      await Swal.fire({
        title: "Deleted",
        text: "Notification has been deleted successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      })

      navigate("/admin/dashboard/notifications")
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Failed to delete notification"
      await Swal.fire({ title: "Error", text: msg, icon: "error" })
      setDeleting(false)
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
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header + Back + Actions */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/admin-dashboard/notifications")}
                    className="flex items-center gap-2"
                  >
                    <IconArrowLeft className="h-4 w-4" />
                    Back
                  </Button>

                  {notification && (
                    <div className="ml-auto flex items-center gap-2">

                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex items-center gap-2"
                        onClick={handleDelete}
                        disabled={deleting}
                      >
                        <IconTrash className="h-4 w-4" />
                        {deleting ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                      Notification Detail
                    </h1>
                    <p className="text-muted-foreground">
                      View full information for notification #{params.id}
                    </p>
                  </div>

                  {notification && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={stateBadgeVariant(notification.state)}>
                        {notification.state}
                      </Badge>
                      <Badge variant={statusBadgeVariant(notification.status)}>
                        {notification.status ?? "NO STATUS"}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Information</CardTitle>
                    <CardDescription>
                      Core data of this notification, including recipient and target.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {loading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IconBell className="h-4 w-4 animate-pulse" />
                        Loading notification…
                      </div>
                    )}

                    {!loading && error && (
                      <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                        <IconAlertCircle className="mt-0.5 h-4 w-4" />
                        <p>{error}</p>
                      </div>
                    )}

                    {!loading && !error && !notification && (
                      <div className="text-sm text-muted-foreground">
                        Notification not found.
                      </div>
                    )}

                    {!loading && !error && notification && (
                      <>
                        {/* Message */}
                        <section className="space-y-2">
                          <h2 className="text-sm font-semibold">Message</h2>
                          <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                            {notification.message}
                          </div>
                        </section>

                        <Separator />

                        {/* Recipient */}
                        <section className="space-y-2">
                          <h2 className="text-sm font-semibold">Recipient</h2>
                          {notification.recipient ? (
                            <div className="space-y-1 text-sm">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">
                                  {notification.recipient.fullName}
                                </span>
                                <Badge variant="outline" className="uppercase">
                                  {notification.recipient.role}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <IconMail className="h-4 w-4" />
                                <span>{notification.recipient.email}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No recipient information available. (recipientId:{" "}
                              {notification.recipientId})
                            </p>
                          )}
                        </section>

                        <Separator />

                        {/* Target info */}
                        <section className="space-y-2">
                          <h2 className="text-sm font-semibold">Target</h2>
                          <div className="grid gap-3 text-sm md:grid-cols-2">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Target Type
                              </p>
                              <p className="font-medium">
                                {notification.targetType || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Target ID
                              </p>
                              <p className="font-medium">
                                {notification.targetId ?? "-"}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            You can use Target Type & Target ID to navigate to related ticket
                            or project page.
                          </p>
                        </section>

                        <Separator />

                        {/* Status & Dates */}
                        <section className="space-y-3">
                          <h2 className="text-sm font-semibold">Status & Timeline</h2>
                          <div className="grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-3">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Created At
                              </p>
                              <p className="font-medium">
                                {formatDateTime(notification.createdAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Read At
                              </p>
                              <p className="font-medium">
                                {formatDateTime(notification.readAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Sent At
                              </p>
                              <p className="font-medium">
                                {formatDateTime(notification.sentAt)}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-3 text-sm md:grid-cols-2">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                State
                              </p>
                              <Badge variant={stateBadgeVariant(notification.state)}>
                                {notification.state}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Delivery Status
                              </p>
                              <Badge variant={statusBadgeVariant(notification.status)}>
                                {notification.status ?? "NO STATUS"}
                              </Badge>
                            </div>
                          </div>
                        </section>

                        {/* Email error */}
                        {notification.emailError && (
                          <>
                            <Separator />
                            <section className="space-y-2">
                              <h2 className="text-sm font-semibold text-destructive">
                                Email Error
                              </h2>
                              <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                                {notification.emailError}
                              </div>
                            </section>
                          </>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
