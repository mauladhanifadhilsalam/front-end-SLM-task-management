import { useState, useEffect } from 'react'
import type { LeaderboardData } from '@/types/leaderboard.types'
import { fetchInboxLeaderboard } from '@/services/leaderboard.service'

interface UseInboxLeaderboardReturn {
  data: LeaderboardData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useInboxLeaderboard = (): UseInboxLeaderboardReturn => {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await fetchInboxLeaderboard()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An error occurred while fetching leaderboard'
      
      setError(errorMessage)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  return { 
    data, 
    loading, 
    error,
    refetch: fetchLeaderboard 
  }
}