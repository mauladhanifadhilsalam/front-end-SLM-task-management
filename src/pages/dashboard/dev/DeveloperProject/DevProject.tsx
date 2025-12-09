"use client";

import * as React from "react";
import { AppSidebarDev } from "@/pages/dashboard/dev/components/app-sidebardev";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DeveloperProjectsList } from "@/features/DevProject/components/projects-list";
import { useDeveloperProjects } from "@/features/DevProject/hook/use-developer-projects";

export default function DeveloperProjects() {
  const { assignments, loading, error } = useDeveloperProjects();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebarDev variant="inset" />

      <SidebarInset>
        <SiteHeader />

        <main className="flex flex-col flex-1 p-6 space-y-6">
          <h1 className="text-2xl font-semibold">Project Saya</h1>
          <p className="text-muted-foreground">
            Daftar project yang ditugaskan kepada kamu.
          </p>

          <DeveloperProjectsList
            assignments={assignments}
            loading={loading}
            error={error}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}