// src/pages/admin/dashboard/projects/components/edit-project-form.tsx
"use client"

import * as React from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon, Plus, Trash2, Check, Loader2 } from "lucide-react"

import { useEditProjectForm } from "../hooks/use-edit-project-form"

type Props = {
  projectId?: string
  onCancel: () => void
  onSuccess: () => void
}

export const EditProjectForm: React.FC<Props> = ({
  projectId,
  onCancel,
  onSuccess,
}) => {
const {
  formData,
  phases,
  loading,
  saving,
  error,
  isInvalidProjectDateRange,
  isAnyPhaseInvalid,
  handleChange,
  handleStatusChange,
  handleDateChange,
  handleAddPhase,
  handleRemovePhase,
  handlePhaseChange,
  addCategoryFromInput,
  removeCategory,
  handleSubmit,
} = useEditProjectForm({ projectId, onSuccess })


  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="rounded border p-6">
            <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
            Memuat data...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Project</CardTitle>
        <CardDescription>
          Ubah data project dan phases lalu simpan perubahan.
        </CardDescription>
      </CardHeader>
      <CardContent>


        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Basic info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Nama Project</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[42px]">
                {formData.categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm"
                  >
                    <span>{category}</span>
                    <button
                      type="button"
                      onClick={() => removeCategory(index)}
                      disabled={saving}
                      className="ml-1 hover:bg-primary/80 rounded-sm"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
                <Input
                  id="category"
                  type="text"
                  className="flex-1 border-0 shadow-none focus-visible:ring-0 min-w-[200px] p-0"
                  placeholder={
                    formData.categories.length === 0
                      ? "Ketik kategori dan tekan Enter..."
                      : "Tambah kategori..."
                  }
                  disabled={saving}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      const value = e.currentTarget.value.trim()
                      if (value) {
                        addCategoryFromInput(value)
                        e.currentTarget.value = ""
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Client</Label>
              <Input value={formData.ownerCompany} disabled />
            </div>

            <div className="space-y-2">
              <Label>Penanggung Jawab</Label>
              <Input value={formData.ownerName} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={handleStatusChange}
                disabled={saving}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Pilih Status Proyek" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOT_STARTED">NOT_STARTED</SelectItem>
                  <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                  <SelectItem value="ON_HOLD">ON_HOLD</SelectItem>
                  <SelectItem value="DONE">DONE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Completion</Label>
              <div className="text-sm text-muted-foreground">
                {formData.completion || "0"}%{" "}
              </div>
            </div>


            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={saving}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {formData.startDate
                      ? format(formData.startDate, "PPP")
                      : "Pilih tanggal mulai"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) =>
                      handleDateChange("startDate", date || undefined)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={saving}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground",
                      isInvalidProjectDateRange && "border-red-500 text-red-600",
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {formData.endDate
                      ? format(formData.endDate, "PPP")
                      : "Pilih tanggal selesai"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) =>
                      handleDateChange("endDate", date || undefined)
                    }
                    disabled={(date) =>
                      formData.startDate ? date <= formData.startDate : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {isInvalidProjectDateRange && (
                <p className="text-red-600 text-sm">
                  Tanggal selesai tidak boleh sebelum atau sama dengan tanggal
                  mulai.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Catatan tambahan"
              disabled={saving}
            />
          </div>

          {/* Phases */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <Label>Fase Proyek</Label>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddPhase}
                className="flex items-center gap-2"
                disabled={saving}
              >
                <Plus className="size-4" />
                Tambah Fase
              </Button>
            </div>

            {phases.map((phase, i) => {
              const isPhaseDateRangeInvalid =
                phase.startDate &&
                phase.endDate &&
                phase.endDate <= phase.startDate

              const isPhaseOutsideProjectRange =
                (formData.startDate &&
                  phase.startDate &&
                  phase.startDate < formData.startDate) ||
                (formData.endDate &&
                  phase.endDate &&
                  phase.endDate > formData.endDate) ||
                (formData.endDate &&
                  phase.startDate &&
                  phase.startDate > formData.endDate)

              const isPhaseInvalid =
                isPhaseDateRangeInvalid || isPhaseOutsideProjectRange

              return (
                <div
                  key={phase.id || i}
                  className="border rounded-md p-4 space-y-3 bg-muted/20"
                >
                  <div className="flex justify-between items-center">
                    <Label>Fase {i + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePhase(i)}
                      className="text-red-500 hover:text-red-700"
                      disabled={saving}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Nama Fase</Label>
                    <Input
                      value={phase.name}
                      onChange={(e) =>
                        handlePhaseChange(i, "name", e.target.value)
                      }
                      placeholder={`Contoh: Phase ${i + 1}`}
                      disabled={saving}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tanggal Mulai</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            disabled={saving}
                            className={cn(
                              "justify-start text-left font-normal w-full",
                              !phase.startDate && "text-muted-foreground",
                              isPhaseInvalid && "border-red-500 text-red-600",
                            )}
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
                              handlePhaseChange(
                                i,
                                "startDate",
                                date || undefined,
                              )
                            }
                            disabled={(date) => {
                              const beforeProjectStart = formData.startDate
                                ? date < formData.startDate
                                : false
                              const afterProjectEnd = formData.endDate
                                ? date > formData.endDate
                                : false
                              return beforeProjectStart || afterProjectEnd
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {formData.startDate &&
                        phase.startDate &&
                        phase.startDate < formData.startDate && (
                          <p className="text-red-600 text-sm">
                            Tanggal mulai fase tidak boleh sebelum tanggal mulai
                            project.
                          </p>
                        )}
                      {formData.endDate &&
                        phase.startDate &&
                        phase.startDate > formData.endDate && (
                          <p className="text-red-600 text-sm">
                            Tanggal mulai fase tidak boleh setelah tanggal selesai
                            project.
                          </p>
                        )}
                    </div>

                    <div className="space-y-2">
                      <Label>Tanggal Selesai</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            disabled={saving}
                            className={cn(
                              "justify-start text-left font-normal w-full",
                              !phase.endDate && "text-muted-foreground",
                              isPhaseInvalid && "border-red-500 text-red-600",
                            )}
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
                              handlePhaseChange(
                                i,
                                "endDate",
                                date || undefined,
                              )
                            }
                            disabled={(date) => {
                              const afterPhaseStart = phase.startDate
                                ? date <= phase.startDate
                                : false
                              const afterProjectEnd = formData.endDate
                                ? date > formData.endDate
                                : false
                              return afterPhaseStart || afterProjectEnd
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {isPhaseDateRangeInvalid && (
                        <p className="text-red-600 text-sm">
                          Tanggal selesai tidak boleh sebelum atau sama dengan
                          tanggal mulai fase.
                        </p>
                      )}
                      {formData.endDate &&
                        phase.endDate &&
                        phase.endDate > formData.endDate && (
                          <p className="text-red-600 text-sm">
                            Tanggal selesai fase tidak boleh setelah tanggal
                            selesai project.
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={saving}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={saving || isInvalidProjectDateRange || isAnyPhaseInvalid}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
