"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react"
import { useViewProjectRole } from "@/features/project-roles/hooks/use-view-project-role"
import { ViewProjectRoleContent } from "@/features/project-roles/components/view-project-role-content"

const ViewProjectRolePage: React.FC = () => {
  const {
    projectRole,
    loading,
    error,
    deleting,
    handleDelete,
    handleBack,
    getEditHref,
  } = useViewProjectRole()

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
                      onClick={handleBack}
                      className="flex items-center gap-2"
                    >
                      <IconArrowLeft className="h-4 w-4" />
                      Back
                    </Button>

                    {projectRole && (
                      <div className="ml-auto flex items-center gap-2">
                        <Link to={getEditHref()}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <IconEdit className="h-4 w-4" />
                            Edit
                          </Button>
                        </Link>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deleting}
                              className="flex items-center gap-2"
                            >
                              <IconTrash className="h-4 w-4" />
                              {deleting ? "Deleting..." : "Delete"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Project Role?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {projectRole
                                  ? `Are you sure you want to delete "${projectRole.name}"? This action cannot be undone.`
                                  : "Are you sure you want to delete this project role? This action cannot be undone."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={deleting}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDelete}
                                disabled={deleting}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deleting ? "Deleting..." : "Yes, delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>

                  <h1 className="text-2xl font-semibold">
                    Project Role Details
                  </h1>
                  <p className="text-muted-foreground">
                    View project role information
                  </p>
                </div>

                <div className="px-4 lg:px-6">
                  <ViewProjectRoleContent
                    projectRole={projectRole}
                    loading={loading}
                    error={error}
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

export default ViewProjectRolePage
