import { useCallback, useEffect, useState } from "react"

import { fetchAssignableUsers } from "@/services/user.service"
import type { UserLite } from "@/types/user.types"

export const useAssignableUsers = () => {
  const [users, setUsers] = useState<UserLite[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchAssignableUsers()
      setUsers(list)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Gagal memuat assignee."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { users, loading, error, refresh: load }
}
