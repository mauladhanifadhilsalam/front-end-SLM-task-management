"use client"

import * as React from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { Phase } from "@/types/project-phases.type";
import type { ProjectStatus } from "@/types/project.type";
import {
  fetchProjectPhasesWithPagination,
  deleteProjectPhase,
  type ProjectPhaseListParams,
  type ProjectPhaseListResult,
} from "@/services/project-phase.service";
import { projectPhaseKeys } from "@/lib/query-keys";
import { usePagination } from "@/hooks/use-pagination";
import { buildSearchText, normalizeSearch } from "@/utils/search.util";

export type PhaseColumnState = {
  id: boolean;
  name: boolean;
  projectName: boolean;
  phaseStart: boolean;
  phaseEnd: boolean;
  projectDates: boolean;
  status: boolean;
  actions: boolean;
};

const defaultColumns: PhaseColumnState = {
  id: true,
  name: true,
  projectName: true,
  phaseStart: true,
  phaseEnd: true,
  projectDates: true,
  status: true,
  actions: true,
};

export const useAdminProjectPhaseList = () => {
  const queryClient = useQueryClient();
  const [error, setError] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [cols, setCols] = React.useState<PhaseColumnState>(defaultColumns);
  const {
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    setPage,
  } = usePagination();

  const filters = React.useMemo<ProjectPhaseListParams>(() => {
    const params: ProjectPhaseListParams = {
      page,
      pageSize,
    };
    const trimmed = query.trim();
    if (trimmed) params.search = trimmed;
    return params;
  }, [query, page, pageSize]);

  const queryKey = React.useMemo(
    () => projectPhaseKeys.list(filters),
    [filters],
  )

  const phasesQuery = useQuery({
    queryKey,
    queryFn: () => fetchProjectPhasesWithPagination(filters),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const normalizedSearch = React.useMemo(
    () => normalizeSearch(query),
    [query],
  );

  const phases = React.useMemo(() => {
    const list = phasesQuery.data?.phases ?? [];
    return list.slice().sort((a, b) => a.id - b.id);
  }, [phasesQuery.data?.phases]);

  const filteredPhases = React.useMemo(() => {
    if (!normalizedSearch) return phases;
    return phases.filter((phase) => {
      const haystack = buildSearchText([
        phase.id,
        phase.name,
        phase.project?.name,
        phase.project?.status,
        phase.startDate,
        phase.endDate,
        phase.project?.startDate,
        phase.project?.endDate,
      ]);
      return haystack.includes(normalizedSearch);
    });
  }, [phases, normalizedSearch]);

  const pagination = phasesQuery.data?.pagination ?? {
    total: 0,
    page,
    pageSize,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  React.useEffect(() => {
    if (phasesQuery.error) {
      const msg =
        phasesQuery.error instanceof Error
          ? phasesQuery.error.message
          : "Failed to load project phases";
      setError(msg);
    } else if (phasesQuery.isSuccess) {
      setError("");
    }
  }, [phasesQuery.error, phasesQuery.isSuccess]);

  const colSpan = React.useMemo(
    () => Object.values(cols).filter(Boolean).length || 8,
    [cols],
  );

  const toggleColumn = (key: keyof PhaseColumnState, value: boolean) => {
    setCols((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const deleteMutation = useMutation({
    mutationFn: deleteProjectPhase,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey });
      const previous =
        queryClient.getQueryData<ProjectPhaseListResult>(queryKey);

      queryClient.setQueryData<ProjectPhaseListResult>(
        queryKey,
        (current) => {
          if (!current) return current;
          return {
            ...current,
            phases: current.phases.filter((phase) => phase.id !== id),
            pagination: {
              ...current.pagination,
              total: Math.max(0, current.pagination.total - 1),
            },
          };
        },
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deletePhase = async (id: number) => {
    const target = phases.find((phase) => phase.id === id);

    try {
      await deleteMutation.mutateAsync(id);

      toast.success("Phase deleted", {
        description: `Phase "${target?.name ?? `#${id}`}" has been deleted.`,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to delete phase";
      setError(msg);
      toast.error("Failed to delete phase", {
        description: msg,
      });
    }
  };

  const getStatusVariant = (status?: ProjectStatus | null) => {
    if (!status) return "outline" as const;

    if (status === "DONE") return "default" as const;
    if (status === "IN_PROGRESS") return "secondary" as const;
    return "outline" as const;
  };

  return {
    phases: filteredPhases,
    loading: phasesQuery.isLoading,
    error,
    query,
    setQuery: (value: string) => {
      setQuery(value);
      setPage(1);
    },
    cols,
    colSpan,
    toggleColumn,
    deletePhase,
    reload: phasesQuery.refetch,
    getStatusVariant,
    pagination,
    page,
    pageSize,
    setPage: (value: number) => onPageChange(value, pagination.totalPages),
    setPageSize: onPageSizeChange,
  };
};
