// src/pages/admin/dashboard/projects/edit-project.tsx
"use client"

import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppSidebar } from "@/pages/dashboard/admin/components/sidebar-admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import { EditProjectForm } from "@/features/projects/components/edit-project-form"

export default function EditProject() {
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
                        navigate("/admin/dashboard/projects")
                      }
                      className="flex items-center gap-2"
                    >
                      <IconArrowLeft className="h-4 w-4" />
                      Kembali
                    </Button>
                  </div>

                  <h1 className="text-2xl font-semibold">Edit Project</h1>
                  <p className="text-muted-foreground">
                    Perbarui informasi project di sini.
                  </p>
                </div>

                <div className="px-4 lg:px-6">
                  <EditProjectForm
                    projectId={id}
                    onCancel={() =>
                      navigate("/admin/dashboard/projects")
                    }
                    onSuccess={() =>
                      navigate("/admin/dashboard/projects")
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
