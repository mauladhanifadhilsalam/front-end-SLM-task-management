"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { IconArrowLeft } from "@tabler/icons-react"
import { useEditCommentForm } from "@/features/comment/hooks/use-edit-comment-form"
import { EditCommentForm } from "@/features/comment/components/edit-comment-form"

const EditCommentPage: React.FC = () => {
  const {
    loading,
    saving,
    error,
    form,
    fieldErrors,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useEditCommentForm()

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
                      onClick={handleCancel}
                      className="flex items-center gap-2"
                    >
                      <IconArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  </div>
                  <h1 className="text-2xl font-semibold">
                    Edit Comment
                  </h1>
                  <p className="text-muted-foreground">
                    Update comment details
                  </p>
                </div>

                <div className="px-4 lg:px-6">
                  <EditCommentForm
                    loading={loading}
                    saving={saving}
                    error={error}
                    form={form}
                    fieldErrors={fieldErrors}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
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

export default EditCommentPage
