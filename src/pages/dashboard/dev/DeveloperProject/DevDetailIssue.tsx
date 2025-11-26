"use client";

import { useParams, useNavigate } from "react-router-dom";
import { AppSidebarDev } from "@/components/app-sidebardev";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useIssueDetail } from "@/features/DevDetailIssue/hook/use-issue-detail";
import { IssueDetailCard} from "@/features/DevDetailIssue/components/issue-detail-card";

export default function DeveloperIssueDetail() {
  const { projectId, issueId } = useParams();
  const navigate = useNavigate();

  const { issue, loading, error, projectName } = useIssueDetail(
    projectId,
    issueId
  );

  const handleBack = () => {
    navigate(`/developer-dashboard/issues/${projectId}`);
  };

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebarDev variant="inset" />

      <SidebarInset>
        <SiteHeader />

        <main className="p-6 space-y-6">
          {/* Tombol Kembali */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {projectName || "Project"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Issue Detail - ID: {issueId}
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <p className="text-muted-foreground">Memuat detail issue...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : !issue ? (
            <p className="text-muted-foreground">Issue tidak ditemukan.</p>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Reuse TaskDetailCard component */}
              <IssueDetailCard issue={issue} />
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}