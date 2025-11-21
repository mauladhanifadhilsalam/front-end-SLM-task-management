import axios from "axios"
import { Role, User, CreateUserPayload } from "@/types/user.types"

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

    const raw: any[] = Array.isArray(res.data) ? res.data : res.data?.data || []
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
    return res.data as User
}

export const getUserById = async (id: string | number): Promise<any> => {
    const res = await axios.get(`${API_BASE}/users/${id}`, {
        headers: getAuthHeaders(),
    })
    return res.data?.data ?? res.data
}

export const updateUser = async (
    id: string | number,
    payload: Record<string, unknown>,
    ): Promise<void> => {
    await axios.patch(`${API_BASE}/users/${id}`, payload, {
        headers: getAuthHeaders(),
    })
}
