import type { TicketListParams } from "@/services/ticket.service"
import type { ProjectListParams } from "@/services/project.service"
import type { UserListParams } from "@/services/user.service"
import type { ProjectOwnerListParams } from "@/services/project-owner.service"
import type { ProjectAssignmentListParams } from "@/services/project-assignment.service"
import type { ProjectPhaseListParams } from "@/services/project-phase.service"
import type { CommentListParams } from "@/services/comments.service"
import type { NotificationListParams } from "@/services/notification.service"
import type { ActivityLogListParams } from "@/services/activity-log.service"
import type { TeamUpdateListParams } from "@/services/team-update.service"

export const profileKeys = {
  all: ["profile"] as const,
  me: () => [...profileKeys.all, "me"] as const,
};

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (filters?: NotificationListParams) =>
    filters && Object.keys(filters).length > 0
      ? ([...notificationKeys.all, "list", filters] as const)
      : ([...notificationKeys.all, "list"] as const),
  adminList: (filters?: NotificationListParams) =>
    filters && Object.keys(filters).length > 0
      ? ([...notificationKeys.all, "admin-list", filters] as const)
      : ([...notificationKeys.all, "admin-list"] as const),
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
  list: (filters?: ProjectListParams) =>
    filters && Object.keys(filters).length > 0
      ? ([...projectKeys.all, "list", filters] as const)
      : ([...projectKeys.all, "list"] as const),
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
  list: (filters?: UserListParams) =>
    filters && Object.keys(filters).length > 0
      ? ([...userKeys.all, "list", filters] as const)
      : ([...userKeys.all, "list"] as const),
  detail: (id: number | string) =>
    [...userKeys.all, "detail", String(id)] as const,
};

export const commentKeys = {
  all: ["comments"] as const,
  list: (filters?: CommentListParams) =>
    filters && Object.keys(filters).length > 0
      ? ([...commentKeys.all, "list", filters] as const)
      : ([...commentKeys.all, "list"] as const),
  adminList: (filters?: CommentListParams) =>
    filters && Object.keys(filters).length > 0
      ? ([...commentKeys.all, "admin-list", filters] as const)
      : ([...commentKeys.all, "admin-list"] as const),
  detail: (id: number | string) =>
    [...commentKeys.all, "detail", String(id)] as const,
};

export const projectOwnerKeys = {
  all: ["project-owners"] as const,
  list: (filters?: ProjectOwnerListParams) =>
    filters && Object.keys(filters).length > 0
      ? ([...projectOwnerKeys.all, "list", filters] as const)
      : ([...projectOwnerKeys.all, "list"] as const),
  detail: (id: number | string) =>
    [...projectOwnerKeys.all, "detail", String(id)] as const,
};

export const projectAssignmentKeys = {
  all: ["project-assignments"] as const,
  list: (filters?: ProjectAssignmentListParams) =>
    filters && Object.keys(filters).length > 0
      ? ([...projectAssignmentKeys.all, "list", filters] as const)
      : ([...projectAssignmentKeys.all, "list"] as const),
  detail: (id: number | string) =>
    [...projectAssignmentKeys.all, "detail", String(id)] as const,
};

export const projectPhaseKeys = {
  all: ["project-phases"] as const,
  list: (filters?: ProjectPhaseListParams) =>
    filters && Object.keys(filters).length > 0
      ? ([...projectPhaseKeys.all, "list", filters] as const)
      : ([...projectPhaseKeys.all, "list"] as const),
  detail: (id: number | string) =>
    [...projectPhaseKeys.all, "detail", String(id)] as const,
};

export const attachmentKeys = {
  all: ["attachments"] as const,
  list: () => [...attachmentKeys.all, "list"] as const,
  detail: (id: number | string) =>
    [...attachmentKeys.all, "detail", String(id)] as const,
};

export const activityLogKeys = {
  all: ["activity-logs"] as const,
  list: (filters?: ActivityLogListParams) =>
    filters && Object.keys(filters).length > 0
      ? ([...activityLogKeys.all, "list", filters] as const)
      : ([...activityLogKeys.all, "list"] as const),
}

export const teamUpdateKeys = {
  all: ["team-updates"] as const,
  list: (filters?: TeamUpdateListParams) =>
    filters && Object.keys(filters).length > 0
      ? ([...teamUpdateKeys.all, "list", filters] as const)
      : ([...teamUpdateKeys.all, "list"] as const),
  detail: (id: number | string) =>
    [...teamUpdateKeys.all, "detail", String(id)] as const,
}
