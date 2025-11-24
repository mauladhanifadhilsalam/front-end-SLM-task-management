"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import type { ProjectDetail } from "@/types/project.type"
import {
  fetchProjectById,
  deleteProjectById,
} from "@/services/project.service"

type UseProjectDetailResult = {
  project: ProjectDetail | null
  loading: boolean
  deleting: boolean
  error: string
  handleDelete: () => void
}

export const useProjectDetail = (id?: string): UseProjectDetailResult => {
    const navigate = useNavigate()
    const [project, setProject] = React.useState<ProjectDetail | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [deleting, setDeleting] = React.useState(false)
    const [error, setError] = React.useState("")

    const fetchData = React.useCallback(async () => {
        if (!id) {
        setError("ID project tidak ditemukan")
        setLoading(false)
        return
        }

        const numericId = Number(id)
        if (Number.isNaN(numericId)) {
        setError("ID project tidak valid")
        setLoading(false)
        return
        }

        setLoading(true)
        setError("")

        try {
        const data = await fetchProjectById(numericId)
        setProject(data)
        } catch (e: any) {
        const msg =
            e?.response?.data?.message || "Gagal memuat data project"
        setError(msg)
        } finally {
        setLoading(false)
        }
    }, [id])

    React.useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleDelete = async () => {
        if (!project) return

        setDeleting(true)
        setError("")

        try {
        await deleteProjectById(project.id)

        toast.success("Project dihapus", {
            description: `Project "${project.name}" berhasil dihapus.`,
        })

        navigate("/admin/dashboard/projects")
        } catch (e: any) {
        const msg = e?.response?.data?.message || "Gagal menghapus project"
        setError(msg)
        toast.error("Gagal menghapus project", {
            description: msg,
        })
        } finally {
        setDeleting(false)
        }
    }

    return {
        project,
        loading,
        deleting,
        error,
        handleDelete,
    }
}
