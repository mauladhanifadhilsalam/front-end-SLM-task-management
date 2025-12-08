import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconCheck } from "@tabler/icons-react";
import type { Project } from "@/types/project.type";
import type { EditProjectPhaseField } from "../hooks/use-edit-project-phase-form";

type FormState = {
  name: string;
  startDate: string;
  endDate: string;
  projectId: string;
};

type FieldErrors = Partial<Record<EditProjectPhaseField, string>>;

type Props = {
  projects: Project[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  form: FormState;
  fieldErrors: FieldErrors;
  onChange: (field: EditProjectPhaseField, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

export const EditProjectPhaseForm: React.FC<Props> = ({
  projects,
  loading,
  saving,
  error,
  form,
  fieldErrors,
  onChange,
  onSubmit,
  onCancel,
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="rounded border p-6">
            Loading phase data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phase Information</CardTitle>
        <CardDescription>
          Modify the phase details below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Phase Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Enter phase name"
              disabled={saving}
              aria-invalid={!!fieldErrors.name}
              required
            />
            {fieldErrors.name && (
              <p className="text-xs text-red-600 mt-1">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => onChange("startDate", e.target.value)}
                disabled={saving}
                aria-invalid={!!fieldErrors.startDate}
                required
              />
              {fieldErrors.startDate && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.startDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(e) => onChange("endDate", e.target.value)}
                disabled={saving}
                aria-invalid={!!fieldErrors.endDate}
                required
                min={form.startDate || undefined}
              />
              {fieldErrors.endDate && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.endDate}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Select
              value={form.projectId}
              onValueChange={(value) => onChange("projectId", value)}
              disabled={saving || loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent className="min-w-[260px] max-h-64 overflow-auto">
                {projects.map((project) => (
                  <SelectItem
                    key={project.id}
                    value={String(project.id)}
                    className="whitespace-normal leading-snug"
                  >
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.projectId && (
              <p className="text-xs text-red-600 mt-1">
                {fieldErrors.projectId}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:space-x-3 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              <IconCheck className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
