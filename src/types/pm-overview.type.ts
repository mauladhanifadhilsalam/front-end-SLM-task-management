export type PmOverview = {
  userId: number
  fullName: string
  email: string

  totalProjects: number
  activeProjects: number
  onHoldProjects: number
  completedProjects: number
  projectsDueNext7Days: number
  projectsDueNext30Days: number
  overdueProjects: number

  activePhases: number
  phasesDueNext30Days: number
  overduePhases: number

  totalTickets: number
  openTickets: number
  inReviewTickets: number
  overdueTickets: number
  openHighPriorityTickets: number
  openCriticalTickets: number
  completedTicketsLast7Days: number
  completedTicketsLast30Days: number
  oldestOpenTicketDays: number

  ticketsByStatus: { count: number; status: string }[]
  ticketsByPriority: { count: number; priority: string }[]
  ticketsByProject: {
    name: string
    projectId: number
    openTickets: number
    totalTickets: number
  }[]

  primaryProjectId: number
  commentsLast7Days: number
  commentsLast30Days: number
  unreadNotificationsCount: number
}

export type PmDeveloperHighlight = {
  userId: number
  fullName: string
  email: string
  totalAssignedTasks: number
  tasksInProgress: number
  overdueTasks: number
  taskCompletionPercentage: number
  openTasksHighPriority: number
  tasksDueNext7Days: number
  completedTasksLast7Days: number
  totalAssignedIssues: number
  issuesInProgress: number
  criticalIssues: number
  openIssuesHighPriority: number
  issuesDueNext7Days: number
  completedIssuesLast7Days: number
  bugToTaskCompletionRatio: number | null
  totalAssignedProjects: number
  projectsInProgress: number
  primaryProjectId: number | null
  ticketsByProject: {
    projectId: number
    openTickets: number
    totalTickets: number
  }[]
  workloadIndex: number
  newTicketsAssignedLast7Days: number
  commentsWrittenLast7Days: number
  commentsOnMyTicketsLast7Days: number
  unreadNotificationsCount: number
}
