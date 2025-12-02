"use client"

import * as React from "react"
import axios from "axios"

const API_BASE = import.meta.env.VITE_API_BASE

export function useUnread() {
  const [unread, setUnread] = React.useState(0)

  React.useEffect(() => {
    const role = localStorage.getItem("role")
    const token = localStorage.getItem("token")

    if (!role || !token) return

    const endpointMap: Record<string, string> = {
      admin: "/dashboard/admin-overview",
      project_manager: "/dashboard/project-manager",
      developer: "/dashboard/developer",
    }

    const endpoint = endpointMap[role]
    if (!endpoint) return

    let mounted = true

    async function load() {
      try {
        const res = await axios.get(`${API_BASE}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const value = res.data?.unreadNotificationsCount || 0

        if (mounted) setUnread(value)
      } catch (err) {
        if (mounted) setUnread(0)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  return { unread }
}
