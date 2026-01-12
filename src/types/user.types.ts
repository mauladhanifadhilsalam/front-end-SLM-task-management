export type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER"

export type User = {
    id: number
    fullName: string
    email: string
    passwordHash: string
    role: Role
    projectRole: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export type CreateUserPayload = {
    fullName: string
    email: string
    role: string
    password: string
}

export type UserWithMeta = User & {
    createdAt: string
}
export type UserLite = {
    id: number
    fullName: string
    email: string
    role: string
}

export type UserProfile = {
    id: number
    fullName: string
    email: string
    role: Role
    phone?: string | null
    avatarUrl?: string | null
    timezone?: string | null
}

export type ProfileUpdatePayload = Partial<{
    fullName: string
    email: string
    phone?: string
    avatarUrl?: string | null
    timezone?: string | null
}>

export type ChangePasswordPayload = {
    newPassword: string
    confirmPassword: string
}

export type UserPreferences = {
    theme?: "light" | "dark" | "system"
}
