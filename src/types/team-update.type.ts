export type TeamUpdateStatus = "IN_PROGRESS" | "NOT_STARTED" | "DONE"

export type TeamUpdateDeveloper = {
  id: number
  fullName: string
  email: string
  role: string
}

export type TeamUpdate = {
  id: number
  userId: number
  projectId: number
  status: TeamUpdateStatus
  yesterdayWork: string
  todayWork: string
  blocker: string | null
  nextAction: string
  updatedAt: string
  createdAt: string
  developer: TeamUpdateDeveloper
}
