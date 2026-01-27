export interface Developer {
  userId: number
  fullName: string
  email: string
  completedTicketCount: number
  averagePriorityScore: number
  averageDueUrgencyScore: number
  ticketLoadScore: number
  rewardScore: number
}

export interface CriteriaWeights {
  priority: number
  dueTime: number
  ticketLoad: number
}

export interface LeaderboardData {
  projectId: number
  projectName: string
  criteriaWeights: CriteriaWeights
  developers: Developer[]
}

export interface LeaderboardError {
  message: string
  status?: number
}