"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  ProjectStatus,
  ProjectDetail,
  ProjectPhaseForm,
  UpdateProjectPayload,
} from "@/types/project.type"
import {
  fetchProjectById,
  updateProject,
} from "@/services/project.service"
import {
  syncProjectPhases,
  type EditProjectPhaseForm,
} from "@/services/project-phase.service"

type FormData = {
  name: string
  categories: string[]
  ownerId: number | undefined
  startDate: Date | undefined
  endDate: Date | undefined
  status: ProjectStatus
  completion: string
  notes: string
  ownerName: string
  ownerCompany: string
}

type UseEditProjectFormOptions = {
  projectId?: string
  onSuccess: () => void
}

const parseDate = (value?: string): Date | undefined => {
  if (!value) return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

export const useEditProjectForm = ({
  projectId,
  onSuccess,
}: UseEditProjectFormOptions) => {
  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    categories: [],
    ownerId: undefined,
    startDate: undefined,
    endDate: undefined,
    status: "NOT_STARTED",
    completion: "0",
    notes: "",
    ownerName: "",
    ownerCompany: "",
  })

  const [phases, setPhases] = React.useState<EditProjectPhaseForm[]>([])
  const [deletedPhaseIds, setDeletedPhaseIds] = React.useState<number[]>([])

  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState("")

  const isInvalidProjectDateRange =
    formData.startDate &&
    formData.endDate &&
    formData.endDate <= formData.startDate

  const invalidPhaseIndex = React.useMemo(() => {
    const projectStart = formData.startDate
    const projectEnd = formData.endDate

    if (!projectStart || !projectEnd) return -1

    return phases.findIndex((p) => {
      if (p.startDate && p.endDate && p.endDate <= p.startDate) return true
      if (p.startDate && p.startDate < projectStart) return true
      if (p.endDate && p.endDate > projectEnd) return true
      if (p.startDate && p.startDate > projectEnd) return true
      return false
    })
  }, [phases, formData.startDate, formData.endDate])

  const isAnyPhaseInvalid = invalidPhaseIndex !== -1

  // --------- HYDRATE dari API ---------
  const hydrateFromDetail = (d: ProjectDetail) => {
    const statusFromApi = d.status as ProjectStatus
    const safeStatus: ProjectStatus =
      statusFromApi === "NOT_STARTED" ||
      statusFromApi === "IN_PROGRESS" ||
      statusFromApi === "DONE"
        ? statusFromApi
        : "NOT_STARTED"

    setFormData({
      name: d.name ?? "",
      categories: d.categories ?? [],
      ownerId: d.ownerId,
      startDate: parseDate(d.startDate),
      endDate: parseDate(d.endDate),
      status: safeStatus,
      completion: String(d.completion ?? 0),
      notes: d.notes ?? "",
      ownerName: d.owner?.name ?? "Tidak Diketahui",
      ownerCompany: d.owner?.company ?? "Tidak Diketahui",
    })

    setPhases(
      (d.phases ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        startDate: parseDate(p.startDate),
        endDate: parseDate(p.endDate),
      })),
    )
  }

  React.useEffect(() => {
    if (!projectId) {
      setLoading(false)
      setError("Project ID tidak ditemukan.")
      return
    }

    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const detail = await fetchProjectById(Number(projectId))
        hydrateFromDetail(detail)
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || "Gagal memuat data project."
        setError(msg)
        toast.error("Gagal memuat project", { description: msg })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [projectId])

  // --------- HANDLER FIELD BASIC ---------
  const handleChange = (field: keyof FormData, value: string) => {
    if (field === "completion") {
      // hanya angka + titik
      const sanitized = value.replace(/[^0-9.]/g, "")
      const parts = sanitized.split(".")
      let finalValue = parts[0]
      if (parts.length > 1) {
        finalValue = parts[0] + "." + parts.slice(1).join("")
      }

      const numValue = parseFloat(finalValue)
      if (!Number.isNaN(numValue)) {
        if (numValue > 100) finalValue = "100"
        if (numValue < 0) finalValue = "0"
      }

      setFormData((prev) => ({ ...prev, completion: finalValue }))
      return
    }

    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value as ProjectStatus }))
  }

  const handleDateChange = (field: "startDate" | "endDate", date?: Date) => {
    setFormData((prev) => ({ ...prev, [field]: date }))
  }

  // --------- CATEGORY ---------
  const addCategoryFromInput = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return

    setFormData((prev) => {
      if (prev.categories.includes(trimmed)) return prev
      return {
        ...prev,
        categories: [...prev.categories, trimmed],
      }
    })
  }

  const removeCategory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }))
  }

  // --------- PHASES ---------
  const handleAddPhase = () => {
    setPhases((prev) => [
      ...prev,
      { name: "", startDate: undefined, endDate: undefined },
    ])
  }

  const handleRemovePhase = (index: number) => {
    setPhases((prev) => {
      const target = prev[index]
      if (target?.id) {
        setDeletedPhaseIds((ids) => [...ids, target.id!])
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const handlePhaseChange = (
    index: number,
    field: keyof EditProjectPhaseForm,
    value: EditProjectPhaseForm[typeof field],
  ) => {
    setPhases((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    )
  }

  // --------- SUBMIT ---------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId || saving) return

    if (!formData.name.trim()) {
      toast.warning("Nama project wajib diisi", {
        description: "Harap isi nama project sebelum menyimpan.",
      })
      return
    }

    if (!formData.ownerId) {
      toast.warning("Owner tidak valid", {
        description: "Owner ID tidak ditemukan pada data project.",
      })
      return
    }

    if (
      formData.categories.length === 0 ||
      formData.categories[0].trim() === ""
    ) {
      toast.warning("Kategori wajib diisi", {
        description: "Project minimal harus punya satu kategori.",
      })
      return
    }

    if (!formData.startDate || !formData.endDate) {
      toast.warning("Tanggal belum lengkap", {
        description: "Tanggal mulai dan tanggal selesai wajib diisi.",
      })
      return
    }

    if (isInvalidProjectDateRange) {
      toast.warning("Tanggal project tidak valid", {
        description: "Tanggal selesai proyek harus setelah tanggal mulai.",
      })
      return
    }

    if (isAnyPhaseInvalid) {
      toast.warning("Fase tidak valid", {
        description:
          "Ada fase dengan tanggal di luar rentang project atau tanggal mulai/selesai tidak valid.",
      })
      return
    }

    setSaving(true)
    setError("")

    try {
      const completionNum = parseFloat(formData.completion.replace(",", "."))
      const safeCompletion = Number.isFinite(completionNum)
        ? Math.max(0, Math.min(100, completionNum))
        : 0

      const payload: UpdateProjectPayload = {
        name: formData.name.trim(),
        categories: formData.categories.filter((c) => c.trim() !== ""),
        ownerId: formData.ownerId,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        completion: safeCompletion,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
      }

      await updateProject(Number(projectId), payload)

      await syncProjectPhases(
        Number(projectId),
        phases,
        deletedPhaseIds,
      )

      toast.success("Project berhasil diperbarui", {
        description: "Perubahan project dan phases berhasil disimpan.",
      })

      onSuccess()
    } catch (err: any) {
      let msg =
        err?.response?.data?.message || "Gagal menyimpan perubahan."
      if (err?.response?.data?.issues) {
        msg = err.response.data.issues
          .map((i: any) => i.message)
          .join(", ")
      }

      setError(msg)
      toast.error("Gagal menyimpan perubahan project", {
        description: msg,
      })
    } finally {
      setSaving(false)
    }
  }

  return {
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
  }
}
