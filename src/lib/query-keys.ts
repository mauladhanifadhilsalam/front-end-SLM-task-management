import type { TicketListParams } from "@/services/ticket.service"

export const profileKeys = {
  all: ["profile"] as const,
  me: () => [...profileKeys.all, "me"] as const,
};

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
  adminList: () => [...notificationKeys.all, "admin-list"] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
  detail: (id: number | string) =>
    [...notificationKeys.all, "detail", String(id)] as const,
};

export const dashboardKeys = {
  all: ["dashboard"] as const,
  developer: () => [...dashboardKeys.all, "developer"] as const,
  admin: () => [...dashboardKeys.all, "admin"] as const,
  pmOverview: () => [...dashboardKeys.all, "pm-overview"] as const,
  pmDeveloperHighlights: () =>
    [...dashboardKeys.all, "pm-developer-highlights"] as const,
};

export const projectKeys = {
  all: ["projects"] as const,
  list: () => [...projectKeys.all, "list"] as const,
  detail: (id: number | string) =>
    [...projectKeys.all, "detail", String(id)] as const,
};

export const ticketKeys = {
  all: ["tickets"] as const,
  list: (filters?: TicketListParams) =>
    filters && Object.keys(filters).length > 0
      ? ([...ticketKeys.all, "list", filters] as const)
      : ([...ticketKeys.all, "list"] as const),
  detail: (id: number | string) =>
    [...ticketKeys.all, "detail", String(id)] as const,
};

export const userKeys = {
  all: ["users"] as const,
  list: () => [...userKeys.all, "list"] as const,
  detail: (id: number | string) =>
    [...userKeys.all, "detail", String(id)] as const,
};

export const commentKeys = {
  all: ["comments"] as const,
  list: () => [...commentKeys.all, "list"] as const,
  adminList: () => [...commentKeys.all, "admin-list"] as const,
  detail: (id: number | string) =>
    [...commentKeys.all, "detail", String(id)] as const,
};

export const projectOwnerKeys = {
  all: ["project-owners"] as const,
  list: () => [...projectOwnerKeys.all, "list"] as const,
  detail: (id: number | string) =>
    [...projectOwnerKeys.all, "detail", String(id)] as const,
};

export const projectAssignmentKeys = {
  all: ["project-assignments"] as const,
  list: () => [...projectAssignmentKeys.all, "list"] as const,
  detail: (id: number | string) =>
    [...projectAssignmentKeys.all, "detail", String(id)] as const,
};

export const projectPhaseKeys = {
  all: ["project-phases"] as const,
  list: () => [...projectPhaseKeys.all, "list"] as const,
  detail: (id: number | string) =>
    [...projectPhaseKeys.all, "detail", String(id)] as const,
};

export const attachmentKeys = {
  all: ["attachments"] as const,
  list: () => [...attachmentKeys.all, "list"] as const,
  detail: (id: number | string) =>
    [...attachmentKeys.all, "detail", String(id)] as const,
};
