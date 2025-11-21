"use client"

import * as React from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { IconArrowLeft, IconEdit } from "@tabler/icons-react"
import { useViewProjectOwner } from "./hooks/use-view-project-owner"
import { ProjectOwnerDetailCard } from "./components/project-owner-deatil-card"
import { ProjectOwnerDeleteDialog } from "./components/project-owner-delete-dialog"

export default function ViewProjectOwnerPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const {
    owner,
    loading,
    deleting,
    error,
    handleDelete,
  } = useViewProjectOwner({
    ownerId: id,
    onDeleted: () =>
      navigate("/admin/dashboard/project-owners"),
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
                        navigate("/admin/dashboard/project-owners")
                      }
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <IconArrowLeft className="h-4 w-4" />
                      Kembali
                    </Button>

                    <div className="ml-auto flex items-center gap-2">
                      {owner && (
                        <Link
                          to={`/admin/dashboard/project-owners/edit/${owner.id}`}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <IconEdit className="h-4 w-4" />
                            Edit
                          </Button>
                        </Link>
                      )}

                      {owner && (
                        <ProjectOwnerDeleteDialog
                          ownerId={owner.id}
                          ownerName={owner.name}
                          triggerVariant="button"
                          triggerLabel="Delete"
                          loading={deleting}
                          disabled={deleting}
                          onConfirm={handleDelete}
                        />
                      )}
                    </div>
                  </div>

                  <h1 className="text-2xl font-semibold">
                    Detail Project Owner
                  </h1>
                  <p className="text-muted-foreground">
                    Lihat informasi lengkap pemilik proyek.
                  </p>
                </div>

                <div className="px-4 lg:px-6">
                  {loading ? (
                    <Card>
                      <CardContent>
                        <div className="animate-pulse space-y-3">
                          <div className="h-6 w-48 bg-muted/30 rounded" />
                          <div className="h-4 w-full bg-muted/30 rounded" />
                          <div className="h-4 w-full bg-muted/30 rounded" />
                        </div>
                      </CardContent>
                    </Card>
                  ) : error ? (
                    <div className="rounded border p-6 text-red-600">
                      {error}
                    </div>
                  ) : !owner ? (
                    <div className="rounded border p-6">
                      Owner tidak ditemukan.
                    </div>
                  ) : (
                    <ProjectOwnerDetailCard owner={owner} />
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
