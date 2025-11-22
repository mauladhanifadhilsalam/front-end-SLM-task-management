"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import { CreateUserForm } from "../../../../features/users/components/create-user-form"

export default function CreateUser() {
  const navigate = useNavigate()

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
                  </div>
                  <h1 className="text-2xl font-semibold">
                    Tambah User Baru
                  </h1>
                  <p className="text-muted-foreground">
                    Buat user baru di sini.
                  </p>
                </div>

                <div className="px-4 lg:px-6">
                  <CreateUserForm
                    onSuccess={() =>
                      navigate("/admin/dashboard/users")
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
