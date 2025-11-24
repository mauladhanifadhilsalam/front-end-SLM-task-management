import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchProjects } from "@/services/project.service";
import { createProjectPhase } from "@/services/project-phase.service";
import type { Project } from "@/types/project.type";
import type { CreateProjectPhasePayload } from "@/types/project-phases.type";
import { createProjectPhaseSchema } from "@/schemas/project-phase.schema";

export type CreateProjectPhaseField =
  | "name"
  | "startDate"
  | "endDate"
  | "projectId";

type CreateProjectPhaseFormState = {
  name: string;
  startDate: string;
  endDate: string;
  projectId: string;
};

type FieldErrors = Partial<Record<CreateProjectPhaseField, string>>;

export const useCreateProjectPhaseForm = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<CreateProjectPhaseFormState>({
    name: "",
    startDate: "",
    endDate: "",
    projectId: "",
  });

  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  React.useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  const handleChange = (field: CreateProjectPhaseField, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (fieldErrors[field]) {
      const singleSchema = (createProjectPhaseSchema as any).pick({
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
    setError(null);
    setSaving(true);
    setFieldErrors({});

    const forValidation = {
      ...form,
      projectId: form.projectId ? Number(form.projectId) : form.projectId,
    };

    const parsed = createProjectPhaseSchema.safeParse(forValidation);

    if (!parsed.success) {
      const fe: FieldErrors = {};

      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as CreateProjectPhaseField;
        if (!fe[key]) fe[key] = issue.message;
      }

      setFieldErrors(fe);

      toast.warning("Form belum valid", {
        description:
          "Periksa kembali nama fase, tanggal, dan project yang dipilih.",
      });

      setSaving(false);
      return;
    }

    const payload: CreateProjectPhasePayload = {
      name: form.name,
      startDate: form.startDate,
      endDate: form.endDate,
      projectId: Number(form.projectId),
    };

    try {
      await createProjectPhase(payload);

      toast.success("Project phase created", {
        description: "Project phase created successfully.",
      });

      navigate("/admin/dashboard/project-phases");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Failed to create project phase";
      setError(msg);

      toast.error("Failed to create project phase", {
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
    loadingProjects,
    saving,
    error,
    form,
    fieldErrors,
    handleChange,
    handleSubmit,
    handleCancel,
  };
};
