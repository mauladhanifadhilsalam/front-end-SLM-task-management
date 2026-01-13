"use client";

import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/pages/dashboard/admin/components/sidebar-admin";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminProjectPhaseToolbar } from "@/features/project-phases/components/admin-project-phase-toolbar";
import { AdminProjectPhaseTable } from "@/features/project-phases/components/admin-project-phase-table";
import { useAdminProjectPhaseList } from "@/features/project-phases/hooks/use-admin-project-phase-list";

const AdminProjectPhasePage: React.FC = () => {
  const navigate = useNavigate();

  const {
    phases,
    loading,
    error,
    query,
    setQuery,
    cols,
    colSpan,
    toggleColumn,
    deletePhase,
    getStatusVariant,
    pagination,
    page,
    pageSize,
    setPage,
    setPageSize,
  } = useAdminProjectPhaseList();

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
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold">
                        Project Phases
                      </h1>
                      <p className="text-muted-foreground">
                        Manage project phases and timelines
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-4 lg:px-6">
                  <AdminProjectPhaseToolbar
                    query={query}
                    onQueryChange={setQuery}
                    cols={cols}
                    onToggleColumn={toggleColumn}
                    onCreateClick={() =>
                      navigate("/admin/dashboard/project-phases/create")
                    }
                  />
                  <AdminProjectPhaseTable
                    phases={phases}
                    loading={loading}
                    error={error}
                    cols={cols}
                    colSpan={colSpan}
                    onDeletePhase={deletePhase}
                    getStatusVariant={getStatusVariant}
                    pagination={pagination}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
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

export default AdminProjectPhasePage;
