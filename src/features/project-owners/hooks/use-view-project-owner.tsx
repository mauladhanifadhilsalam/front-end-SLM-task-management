"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  getProjectOwnerById,
  deleteProjectOwnerById,
} from "@/services/project-owner.service"
import { ProjectOwner } from "@/types/project-owner.type"

type UseViewProjectOwnerOptions = {
  ownerId?: string
  onDeleted?: () => void
}

type State = {
  owner: ProjectOwner | null
  loading: boolean
  deleting: boolean
  error: string | null
}

export const useViewProjectOwner = (options: UseViewProjectOwnerOptions) => {
    const { ownerId, onDeleted } = options

    const [state, setState] = React.useState<State>({
        owner: null,
        loading: true,
        deleting: false,
        error: null,
    })

    const loadOwner = React.useCallback(async () => {
        if (!ownerId) {
        setState((prev) => ({
            ...prev,
            loading: false,
            error: "ID project owner tidak ditemukan.",
        }))
        return
        }

        setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        }))

        try {
        const data = await getProjectOwnerById(ownerId)
        setState({
            owner: data,
            loading: false,
            deleting: false,
            error: null,
        })
        } catch (err: any) {
        const msg =
            err?.response?.data?.message ||
            "Gagal memuat data project owner."
        setState((prev) => ({
            ...prev,
            loading: false,
            error: msg,
        }))
        toast.error("Gagal memuat data owner", {
            description: msg,
        })
        }
    }, [ownerId])

    React.useEffect(() => {
        loadOwner()
    }, [loadOwner])

    const handleDelete = React.useCallback(async () => {
        if (!state.owner) return

        setState((prev) => ({
        ...prev,
        deleting: true,
        error: null,
        }))

        try {
        await deleteProjectOwnerById(state.owner.id)

        toast.success("Owner berhasil dihapus", {
            description: `Project owner "${state.owner.name}" telah dihapus.`,
        })

        if (onDeleted) onDeleted()
        } catch (err: any) {
        const msg =
            err?.response?.data?.message || "Gagal menghapus owner."
        setState((prev) => ({
            ...prev,
            deleting: false,
            error: msg,
        }))
        toast.error("Gagal menghapus owner", {
            description: msg,
        })
        }
    }, [state.owner, onDeleted])

    return {
        owner: state.owner,
        loading: state.loading,
        deleting: state.deleting,
        error: state.error,
        handleDelete,
        reload: loadOwner,
    }
}
