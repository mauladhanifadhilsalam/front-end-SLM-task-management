// src/services/auth.ts
import { api } from "@/lib/api"

export type RoleApi = "admin" | "project_manager" | "developer"

type AnyLoginResponse =
    | { accessToken: string; user?: { id?: number; email?: string; role?: unknown } }
    | { token: string; data?: { id?: number; email?: string; role?: unknown } }
    | { accessToken?: string; token?: string; role?: unknown; email?: string; id?: number }
    | Record<string, any>

const toRole = (r: unknown): RoleApi | undefined => {
    const s = String(r ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_") 
    return s === "admin" || s === "project_manager" || s === "developer" ? (s as RoleApi) : undefined
}

export async function login(email: string, password: string) {
    const { data } = await api.post<AnyLoginResponse>("/auth/login", { email, password })
    console.log("LOGIN RESPONSE:", data)

    const accessToken = (data as any)?.accessToken ?? (data as any)?.token
    if (!accessToken) throw new Error("Token tidak ditemukan di respons login.")

    
    const role: RoleApi | undefined =
        toRole((data as any)?.role) ??                 
        toRole((data as any)?.user?.role) ??            
        toRole((data as any)?.data?.role)               

    if (!role) throw new Error("User role tidak ditemukan/invalid pada respons login.")


    const userEmail =
        (data as any)?.user?.email ??
        (data as any)?.data?.email ??
        (data as any)?.email ?? 
        email                   

    const userId =
        (data as any)?.user?.id ??
        (data as any)?.data?.id ??
        (data as any)?.id ?? 0

    return {
        accessToken,
        user: { id: userId, email: userEmail ?? "", role }, 
    }
}
