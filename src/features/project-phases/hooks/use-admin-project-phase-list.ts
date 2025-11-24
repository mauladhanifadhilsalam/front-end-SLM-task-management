import * as React from "react";
import { toast } from "sonner";
import type { Phase } from "@/types/project-phases.type";
import type { ProjectStatus } from "@/types/project.type";
import { fetchProjectPhases, deleteProjectPhase } from "@/services/project-phase.service";

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
  const [phases, setPhases] = React.useState<Phase[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [cols, setCols] = React.useState<PhaseColumnState>(defaultColumns);

  const loadPhases = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchProjectPhases();
      setPhases(data);
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to load project phases";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPhases();
  }, [loadPhases]);

  const filteredPhases = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return phases;

    return phases.filter((phase) => {
      const phaseName = phase.name.toLowerCase();
      const projectName = phase.project?.name?.toLowerCase() ?? "";
      return phaseName.includes(q) || projectName.includes(q);
    });
  }, [phases, query]);

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

  const deletePhase = async (id: number) => {
    const target = phases.find((phase) => phase.id === id);
    const snapshot = phases;

    setPhases((prev) => prev.filter((phase) => phase.id !== id));

    try {
      await deleteProjectPhase(id);

      toast.success("Phase deleted", {
        description: `Phase "${target?.name ?? `#${id}`}" has been deleted.`,
      });
    } catch (err: any) {
      setPhases(snapshot);
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
    phases,
    filteredPhases,
    loading,
    error,
    query,
    setQuery,
    cols,
    colSpan,
    toggleColumn,
    deletePhase,
    reload: loadPhases,
    getStatusVariant,
  };
};
