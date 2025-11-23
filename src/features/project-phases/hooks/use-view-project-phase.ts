import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { Phase } from "@/types/project-phases.type";
import {
  fetchProjectPhaseById,
  deleteProjectPhase,
} from "@/services/project-phase.service";

export const useViewProjectPhase = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [phase, setPhase] = React.useState<Phase | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const loadPhase = async () => {
      if (!id) {
        setError("Invalid phase ID");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await fetchProjectPhaseById(Number(id));
        setPhase(data);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || "Failed to load phase details";
        setError(msg);
        toast.error("Failed to load phase details", {
          description: msg,
        });
      } finally {
        setLoading(false);
      }
    };

    loadPhase();
  }, [id]);

  const handleDelete = async () => {
    if (!phase) return;

    setDeleting(true);

    try {
      await deleteProjectPhase(phase.id);

      toast.success("Phase deleted", {
        description: `Phase "${phase.name}" has been deleted successfully.`,
      });

      navigate("/admin/dashboard/project-phases");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Failed to delete phase";
      toast.error("Failed to delete phase", {
        description: msg,
      });
      setDeleting(false);
    }
  };

  const handleBack = () => {
    navigate("/admin/dashboard/project-phases");
  };

  const getEditHref = () => {
    if (!phase) return "#";
    return `/admin/dashboard/project-phases/edit/${phase.id}`;
  };

  return {
    phase,
    loading,
    error,
    deleting,
    handleDelete,
    handleBack,
    getEditHref,
  };
};
