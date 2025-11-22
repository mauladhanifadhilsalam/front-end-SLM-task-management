"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useCreateProjectAssignmentForm } from "@/features/project-assignments/hooks/use-create-project-assignment-form"
import { CreateProjectAssignmentForm } from "@/features/project-assignments/components/create-project-assignment-form"

export default function CreateProjectAssignment() {
  const {
    projects,
    users,
    loadingProjects,
    loadingUsers,
    form,
    errors,
    saving,
    handleChange,
    handleRoleChange,
    handleSubmit,
    handleCancel,
  } = useCreateProjectAssignmentForm()

  return (
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
          <CreateProjectAssignmentForm
            projects={projects}
            users={users}
            loadingProjects={loadingProjects}
            loadingUsers={loadingUsers}
            form={form}
            errors={errors}
            saving={saving}
            onBack={handleCancel}
            onChange={handleChange}
            onRoleChange={handleRoleChange}
            onSubmit={handleSubmit}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
