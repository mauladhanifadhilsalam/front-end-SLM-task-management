import axios from "axios"
import type {
  PmDeveloperHighlight,
  PmOverview,
} from "@/types/pm-overview.type"
import { unwrapApiData } from "@/utils/api-response.util"

const API_BASE = import.meta.env.VITE_API_BASE

export async function getPmOverview(): Promise<PmOverview> {
  const token = localStorage.getItem("token")

  const res = await axios.get(`${API_BASE}/dashboard/project-manager`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return unwrapApiData<PmOverview>(res.data)
}

export async function getPmDeveloperHighlights(): Promise<
  PmDeveloperHighlight[]
> {
  const token = localStorage.getItem("token")

  const res = await axios.get(
    `${API_BASE}/dashboard/project-manager/dev-stat`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return unwrapApiData<PmDeveloperHighlight[]>(res.data)
}
