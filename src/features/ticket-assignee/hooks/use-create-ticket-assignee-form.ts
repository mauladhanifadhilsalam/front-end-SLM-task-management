import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import axios from "axios"
import { z } from "zod"

import {
  createTicketAssigneeSchema,
  projectSchema,
  ticketSchema,
  userSchema,
  type CreateTicketAssigneeInput,
  type Project,
  type Ticket,
  type User,
} from "@/schemas/ticket-assignee.schema"
import { createTicketAssignees } from "@/services/ticket-assignee.service"

const API_BASE = import.meta.env.VITE_API_BASE as string

type ValidationErrors = Partial<Record<keyof CreateTicketAssigneeInput, string>>

type FormState = {
  projectId?: number
  ticketId?: number
  userIds: number[]
}

const fieldNameMap: Record<string, string> = {
  projectId: "Project",
  ticketId: "Ticket",
  userIds: "Assignees",
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function useCreateTicketAssigneeForm() {
  const navigate = useNavigate()

  const [loading, setLoading] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [validationErrors, setValidationErrors] =
    React.useState<ValidationErrors>({})

  const [projects, setProjects] = React.useState<Project[]>([])
  const [tickets, setTickets] = React.useState<Ticket[]>([])
  const [projectUsers, setProjectUsers] = React.useState<User[]>([])
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(
    null,
  )

  const [formData, setFormData] = React.useState<FormState>({
    projectId: undefined,
    ticketId: undefined,
    userIds: [],
  })

  React.useEffect(() => {
    const fetchInitial = async () => {
      try {
        const headers = getAuthHeaders()

        const [projectRes, userRes] = await Promise.all([
          axios.get(`${API_BASE}/projects`, { headers }),
          axios.get(`${API_BASE}/users`, { headers }),
        ])

        const projectPayload = projectRes?.data?.data ?? projectRes?.data ?? []
        const userPayload = userRes?.data?.data ?? userRes?.data ?? []

        try {
          const validatedProjects = z
            .array(projectSchema)
            .parse(projectPayload ?? [])
          const validatedUsers = z.array(userSchema).parse(userPayload ?? [])

          setProjects(validatedProjects)
          setProjectUsers(validatedUsers)
        } catch {
          setProjects(projectPayload ?? [])
          setProjectUsers(userPayload ?? [])
        }
      } catch {
        const msg = "Gagal memuat data project atau user."
        setErrorMsg(msg)
        toast.error("Gagal memuat data", { description: msg })
      }
    }

    fetchInitial()
  }, [])

  React.useEffect(() => {
    const projectId = formData.projectId

    setTickets([])
    setSelectedTicket(null)
    setFormData((prev) => ({
      ...prev,
      ticketId: undefined,
      userIds: [],
    }))
    setValidationErrors({})

    if (!projectId) {
      return
    }

    const fetchTicketsAndProjectUsers = async () => {
      try {
        const headers = getAuthHeaders()

        const [ticketRes, projectAssignmentsRes] = await Promise.all([
          axios.get(`${API_BASE}/tickets`, {
            headers,
            params: { projectId },
          }),
          axios.get(`${API_BASE}/project-assignments`, {
            headers,
            params: { projectId },
          }),
        ])

        const ticketPayload = ticketRes?.data?.data ?? ticketRes?.data ?? []
        const assignmentPayload =
          projectAssignmentsRes?.data?.data ?? projectAssignmentsRes?.data ?? []

        try {
          const validatedTickets = z
            .array(ticketSchema)
            .parse(ticketPayload ?? [])
          setTickets(validatedTickets)
        } catch {
          setTickets(ticketPayload ?? [])
        }

        const extractedUsers = (assignmentPayload ?? []).map(
          (item: any) => item.user,
        )

        try {
          const validatedUsers = z.array(userSchema).parse(extractedUsers)
          setProjectUsers(validatedUsers)
        } catch {
          setProjectUsers(extractedUsers)
        }
      } catch {
        toast.error("Gagal memuat data project", {
          description: "Tidak dapat memuat ticket atau anggota project.",
        })
      }
    }

    fetchTicketsAndProjectUsers()
  }, [formData.projectId])

  React.useEffect(() => {
    const ticketId = formData.ticketId

    setFormData((prev) => ({
      ...prev,
      userIds: [],
    }))
    setValidationErrors((prev) => {
      const { userIds, ...rest } = prev
      return rest
    })

    if (!ticketId) {
      setSelectedTicket(null)
      return
    }

    const fetchTicketDetail = async () => {
      try {
        const res = await axios.get(`${API_BASE}/tickets/${ticketId}`, {
          headers: getAuthHeaders(),
        })

        const payload = res?.data?.data ?? res?.data
        try {
          const validatedTicket = ticketSchema.parse(payload)
          setSelectedTicket(validatedTicket)
        } catch {
          setSelectedTicket(payload ?? null)
        }
      } catch {
        setSelectedTicket(null)
      }
    }

    fetchTicketDetail()
  }, [formData.ticketId])

  const isUserAssigned = React.useCallback(
    (userId: number) => {
      if (!selectedTicket) return false
      if (!Array.isArray(selectedTicket.assignees)) return false
      return selectedTicket.assignees.some((a: any) => a.user?.id === userId)
    },
    [selectedTicket],
  )

  const handleProjectChange = (projectId: number) => {
    setFormData((prev) => ({
      ...prev,
      projectId,
      ticketId: undefined,
      userIds: [],
    }))

    setValidationErrors((prev) => {
      const { projectId: _ignored, ticketId, userIds, ...rest } = prev
      return rest
    })
  }

  const handleTicketChange = (ticketId: number) => {
    setFormData((prev) => ({
      ...prev,
      ticketId,
      userIds: [],
    }))

    setValidationErrors((prev) => {
      const { ticketId: _ignored, ...rest } = prev
      return rest
    })
  }

  const toggleUser = (userId: number) => {
    if (isUserAssigned(userId)) return

    setFormData((prev) => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter((id) => id !== userId)
        : [...prev.userIds, userId],
    }))

    setValidationErrors((prev) => {
      const { userIds, ...rest } = prev
      return rest
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setValidationErrors({})

    const validation = createTicketAssigneeSchema.safeParse(formData)

    if (!validation.success) {
      const fieldErrors: ValidationErrors = {}
      const missingFields: string[] = []

      validation.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (field && typeof field === "string") {
          fieldErrors[field as keyof CreateTicketAssigneeInput] =
            issue.message
          const label = fieldNameMap[field] || field
          if (!missingFields.includes(label)) {
            missingFields.push(label)
          }
        }
      })

      setValidationErrors(fieldErrors)

      let description = "Form belum lengkap"
      if (missingFields.length === 1) {
        description = `${missingFields[0]} wajib diisi.`
      } else if (missingFields.length > 1) {
        const last = missingFields[missingFields.length - 1]
        const rest = missingFields.slice(0, -1).join(", ")
        description = `${rest} dan ${last} wajib diisi.`
      }

      toast.error("Form belum lengkap", {
        description,
      })

      setLoading(false)
      return
    }

    const validatedData = validation.data

    try {
      await createTicketAssignees(
        validatedData.ticketId as number,
        validatedData.userIds,
      )

      const ticket = tickets.find((t) => t.id === validatedData.ticketId)
      const selectedUsers = projectUsers
        .filter((u) => validatedData.userIds.includes(u.id))
        .map((u) => u.fullName)
        .join(", ")

      toast.success("Ticket berhasil di-assign", {
        description: `Ticket "${ticket?.title}" di-assign ke: ${selectedUsers}`,
      })

      navigate("/admin/dashboard/ticket-assignees")
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Gagal assign ticket."
      setErrorMsg(msg)
      toast.error("Gagal assign ticket", { description: msg })
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    errorMsg,
    validationErrors,
    formData,
    projects,
    tickets,
    projectUsers,
    isUserAssigned,
    handleProjectChange,
    handleTicketChange,
    toggleUser,
    handleSubmit,
  }
}
