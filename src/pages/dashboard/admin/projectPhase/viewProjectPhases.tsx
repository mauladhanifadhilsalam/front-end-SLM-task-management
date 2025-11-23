"use client";

import * as React from "react";
import { Link } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react";
import { useViewProjectPhase } from "@/features/project-phases/hooks/use-view-project-phase";
import { ViewProjectPhaseContent } from "@/features/project-phases/components/view-project-phase-content";

const ViewProjectPhasePage: React.FC = () => {
  const {
    phase,
    loading,
    error,
    deleting,
    handleDelete,
    handleBack,
    getEditHref,
  } = useViewProjectPhase();

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

                    {phase && (
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
                                Delete project phase?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {phase
                                  ? `Are you sure you want to delete "${phase.name}"? This action cannot be undone.`
                                  : "Are you sure you want to delete this phase? This action cannot be undone."}
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
                    Project Phase Details
                  </h1>
                  <p className="text-muted-foreground">
                    View phase information and timeline
                  </p>
                </div>

                <div className="px-4 lg:px-6">
                  <ViewProjectPhaseContent
                    phase={phase}
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
  );
};

export default ViewProjectPhasePage;
