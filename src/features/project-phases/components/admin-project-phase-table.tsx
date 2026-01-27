import * as React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { IconEye, IconEdit, IconTrash } from "@tabler/icons-react";
import type { Phase } from "@/types/project-phases.type";
import type { PhaseColumnState } from "../hooks/use-admin-project-phase-list";
import { formatDate } from "@/utils/format-date-time";
import type { ProjectStatus } from "@/types/project.type";
import type { PaginationMeta } from "@/types/pagination";
import { TablePaginationControls } from "@/components/table-pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  phases: Phase[];
  loading: boolean;
  error: string;
  cols: PhaseColumnState;
  colSpan: number;
  onDeletePhase: (id: number) => void;
  getStatusVariant: (status?: ProjectStatus | null) => "default" | "secondary" | "outline";
  pagination: PaginationMeta;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export const AdminProjectPhaseTable: React.FC<Props> = ({
  phases,
  loading,
  error,
  cols,
  colSpan,
  onDeletePhase,
  getStatusVariant,
  pagination,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const table = (
    <table className="min-w-full divide-y divide-border">
      <thead className="bg-muted/50">
        <tr className="text-center">
          {cols.id && (
            <th className="px-4 py-3 text-sm font-medium">
              ID
            </th>
          )}
          {cols.name && (
            <th className="px-4 py-3 text-sm font-medium">
              Phase Name
            </th>
          )}
          {cols.projectName && (
            <th className="px-4 py-3 text-sm font-medium">
              Project
            </th>
          )}
          {cols.phaseStart && (
            <th className="px-4 py-3 text-sm font-medium">
              Phase Start
            </th>
          )}
          {cols.phaseEnd && (
            <th className="px-4 py-3 text-sm font-medium">
              Phase End
            </th>
          )}
          {cols.projectDates && (
            <th className="px-4 py-3 text-sm font-medium">
              Project Timeline
            </th>
          )}
          {cols.status && (
            <th className="px-4 py-3 text-sm font-medium">
              Status
            </th>
          )}
          {cols.actions && (
            <th className="px-4 py-3 text-sm font-medium">
              Actions
            </th>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-border bg-background">
        {phases.map((phase) => (
          <tr key={phase.id} className="text-center">
            {cols.id && (
              <td className="px-4 py-3 text-sm">
                {phase.id}
              </td>
            )}
            {cols.name && (
              <td className="px-4 py-3 text-sm">
                {phase.name}
              </td>
            )}
            {cols.projectName && (
              <td className="px-4 py-3 text-sm">
                <Badge variant="outline">
                  {phase.project?.name}
                </Badge>
              </td>
            )}
            {cols.phaseStart && (
              <td className="px-4 py-3 text-sm">
                {formatDate(phase.startDate)}
              </td>
            )}
            {cols.phaseEnd && (
              <td className="px-4 py-3 text-sm">
                {formatDate(phase.endDate)}
              </td>
            )}
            {cols.projectDates && (
              <td className="px-4 py-3 text-sm">
                {formatDate(phase.project?.startDate)}{" "}
                -{" "}
                {formatDate(phase.project?.endDate)}
              </td>
            )}
            {cols.status && (
              <td className="px-4 py-3 text-sm">
                <Badge variant={getStatusVariant(phase.project?.status as ProjectStatus | undefined)}>
                  {phase.project?.status?.replace("_", " ")}
                </Badge>
              </td>
            )}
            {cols.actions && (
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Link
                    to={`/admin/dashboard/project-phases/view/${phase.id}`}
                    className="cursor-pointer"
                  >
                    <IconEye className="h-4 w-4" />
                  </Link>
                  <Link
                    to={`/admin/dashboard/project-phases/edit/${phase.id}`}
                    className="cursor-pointer"
                  >
                    <IconEdit className="h-4 w-4" />
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="text-red-600 cursor-pointer hover:text-red-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete project phase?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete{" "}
                          <span className="font-semibold">
                            "{phase.name}"
                          </span>
                          ? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => onDeletePhase(phase.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

if (loading) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full divide-y divide-border">
        <tbody>
          {Array.from({ length: pageSize }).map((_, i) => (
            <tr key={i} className="text-center">
              {cols.id && (
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-12 mx-auto" />
                </td>
              )}
              {cols.name && (
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-32 mx-auto" />
                </td>
              )}
              {cols.projectName && (
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-28 mx-auto" />
                </td>
              )}
              {cols.phaseStart && (
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-24 mx-auto" />
                </td>
              )}
              {cols.phaseEnd && (
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-24 mx-auto" />
                </td>
              )}
              {cols.projectDates && (
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-40 mx-auto" />
                </td>
              )}
              {cols.status && (
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-20 mx-auto" />
                </td>
              )}
              {cols.actions && (
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

if (error || phases.length === 0) {
  const message = error || "No phases found";
  const messageClass = error ? "text-red-600" : "text-muted-foreground";

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full divide-y divide-border">
        <tbody>
          <tr>
            <td colSpan={colSpan} className={`px-4 py-6 text-center ${messageClass}`}>
              {message}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}


  return (
    <div className="overflow-x-auto rounded-md border">
      {table}
      <TablePaginationControls
        total={pagination.total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        label="phases"
      />
    </div>
  );
};
