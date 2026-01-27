import { api } from "@/lib/api"
import type { CriteriaWeights, Developer, LeaderboardData } from "@/types/leaderboard.types"
import { extractArrayFromApi } from "@/utils/api-response.util"


const mapCriteriaWeights = (item: any): CriteriaWeights => ({
  priority: Number(item?.priority ?? item?.priority ?? 0),
  dueTime: Number(item?.dueTime ?? item?.due_time ?? 0),
  ticketLoad: Number(item?.ticketLoad ?? item?.ticket_load ?? 0),
})

const mapDeveloper = (item: any): Developer => ({
  userId: Number(item?.userId ?? item?.user_id ?? 0),
  fullName: String(item?.fullName ?? item?.full_name ?? "-"),
  email: String(item?.email ?? "-"),
  completedTicketCount: Number(item?.completedTicketCount ?? item?.completed_ticket_count ?? 0),
  averagePriorityScore: Number(item?.averagePriorityScore ?? item?.average_priority_score ?? 0),
  averageDueUrgencyScore: Number(item?.averageDueUrgencyScore ?? item?.average_due_urgency_score ?? 0),
  ticketLoadScore: Number(item?.ticketLoadScore ?? item?.ticket_load_score ?? 0),
  rewardScore: Number(item?.rewardScore ?? item?.reward_score ?? 0),
})

const mapLeaderboardData = (item: any): LeaderboardData => ({
  projectId: Number(item?.projectId ?? item?.project_id ?? 0),
  projectName: String(item?.projectName ?? item?.project_name ?? "-"),
  criteriaWeights: mapCriteriaWeights(item?.criteriaWeights ?? item?.criteria_weights ?? {}),
  developers: extractArrayFromApi(item, ["developers"])
    .map(mapDeveloper)
    .sort((a, b) => b.rewardScore - a.rewardScore) as Developer[],
})

export const fetchInboxLeaderboard = async (): Promise<LeaderboardData> => {
  const { data } = await api.get("/dashboard/project-manager/inbox-leaderboard")
  const item = (data as any)?.data ?? data
  return mapLeaderboardData(item)
}

export const refreshLeaderboard = async (projectId: number): Promise<LeaderboardData> => {
  const { data } = await api.post(
    `/dashboard/project-manager/inbox-leaderboard/${projectId}/refresh`
  )
  const item = (data as any)?.data ?? data
  return mapLeaderboardData(item)
}