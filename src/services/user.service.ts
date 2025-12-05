import axios from "axios"
import { Role, User, CreateUserPayload, UserLite } from "@/types/user.types"
import type { EditTicketAssigneeUser } from "@/types/ticket-assignee.type"
import {
    extractArrayFromApi,
    unwrapApiData,
} from "@/utils/api-response.util"

const API_BASE = import.meta.env.VITE_API_BASE

const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    if (!token) return undefined
    return { Authorization: `Bearer ${token}` }
}

const normalizeUsers = (raw: any[]): User[] => {
    return raw.map((u) => ({
        id: Number(u.id),
        fullName: String(u.fullName ?? ""),
        email: String(u.email ?? ""),
        passwordHash: String(u.passwordHash ?? ""),
        role: (u.role as Role) ?? "DEVELOPER",
    }))
}

export const fetchUsers = async (): Promise<User[]> => {
    const res = await axios.get(`${API_BASE}/users`, {
        headers: getAuthHeaders(),
})

    const raw: any[] = extractArrayFromApi(res.data, ["users"])
    const normalized = normalizeUsers(raw)
    return normalized.slice().sort((a, b) => a.id - b.id)
}

export const deleteUserById = async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/users/${id}`, {
        headers: getAuthHeaders(),
    })
}

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
    const res = await axios.post(`${API_BASE}/users`, payload, {
        headers: getAuthHeaders(),
    })
    return unwrapApiData<User>(res.data)
}

export const getUserById = async (id: string | number): Promise<any> => {
    const res = await axios.get(`${API_BASE}/users/${id}`, {
        headers: getAuthHeaders(),
    })
    return unwrapApiData(res.data)
}

export const updateUser = async (
    id: string | number,
    payload: Record<string, unknown>,
    ): Promise<void> => {
    await axios.patch(`${API_BASE}/users/${id}`, payload, {
        headers: getAuthHeaders(),
    })
}

export const fetchAssignableUsers = async (): Promise<UserLite[]> => {
  const res = await axios.get(`${API_BASE}/users`, {
    headers: getAuthHeaders(),
  })

  const raw: any[] = extractArrayFromApi(res.data, ["users"])

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
  const res = await axios.get(`${API_BASE}/users`, {
    headers: getAuthHeaders(),
  })

  return extractArrayFromApi<EditTicketAssigneeUser>(res.data, ["users"])
}
