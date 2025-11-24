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
import type { CreateProjectPhaseField } from "../hooks/use-create-project-phase-form";

type FormState = {
  name: string;
  startDate: string;
  endDate: string;
  projectId: string;
};

type FieldErrors = Partial<Record<CreateProjectPhaseField, string>>;

type Props = {
  projects: Project[];
  loadingProjects: boolean;
  saving: boolean;
  error: string | null;
  form: FormState;
  fieldErrors: FieldErrors;
  onChange: (field: CreateProjectPhaseField, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

export const CreateProjectPhaseForm: React.FC<Props> = ({
  projects,
  loadingProjects,
  saving,
  error,
  form,
  fieldErrors,
  onChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Phase Information</CardTitle>
        <CardDescription>
          Enter the details for the new project phase
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
            <Label>Project *</Label>
            <Select
              value={form.projectId}
              onValueChange={(value) => onChange("projectId", value)}
              disabled={saving || loadingProjects}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingProjects ? "Loading projects..." : "Select a project"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={String(project.id)}>
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

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <IconCheck className="mr-2 h-4 w-4" />
              {saving ? "Creating..." : "Create Phase"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
