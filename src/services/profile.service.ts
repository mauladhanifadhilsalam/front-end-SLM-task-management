import { api } from "@/lib/api"
import type {
  ChangePasswordPayload,
  ProfileUpdatePayload,
  Role,
  UserProfile,
} from "@/types/user.types"

const normalizeRole = (value: unknown): Role => {
  const role = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")

  if (role === "ADMIN" || role === "PROJECT_MANAGER" || role === "DEVELOPER") {
    return role
  }

  return "DEVELOPER"
}

const normalizeProfile = (raw: any): UserProfile => {
  return {
    id: Number(raw?.id ?? raw?.userId ?? 0),
    fullName: String(raw?.fullName ?? raw?.name ?? ""),
    email: String(raw?.email ?? ""),
    role: normalizeRole(raw?.role ?? raw?.user_role ?? raw?.user?.role),
    phone: raw?.phone ?? raw?.phoneNumber ?? raw?.phone_number ?? null,
    avatarUrl: raw?.avatarUrl ?? raw?.avatar ?? raw?.image ?? null,
    timezone: raw?.timezone ?? raw?.timeZone ?? raw?.time_zone ?? null,
  }
}

export async function fetchMyProfile(): Promise<UserProfile> {
  const { data } = await api.get("/auth/profile")
  const raw = (data as any)?.data ?? data
  const profile = normalizeProfile(raw)

  try {
    localStorage.setItem("profile", JSON.stringify(profile))
    if (profile.id) {
      localStorage.setItem("id", String(profile.id))
    }
  } catch {
    // ignore write errors (e.g., storage disabled)
  }

  return profile
}

export async function updateMyProfile(
  profileId: number,
  payload: ProfileUpdatePayload,
): Promise<UserProfile> {
  const { data } = await api.patch(`/users/${profileId}`, payload)
  const raw = (data as any)?.data ?? data ?? payload
  return normalizeProfile({ ...raw, id: profileId })
}

export async function changeMyPassword(
  payload: ChangePasswordPayload,
): Promise<void> {
  await api.post("/users/change-password", payload)
}
