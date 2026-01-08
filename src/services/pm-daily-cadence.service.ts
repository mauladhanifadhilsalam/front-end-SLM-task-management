import { api } from "@/lib/api"
import { unwrapApiData } from "@/utils/api-response.util"
import type { PmDailyCadence } from "@/types/pm-daily-cadence.type"

export async function getPmDailyCadence(
  projectId: number | string,
): Promise<PmDailyCadence> {
  const { data } = await api.get(
    `/dashboard/project-manager/daily-cadence/${projectId}`,
  )
  return unwrapApiData<PmDailyCadence>(data)
}
