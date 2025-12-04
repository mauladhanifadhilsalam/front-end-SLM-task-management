// src/types/developer-dashboard.type.ts
export type DeveloperDashboard = {
  userId: number
  fullName: string
  email: string

  // Task metrics
  totalAssignedTasks: number
  tasksInProgress: number
  overdueTasks: number
  taskCompletionPercentage: number
  openTasksHighPriority: number
  tasksDueNext7Days: number
  completedTasksLast7Days: number

  // Issue metrics
  totalAssignedIssues: number
  issuesInProgress: number
  criticalIssues: number
  completedIssuesLast7Days: number
  openIssuesHighPriority: number
  issuesDueNext7Days: number

  // Project metrics
  totalAssignedProjects: number
  projectsInProgress: number

  // Activity metrics
  commentsWrittenLast7Days: number
  commentsOnMyTicketsLast7Days: number
  newTicketsAssignedLast7Days: number

  // Other metrics
  bugToTaskCompletionRatio: number | null
  workloadIndex: number

  // Project breakdown
  ticketsByProject: {
    projectId: number
    openTickets: number
    totalTickets: number
  }[]
}

export type PerformanceLevel = {
  label: string
  color: string
  bgColor: string
  borderColor: string
}