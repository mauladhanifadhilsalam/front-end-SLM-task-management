import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { fetchProjects } from "@/services/project.service";
import {
  fetchProjectPhaseById,
  updateProjectPhase,
} from "@/services/project-phase.service";
import type { Project } from "@/types/project.type";
import type { EditProjectPhasePayload } from "@/types/project-phases.type";
import { editProjectPhaseSchema } from "@/schemas/project-phase.schema";
import { toInputDate } from "@/utils/date-input-util";

export type EditProjectPhaseField =
  | "name"
  | "startDate"
  | "endDate"
  | "projectId";

type EditProjectPhaseFormState = {
  name: string;
  startDate: string;
  endDate: string;
  projectId: string;
};

type FieldErrors = Partial<Record<EditProjectPhaseField, string>>;

export const useEditProjectPhaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<EditProjectPhaseFormState>({
    name: "",
    startDate: "",
    endDate: "",
    projectId: "",
  });

  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  React.useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError("Invalid phase ID");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setFieldErrors({});

      try {
        const phaseId = Number(id);
        const [phase, projectList] = await Promise.all([
          fetchProjectPhaseById(phaseId),
          fetchProjects(),
        ]);

        setForm({
          name: phase.name ?? "",
          startDate: toInputDate(phase.startDate),
          endDate: toInputDate(phase.endDate),
          projectId: String(phase.projectId ?? ""),
        });

        setProjects(projectList);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || "Failed to load phase data";
        setError(msg);
        toast.error("Failed to load phase data", {
          description: msg,
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (field: EditProjectPhaseField, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (fieldErrors[field]) {
      const singleSchema = (editProjectPhaseSchema as any).pick({
        [field]: true,
      });

      const parsedValue =
        field === "projectId" ? Number(value || NaN) : value;

      const result = singleSchema.safeParse({ [field]: parsedValue });

      setFieldErrors((prev) => ({
        ...prev,
        [field]: result.success ? undefined : result.error.issues[0]?.message,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setError(null);
    setSaving(true);
    setFieldErrors({});

    const validationInput = {
      ...form,
      projectId: form.projectId ? Number(form.projectId) : form.projectId,
    };

    const parsed = editProjectPhaseSchema.safeParse(validationInput);

    if (!parsed.success) {
      const fe: FieldErrors = {};

      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as EditProjectPhaseField;
        if (!fe[key]) fe[key] = issue.message;
      }

      setFieldErrors(fe);

      toast.warning("Form belum valid", {
        description: "Periksa kembali nama phase, tanggal, dan project.",
      });

      setSaving(false);
      return;
    }

    const payload: EditProjectPhasePayload = {
      name: form.name,
      startDate: form.startDate,
      endDate: form.endDate,
      projectId: Number(form.projectId),
    };

    try {
      await updateProjectPhase(Number(id), payload);

      toast.success("Project phase updated", {
        description: "Project phase updated successfully.",
      });

      navigate("/admin/dashboard/project-phases");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Failed to update project phase";
      setError(msg);
      toast.error("Failed to update project phase", {
        description: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/dashboard/project-phases");
  };

  return {
    projects,
    loading,
    saving,
    error,
    form,
    fieldErrors,
    handleChange,
    handleSubmit,
    handleCancel,
  };
};
