export type PmDailyCadenceHistoryItem = {
  date: string
  note: string
  totalIssues: number
}

export type PmDailyCadence = {
  projectId: number
  date: string
  progress: string
  remainingProgress: string
  totalDevelopersInvolved: number
  totalModules: number
  totalIssues: number
  history: PmDailyCadenceHistoryItem[]
}
