// hooks/use-all-issues.ts
import * as React from "react"
import { fetchAdminTickets } from "@/services/ticket.service"
import type { AdminTicket } from "@/types/ticket-type"

export function useAllIssues(search?: string) {
  const [tickets, setTickets] = React.useState<AdminTicket[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null) // ← Pastikan type ini

  const fetchTickets = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await fetchAdminTickets({
        type: "ISSUE",
        search: search && search.trim().length > 0 ? search : undefined,
      })
      
      setTickets(data)
    } catch (err) {
      console.error("Failed to fetch all issues:", err)
      setError(err instanceof Error ? err.message : "Failed to load issues")
    } finally {
      setLoading(false)
    }
  }, [search])

  React.useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  return { 
    tickets, 
    loading, 
    error, // ← Pastikan ini di-return
    refetch: fetchTickets 
  }
}