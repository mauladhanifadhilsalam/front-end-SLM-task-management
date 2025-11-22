"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { ProjectPhaseForm } from "@/types/project.type"

type Props = {
  phases: ProjectPhaseForm[]
  startDate?: Date
  endDate?: Date
  loading: boolean
  onAddPhase: () => void
  onRemovePhase: (index: number) => void
  onUpdatePhase: <K extends keyof ProjectPhaseForm>(
    index: number,
    key: K,
    value: ProjectPhaseForm[K],
  ) => void
}

export const ProjectPhasesSection: React.FC<Props> = ({
  phases,
  startDate,
  endDate,
  loading,
  onAddPhase,
  onRemovePhase,
  onUpdatePhase,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Fase Proyek</Label>
        <Button
          type="button"
          variant="outline"
          onClick={onAddPhase}
          className="flex items-center gap-2"
          disabled={loading}
        >
          <Plus className="size-4" />
          Tambah Fase
        </Button>
      </div>

      {phases.map((phase, i) => {
        const isPhaseInvalidInternal =
          phase.startDate &&
          phase.endDate &&
          phase.endDate <= phase.startDate

        const isPhaseEarlierThanProjectStart =
          startDate &&
          phase.startDate &&
          phase.startDate < startDate

        const isPhaseLaterThanProjectEndStart =
          endDate &&
          phase.startDate &&
          phase.startDate > endDate

        const isPhaseLaterThanProjectEnd =
          endDate &&
          phase.endDate &&
          phase.endDate > endDate

        return (
          <div
            key={i}
            className="border rounded-md p-4 space-y-3 bg-muted/20"
          >
            <div className="flex justify-between items-center">
              <Label>Fase {i + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemovePhase(i)}
                className="text-red-500 hover:text-red-700"
                disabled={loading}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Nama Fase</Label>
              <Input
                value={phase.name}
                onChange={(e) =>
                  onUpdatePhase(i, "name", e.target.value)
                }
                placeholder={`Contoh: Phase ${i + 1}`}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Mulai Fase</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal w-full",
                        !phase.startDate && "text-muted-foreground",
                        (isPhaseEarlierThanProjectStart ||
                          isPhaseLaterThanProjectEndStart) &&
                          "border-red-500 text-red-600",
                      )}
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {phase.startDate
                        ? format(phase.startDate, "PPP")
                        : "Pilih tanggal mulai"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={phase.startDate}
                      onSelect={(date) =>
                        onUpdatePhase(
                          i,
                          "startDate",
                          date || undefined,
                        )
                      }
                      initialFocus
                      disabled={(date) => {
                        const isEarlierThanProjectStart = startDate
                          ? date < startDate
                          : false
                        const isLaterThanProjectEnd = endDate
                          ? date > endDate
                          : false
                        return (
                          isEarlierThanProjectStart ||
                          isLaterThanProjectEnd
                        )
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {(isPhaseEarlierThanProjectStart ||
                  isPhaseLaterThanProjectEndStart) && (
                  <p className="text-red-600 text-sm">
                    Tanggal mulai fase harus di antara tanggal mulai dan selesai project.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tanggal Selesai Fase</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal w-full",
                        !phase.endDate && "text-muted-foreground",
                        (isPhaseInvalidInternal ||
                          isPhaseLaterThanProjectEnd) &&
                          "border-red-500 text-red-600",
                      )}
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {phase.endDate
                        ? format(phase.endDate, "PPP")
                        : "Pilih tanggal selesai"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={phase.endDate}
                      onSelect={(date) =>
                        onUpdatePhase(
                          i,
                          "endDate",
                          date || undefined,
                        )
                      }
                      initialFocus
                      disabled={(date) => {
                        const isEarlierThanPhaseStart = phase.startDate
                          ? date <= phase.startDate
                          : false
                        const isEarlierThanProjectStart = startDate
                          ? date < startDate
                          : false
                        const isLaterThanProjectEnd = endDate
                          ? date > endDate
                          : false
                        return (
                          isEarlierThanPhaseStart ||
                          isEarlierThanProjectStart ||
                          isLaterThanProjectEnd
                        )
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {isPhaseInvalidInternal && (
                  <p className="text-red-600 text-sm">
                    Tanggal selesai fase tidak boleh sebelum atau sama dengan tanggal mulai fase.
                  </p>
                )}
                {isPhaseLaterThanProjectEnd && (
                  <p className="text-red-600 text-sm">
                    Tanggal selesai fase tidak boleh melebihi tanggal selesai project utama.
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
