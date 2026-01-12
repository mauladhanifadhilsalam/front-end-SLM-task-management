import { api } from "@/lib/api"
import {
  Role,
  User,
  CreateUserPayload,
  UserLite,
} from "@/types/user.types"
import type { EditTicketAssigneeUser } from "@/types/ticket-assignee.type"
import {
  extractArrayFromApi,
  unwrapApiData,
} from "@/utils/api-response.util"
import { cleanQueryParams } from "@/utils/query-param.util"
import {
  defaultPaginationMeta,
  normalizePagination,
  type PaginationMeta,
} from "@/types/pagination"

const normalizeUsers = (raw: any[]): User[] =>
  raw.map((u) => ({
    id: Number(u.id),
    fullName: String(u.fullName ?? u.name ?? ""),
    email: String(u.email ?? ""),
    passwordHash: String(u.passwordHash ?? ""),
    role: (u.role as Role) ?? "DEVELOPER",
    projectRole: u.projectRole ?? null,
    isActive: Boolean(u.isActive ?? true),
    createdAt: String(u.createdAt ?? ""),
    updatedAt: String(u.updatedAt ?? ""),
  }))

export type UserListParams = {
  search?: string
  role?: Role
  isActive?: boolean
  page?: number
  pageSize?: number
}

export const emptyUserPagination = { ...defaultPaginationMeta }

export type FetchUsersResult = {
  users: User[]
  pagination: PaginationMeta
}

export const fetchUsersWithPagination = async (
  params?: UserListParams,
): Promise<FetchUsersResult> => {
  const { data } = await api.get("/users", {
    params: cleanQueryParams(params),
  })

  const rawList = Array.isArray((data as any)?.data)
    ? ((data as any).data as any[])
    : extractArrayFromApi(data, ["users"])

  const normalized = normalizeUsers(rawList)
  const pagination = normalizePagination(
    (data as any)?.pagination,
    defaultPaginationMeta,
  )

  return {
    users: normalized,
    pagination,
  }
}

export const fetchUsers = async (
  params?: UserListParams,
): Promise<User[]> => {
  const { users } = await fetchUsersWithPagination(params)
  return users
}

export const deleteUserById = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`)
}

export const createUser = async (
  payload: CreateUserPayload,
): Promise<User> => {
  const { data } = await api.post("/users", payload)
  return unwrapApiData<User>(data)
}

export const getUserById = async (
  id: string | number,
): Promise<any> => {
  const { data } = await api.get(`/users/${id}`)
  return unwrapApiData(data)
}

export const updateUser = async (
  id: string | number,
  payload: Record<string, unknown>,
): Promise<void> => {
  await api.patch(`/users/${id}`, payload)
}

export const fetchAssignableUsers = async (): Promise<UserLite[]> => {
  const { data } = await api.get("/users")

  const raw: any[] = extractArrayFromApi(data, ["users"])

  return raw
    .map((u) => ({
      id: Number(u.id),
      fullName: String(u.fullName ?? u.name ?? ""),
      email: String(u.email ?? ""),
      role: String(u.role ?? ""),
    }))
    .filter(
      (u) =>
        u.role === "PROJECT_MANAGER" ||
        u.role === "DEVELOPER",
    )
}

export async function fetchUsersTicketAssignees(): Promise<EditTicketAssigneeUser[]> {
  const { data } = await api.get("/users")
  return extractArrayFromApi<EditTicketAssigneeUser>(data, ["users"])
}
