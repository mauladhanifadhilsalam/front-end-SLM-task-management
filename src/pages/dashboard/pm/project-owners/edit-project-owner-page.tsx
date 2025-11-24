"use client"

import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppSidebarPm } from "../components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import { EditProjectOwnerForm } from "@/features/project-owners/components/edit-project-owner-form"

export default function EditProjectOwnerPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

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
        <AppSidebarPm variant="inset" />
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
                        navigate("/project-manager/dashboard/project-owners")
                      }
                      className="flex items-center gap-2"
                    >
                      <IconArrowLeft className="h-4 w-4" />
                      Kembali
                    </Button>
                  </div>
                  <h1 className="text-2xl font-semibold">
                    Edit Project Owner
                  </h1>
                  <p className="text-muted-foreground">
                    Perbarui data owner.
                  </p>
                </div>

                <div className="px-4 lg:px-6">
                  <EditProjectOwnerForm
                    ownerId={id}
                    onCancel={() =>
                      navigate("/project-manager/dashboard/project-owners")
                    }
                    onSuccess={() =>
                      navigate("/project-manager/dashboard/project-owners")
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
