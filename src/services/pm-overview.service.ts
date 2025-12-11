import type {
  PmDeveloperHighlight,
  PmOverview,
} from "@/types/pm-overview.type"
import { unwrapApiData } from "@/utils/api-response.util"
import { api } from "@/lib/api"

export async function getPmOverview(): Promise<PmOverview> {
  const { data } = await api.get("/dashboard/project-manager")
  return unwrapApiData<PmOverview>(data)
}

export async function getPmDeveloperHighlights(): Promise<
  PmDeveloperHighlight[]
> {
  const { data } = await api.get("/dashboard/project-manager/dev-stat")
  return unwrapApiData<PmDeveloperHighlight[]>(data)
}
