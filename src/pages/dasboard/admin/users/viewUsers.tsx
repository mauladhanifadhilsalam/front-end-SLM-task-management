"use client"

import * as React from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react"
import { Card, CardContent } from "@/components/ui/card"
import { UserDeleteDialog } from "@/features/users/components/users-delete-dialog"
import { UserDetailCard } from "@/features/users/components/users-detail-card"
import { useViewUser } from "@/features/users/hooks/use-view-user"

export default function ViewUserPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const {
    user,
    loading,
    deleting,
    error,
    handleDelete,
  } = useViewUser({
    userId: id,
    onDeleted: () => navigate("/admin/dashboard/users"),
  })

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
                  <div className="flex items-center gap-4 mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate("/admin/dashboard/users")
                      }
                      className="flex items-center gap-2"
                    >
                      <IconArrowLeft className="h-4 w-4" />
                      Kembali
                    </Button>

                    <div className="ml-auto flex items-center gap-2">

                      <div className="ml-auto flex items-center gap-2">
                          {user && (
                            <Link to={`/admin/dashboard/users/edit/${user.id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-2"
                              >
                                <IconEdit className="h-4 w-4" />
                                Edit
                              </Button>
                            </Link>
                          )}

                          {user && (
                            <UserDeleteDialog
                              userId={user.id}
                              userName={user.fullName}
                              triggerVariant="button"
                              triggerLabel="Delete"
                              loading={deleting}
                              disabled={deleting}
                              onConfirm={handleDelete}
                            />
                          )}
                        </div>

                    </div>
                  </div>

                  <h1 className="text-2xl font-semibold">
                    Detail User
                  </h1>
                  <p className="text-muted-foreground">
                    Lihat informasi lengkap user.
                  </p>
                </div>

                <div className="px-4 lg:px-6">
                  {loading ? (
                    <Card>
                      <CardContent>
                        <div className="animate-pulse space-y-4">
                          <div className="h-6 w-1/3 bg-muted/30 rounded" />
                          <div className="h-4 w-full bg-muted/30 rounded" />
                          <div className="h-4 w-full bg-muted/30 rounded" />
                        </div>
                      </CardContent>
                    </Card>
                  ) : error ? (
                    <div className="rounded border p-6 text-red-600">
                      {error}
                    </div>
                  ) : !user ? (
                    <div className="rounded border p-6">
                      User tidak ditemukan.
                    </div>
                  ) : (
                    <UserDetailCard user={user} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
