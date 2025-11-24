"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ViewCommentContent } from "@/features/comment/components/view-comment-content"
import { useViewComment } from "@/features/comment/hooks/use-view-comment"

const ViewCommentPage: React.FC = () => {
  const {
    comment,
    loading,
    error,
    deleting,
    handleBack,
    handleDelete,
  } = useViewComment()

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
              <ViewCommentContent
                comment={comment}
                loading={loading}
                error={error}
                deleting={deleting}
                onBack={handleBack}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default ViewCommentPage
