export type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER"

export type User = {
    id: number
    fullName: string
    email: string
    passwordHash: string
    role: Role
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