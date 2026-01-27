"use client"

import * as React from "react"
import {
  IconArrowLeft,
  IconBell,
  IconAlertCircle,
  IconMail,
  IconTrash,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AdminNotificationDetailSkeleton } from "./admin-notification-detail-skeleton"
import type {
  NotificationState,
  NotifyStatusType,
} from "@/types/notification.type"
import { NotificationDeleteDialog } from "./notification-delete-dialog"
import { useAdminNotificationDetail } from "../hooks/use-admin-notification-detail"

type Props = {
  rawId: string | undefined
  onBack: () => void
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

export const AdminNotificationDetail: React.FC<Props> = ({ rawId, onBack }) => {
  const {
    notification,
    loading,
    error,
    deleting,
    deleteDialogOpen,
    openDeleteDialog,
    setDeleteDialogOpen,
    handleDelete,
    formatDateTime,
  } = useAdminNotificationDetail(rawId)

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
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
                    disabled={deleting}
                    onClick={openDeleteDialog}
                  >
                    <IconTrash className="h-4 w-4" />
                    {deleting ? "Deleting..." : "Delete"}
                  </Button>

                  <NotificationDeleteDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    loading={deleting}
                    title="Delete notification?"
                    description={
                      notification
                        ? `Are you sure you want to delete notification #${notification.id}? This action cannot be undone.`
                        : "Are you sure you want to delete this notification? This action cannot be undone."
                    }
                    confirmLabel="Delete"
                    loadingLabel="Deleting..."
                    cancelLabel="Cancel"
                    onConfirm={handleDelete}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                  Notification Detail
                </h1>
                <p className="text-muted-foreground">
                  View full information for this notification.
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

          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Information</CardTitle>
                <CardDescription>
                  Core data of this notification, including recipient and target.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {loading && <AdminNotificationDetailSkeleton />}

                {!loading && error && (
                  <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    <IconAlertCircle className="mt-0.5 h-4 w-4" />
                    <p>{error}</p>
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
                    <section className="space-y-2">
                      <h2 className="text-sm font-semibold">Message</h2>
                      <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                        {notification.message}
                      </div>
                    </section>

                    <Separator />

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
  )
}
