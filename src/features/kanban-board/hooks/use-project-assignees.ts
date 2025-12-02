import { useCallback, useEffect, useState } from "react"

import { fetchProjectById } from "@/services/project.service"
import type { UserLite } from "@/types/user.types"

type UseProjectAssigneesResult = {
  assignees: UserLite[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export const useProjectAssignees = (projectId?: string): UseProjectAssigneesResult => {
  const [assignees, setAssignees] = useState<UserLite[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!projectId) {
      setAssignees([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const currentProjectId = Number(projectId)
      const project = await fetchProjectById(currentProjectId)
      const fromProject = project.assignments ?? []
      const source = fromProject.map((a: any) => ({
        assigneeId: a.user?.id,
        assigneeName: a.user?.fullName ?? a.user?.full_name ?? "",
        assigneeEmail: a.user?.email ?? "",
      }))

      // Unique by assigneeId
      const map = new Map<number, UserLite>()
      source.forEach((a) => {
        if (a.assigneeId == null) return
        map.set(Number(a.assigneeId), {
          id: Number(a.assigneeId),
          fullName: a.assigneeName ?? "",
          email: (a as any).assigneeEmail,
          role: "",
        })
      })

      setAssignees(Array.from(map.values()))
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Gagal memuat assignment project."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    void load()
  }, [load])

  return { assignees, loading, error, refresh: load }
}
