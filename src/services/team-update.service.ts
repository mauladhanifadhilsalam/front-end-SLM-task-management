import { api } from "@/lib/api"
import { extractArrayFromApi } from "@/utils/api-response.util"
import { cleanQueryParams } from "@/utils/query-param.util"
import {
  defaultPaginationMeta,
  normalizePagination,
  type PaginationMeta,
} from "@/types/pagination"
import type { TeamUpdate, TeamUpdateStatus } from "@/types/team-update.type"

const normalizeStatus = (value: unknown): TeamUpdateStatus => {
  const status = String(value ?? "").toUpperCase()
  if (status === "IN_PROGRESS" || status === "NOT_STARTED" || status === "DONE") {
    return status
  }
  return "NOT_STARTED"
}

const mapTeamUpdate = (item: any): TeamUpdate => ({
  id: Number(item?.id ?? 0),
  userId: Number(item?.userId ?? item?.user_id ?? item?.developer?.id ?? 0),
  projectId: Number(item?.projectId ?? item?.project_id ?? 0),
  status: normalizeStatus(item?.status),
  yesterdayWork: String(item?.yesterdayWork ?? item?.yesterday_work ?? ""),
  todayWork: String(item?.todayWork ?? item?.today_work ?? ""),
  blocker: item?.blocker ? String(item.blocker) : null,
  nextAction: String(item?.nextAction ?? item?.next_action ?? ""),
  updatedAt: String(
    item?.updatedAt ?? item?.updated_at ?? item?.createdAt ?? item?.created_at ?? "",
  ),
  createdAt: String(
    item?.createdAt ?? item?.created_at ?? item?.updatedAt ?? item?.updated_at ?? "",
  ),
  developer: {
    id: Number(item?.developer?.id ?? item?.userId ?? item?.user_id ?? 0),
    fullName: item?.developer?.fullName ?? item?.developer?.name ?? "-",
    email: item?.developer?.email ?? "-",
    role: item?.developer?.role ?? "-",
  },
})

export type TeamUpdateListParams = {
  page?: number
  pageSize?: number
  status?: TeamUpdateStatus
  projectId?: number
  userId?: number
  search?: string
}

export type TeamUpdateListResult = {
  updates: TeamUpdate[]
  pagination: PaginationMeta
}

export const fetchTeamUpdatesWithPagination = async (
  params?: TeamUpdateListParams,
): Promise<TeamUpdateListResult> => {
  const { data } = await api.get("/team-updates", {
    params: cleanQueryParams(params),
  })

  const updates = extractArrayFromApi(data, ["teamUpdates", "team_updates"]).map(
    mapTeamUpdate,
  ) as TeamUpdate[]

  return {
    updates,
    pagination: normalizePagination(
      (data as any)?.pagination,
      defaultPaginationMeta,
    ),
  }
}

export const fetchTeamUpdates = async (
  params?: TeamUpdateListParams,
): Promise<TeamUpdate[]> => {
  const { updates } = await fetchTeamUpdatesWithPagination(params)
  return updates
}
