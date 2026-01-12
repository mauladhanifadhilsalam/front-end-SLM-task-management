"use client"

import * as React from "react"
import { toast } from "sonner"
import { createProject } from "@/services/project.service"
import { getProjectOwners } from "@/services/project.service"
import { fetchAssignableUsers } from "@/services/user.service"
import {
  ProjectOwnerLite,
  ProjectPhaseForm,
  ProjectAssignmentForm} from "@/types/project.type"
import { UserLite } from "@/types/user.types"
import {
  createProjectSchema,
  type CreateProjectValues,
} from "@/schemas/project.schema"

type State = {
  name: string
  categories: string[]
  ownerId?: number
  startDate?: Date
  endDate?: Date
  status: string
  completion: string
  notes: string
  phases: ProjectPhaseForm[]
  assignments: ProjectAssignmentForm[]
}

type UseCreateProjectFormOptions = {
  onSuccess?: (name: string) => void
  onUnauthorized?: () => void
}

const initialState: State = {
  name: "",
  categories: [],
  ownerId: undefined,
  startDate: undefined,
  endDate: undefined,
  status: "NOT_STARTED",
  completion: "0",
  notes: "",
  phases: [],
  assignments: [],
}

export const useCreateProjectForm = (
  options: UseCreateProjectFormOptions = {},
) => {
  const { onSuccess, onUnauthorized } = options

  const [form, setForm] = React.useState<State>(initialState)
  const [owners, setOwners] = React.useState<ProjectOwnerLite[]>([])
  const [users, setUsers] = React.useState<UserLite[]>([])
  const [openOwner, setOpenOwner] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const loadOwners = async () => {
      try {
        const data = await getProjectOwners()
        setOwners(data)
      } catch (err) {
        toast.error("Gagal memuat data owners")
      }
    }

    const loadUsers = async () => {
      try {
        const data = await fetchAssignableUsers()
        setUsers(data)
      } catch (err) {
        toast.error("Gagal memuat data users")
      }
    }

    loadOwners()
    loadUsers()
  }, [])

  const updateField = <K extends keyof State>(key: K, value: State[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const addCategory = (value: string) => {
    const v = value.trim()
    if (!v) return
    if (form.categories.includes(v)) return
    setForm((prev) => ({
      ...prev,
      categories: [...prev.categories, v],
    }))
  }

  const removeCategory = (index: number) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }))
  }

  const addPhase = () => {
    setForm((prev) => ({
      ...prev,
      phases: [
        ...prev.phases,
        { name: "", startDate: undefined, endDate: undefined },
      ],
    }))
  }

  const removePhase = (index: number) => {
    setForm((prev) => ({
      ...prev,
      phases: prev.phases.filter((_, i) => i !== index),
    }))
  }

  const updatePhase = <K extends keyof ProjectPhaseForm>(
    index: number,
    key: K,
    value: ProjectPhaseForm[K],
  ) => {
    setForm((prev) => {
      const phases = [...prev.phases]
      phases[index] = { ...phases[index], [key]: value }
      return { ...prev, phases }
    })
  }

  const addAssignment = () => {
    setForm((prev) => ({
      ...prev,
      assignments: [
        ...prev.assignments,
        { userId: 0 },
      ],
    }))
  }

  const removeAssignment = (index: number) => {
    setForm((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((_, i) => i !== index),
    }))
  }

  const updateAssignment = <K extends keyof ProjectAssignmentForm>(
    index: number,
    key: K,
    value: ProjectAssignmentForm[K],
  ) => {
    setForm((prev) => {
      const assignments = [...prev.assignments]
      assignments[index] = { ...assignments[index], [key]: value }
      return { ...prev, assignments }
    })
  }

        const isInvalidDateRange = !!(
        form.startDate &&
        form.endDate &&
        form.endDate <= form.startDate
        )


  const invalidPhaseIndex = form.phases.findIndex(
    (p) => p.startDate && p.endDate && p.endDate <= p.startDate,
  )

  const isAnyPhaseStartTooEarly = form.phases.some(
    (p) =>
      p.startDate &&
      form.startDate &&
      p.startDate < form.startDate,
  )

  const isAnyPhaseStartTooLate = form.phases.some(
    (p) =>
      p.startDate &&
      form.endDate &&
      p.startDate > form.endDate,
  )

  const isAnyPhaseEndTooLate = form.phases.some(
    (p) =>
      p.endDate &&
      form.endDate &&
      p.endDate > form.endDate,
  )

  const isAnyPhaseInvalid =
    invalidPhaseIndex !== -1 ||
    isAnyPhaseStartTooEarly ||
    isAnyPhaseStartTooLate ||
    isAnyPhaseEndTooLate

  const hasIncompleteAssignment =
    form.assignments.length > 0 &&
    form.assignments.some((a) => a.userId === 0)

  const handleSubmit: React.FormEventHandler<HTMLFormElement> =
    async (e) => {
      e.preventDefault()
      setLoading(true)

      if (!form.name || !form.ownerId) {
        toast.warning("Form belum lengkap", {
          description:
            "Nama project dan pemilik wajib diisi.",
        })
        setLoading(false)
        return
      }

      if (!form.startDate || !form.endDate) {
        toast.warning("Form belum lengkap", {
          description:
            "Tanggal Mulai dan Tanggal Selesai wajib diisi.",
        })
        setLoading(false)
        return
      }

      if (
        form.categories.length === 0 ||
        form.categories[0].trim() === ""
      ) {
        toast.warning("Kategori belum diisi", {
          description:
            "Project wajib memiliki minimal satu kategori.",
        })
        setLoading(false)
        return
      }

      if (isInvalidDateRange) {
        toast.warning("Rentang tanggal project tidak valid", {
          description:
            "Tanggal selesai tidak boleh sama atau sebelum tanggal mulai project.",
        })
        setLoading(false)
        return
      }

      if (hasIncompleteAssignment) {
        toast.warning(
          "Assignment tim belum lengkap",
          {
            description:
              "Semua assignment harus memiliki User dan Role yang valid.",
          },
        )
        setLoading(false)
        return
      }

      if (!form.notes || form.notes.trim() === "") {
        toast.warning("Catatan belum diisi", {
          description:
            "Project wajib memiliki catatan (notes).",
        })
        setLoading(false)
        return
      }

      if (!form.phases || form.phases.length === 0) {
        toast.warning("Fase belum diisi", {
          description:
            "Project wajib memiliki minimal satu fase.",
        })
        setLoading(false)
        return
      }

      const raw =
        typeof form.completion === "string"
          ? form.completion.trim()
          : String(form.completion)
      const parsed = raw
        ? parseFloat(raw.replace(",", "."))
        : NaN
      const completionValue = Number.isFinite(parsed)
        ? Math.max(0, Math.min(100, parsed))
        : 0

      const phases = form.phases
        .filter((p) => p.name.trim() !== "")
        .map((p) => ({
          name: p.name.trim(),
          startDate: p.startDate
            ? p.startDate.toISOString()
            : undefined,
          endDate: p.endDate
            ? p.endDate.toISOString()
            : undefined,
        }))

      const assignments = form.assignments
        .filter(
          (a) =>
            a.userId > 0,
        )
        .map((a) => ({
          userId: a.userId,
        }))

      const payload = {
        name: form.name.trim(),
        categories: form.categories.filter(
          (c) => c.trim() !== "",
        ),
        ownerId: form.ownerId,
        startDate: form.startDate.toISOString(),
        endDate: form.endDate.toISOString(),
        status: form.status,
        completion: completionValue,
        notes: form.notes.trim(),
        phases,
        assignments:
          assignments.length > 0
            ? assignments
            : undefined,
      }

      const parsedSchema =
        createProjectSchema.safeParse(payload as CreateProjectValues)

      if (!parsedSchema.success) {
        const msg =
          parsedSchema.error.issues[0]?.message ||
          "Data project belum valid."
        toast.warning("Validasi gagal", {
          description: msg,
        })
        setLoading(false)
        return
      }

      try {
        await createProject(payload)

        toast.success("Project berhasil dibuat", {
          description: `Project "${form.name}" berhasil dibuat.`,
        })

        setForm(initialState)

        if (onSuccess) onSuccess(form.name)
      } catch (err: any) {
        let errorText =
          "Gagal membuat project. Terjadi kesalahan jaringan atau server tidak merespons."

        if (err.response) {
          const status = err.response.status
          const data = err.response.data

          if (status === 401) {
            errorText =
              "Otorisasi Gagal. Token tidak valid. Silakan login ulang."
            if (onUnauthorized) onUnauthorized()
          } else if (status === 400) {
            const zodIssues = data?.issues
              ? data.issues
                  .map((i: any) => i.message)
                  .join(", ")
              : null
            errorText =
              zodIssues ||
              data?.message ||
              "Data tidak valid (Bad Request)."
          } else if (status === 404) {
            errorText =
              data?.message || "Resource tidak ditemukan."
          } else {
            errorText =
              data?.message || `Server Error: ${status}.`
          }
        }

        toast.error("Gagal membuat project", {
          description: errorText,
        })
      } finally {
        setLoading(false)
      }
    }

  return {
    form,
    owners,
    users,
    openOwner,
    setOpenOwner,
    loading,
    isInvalidDateRange,
    isAnyPhaseInvalid,
    hasIncompleteAssignment,
    updateField,
    addCategory,
    removeCategory,
    addPhase,
    removePhase,
    updatePhase,
    addAssignment,
    removeAssignment,
    updateAssignment,
    handleSubmit,
  }
}
