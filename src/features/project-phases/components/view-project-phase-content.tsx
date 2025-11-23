import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Phase } from "@/types/project-phases.type";
import { formatDateLong } from "@/utils/format-date-time";

type Props = {
  phase: Phase | null;
  loading: boolean;
  error: string | null;
};

export const ViewProjectPhaseContent: React.FC<Props> = ({
  phase,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-6 w-48 bg-muted/30 rounded" />
            <div className="h-4 w-full bg-muted/30 rounded" />
            <div className="h-4 w-full bg-muted/30 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="rounded border p-6 text-red-600">
        {error}
      </div>
    );
  }

  if (!phase) {
    return (
      <div className="rounded border p-6">
        Phase not found
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{phase.name}</CardTitle>
          <CardDescription>Phase Information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">
                Phase ID
              </div>
              <div className="font-medium">
                {phase.id}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Project
              </div>
              <div className="font-medium">
                <Badge variant="outline">
                  {phase.project?.name}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-1">
              Timeline
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm">Start Date</div>
                <div className="font-medium">
                  {formatDateLong(phase.startDate)}
                </div>
              </div>
              <div>
                <div className="text-sm">End Date</div>
                <div className="font-medium">
                  {formatDateLong(phase.endDate)}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-1">
              Project Timeline
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm">Project Start</div>
                <div className="font-medium">
                  {formatDateLong(phase.project?.startDate)}
                </div>
              </div>
              <div>
                <div className="text-sm">Project End</div>
                <div className="font-medium">
                  {formatDateLong(phase.project?.endDate)}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-1">
              Status
            </div>
            <Badge
              variant={
                phase.project?.status === "DONE"
                  ? "default"
                  : phase.project?.status === "IN_PROGRESS"
                  ? "secondary"
                  : "outline"
              }
            >
              {phase.project?.status?.replace("_", " ")}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">
                Created At
              </div>
              <div className="font-medium">
                {formatDateLong(phase.createdAt)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Last Updated
              </div>
              <div className="font-medium">
                {formatDateLong(phase.updatedAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
