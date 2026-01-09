import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ProjectUpdate } from "@/types/project-update.type"
import type { ProjectUpdateFormData } from "./pm-daily-cadence"
import type { UseQueryResult } from "@tanstack/react-query"

type Phase = {
  id: number
  name: string
  startDate: string
  endDate: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingUpdate: ProjectUpdate | null
  formData: ProjectUpdateFormData
  setFormData: (data: ProjectUpdateFormData) => void
  phases: Phase[]
  phasesQuery: UseQueryResult<Phase[], Error>
  onSubmit: (e: React.FormEvent) => void
  formError: string | null
}

export function ProjectUpdateDialog({
  open,
  onOpenChange,
  editingUpdate,
  formData,
  setFormData,
  phases,
  phasesQuery,
  onSubmit,
  formError,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>
            {editingUpdate ? "Edit Project Update" : "Add Project Update"}
          </DialogTitle>
          <DialogDescription>
            {editingUpdate 
              ? "Update the project update information below."
              : "Fill in the details to create a new project update."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportDate">Tanggal</Label>
            <Input
              id="reportDate"
              type="date"
              value={formData.reportDate}
              onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phaseId">Phase</Label>
            <Select
              value={formData.phaseId}
              onValueChange={(value) => setFormData({ ...formData, phaseId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih phase" />
              </SelectTrigger>
              <SelectContent>
                {(phases.length > 0 ? phases : phasesQuery.data ?? []).map((phase) => (
                  <SelectItem key={phase.id} value={phase.id.toString()}>
                    {phase.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="participant">Peserta</Label>
            <Input
              id="participant"
              value={formData.participant}
              onChange={(e) => setFormData({ ...formData, participant: e.target.value })}
              placeholder="e.g., DevOps, Backend Developers"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objective">Tujuan Daily</Label>
            <Textarea
              id="objective"
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              placeholder="Describe the daily objective"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="progressHighlight">Highlight Progress</Label>
            <Textarea
              id="progressHighlight"
              value={formData.progressHighlight}
              onChange={(e) => setFormData({ ...formData, progressHighlight: e.target.value })}
              placeholder="Highlight key progress"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamMood">Mood Team</Label>
            <Input
              id="teamMood"
              value={formData.teamMood}
              onChange={(e) => setFormData({ ...formData, teamMood: e.target.value })}
              placeholder="e.g., Focused, moving steadily"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={onSubmit}>
              {editingUpdate ? "Update" : "Create"}
            </Button>
          </div>
          {formError ? <div className="text-destructive mt-2">{formError}</div> : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}