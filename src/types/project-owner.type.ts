export type ProjectOwner = {
    id: number
    name: string
    company?: string
    email?: string
    phone?: string
    address?: string
    createdAt?: string
    updatedAt?: string
}

export type CreateProjectOwnerPayload = {
    name: string
    company: string
    email: string
    phone: string
    address: string
}

export type UpdateProjectOwnerPayload = {
    name: string
    company: string
    email: string
    phone: string
    address: string
}