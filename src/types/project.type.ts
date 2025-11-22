export type ProjectStatus = "NOT_STARTED" | "IN_PROGRESS" | "DONE" | string

export type ProjectOwnerLite = {
    id: number
    name: string
    company: string
    email: string
}

export type ProjectPhasePayload = {
    name: string
    startDate?: string
    endDate?: string
}

export type ProjectAssignmentPayload = {
    userId: number
    roleInProject: string
}

export type Project = {
    id: number
    name: string
    categories: string[]
    ownerId: number
    owner?: ProjectOwnerLite | null
    startDate: string
    endDate: string
    status: ProjectStatus
    completion: number
    notes: string
}


export type CreateProjectPayload = {
    name: string
    categories: string[]
    ownerId: number
    startDate: string
    endDate: string
    status: string
    completion: number
    notes: string
    phases: ProjectPhasePayload[]
    assignments?: ProjectAssignmentPayload[]
}


export type ProjectPhaseForm = {
    name: string
    startDate?: Date
    endDate?: Date
}

export type ProjectAssignmentForm = {
    userId: number
    roleInProject: string
}

export type ProjectPhase = {
    id: number
    name: string
    startDate: string
    endDate: string
    }

export type ProjectDetail = Project & {
    phases: ProjectPhase[]
}

export type UpdateProjectPayload = {
    name: string
    categories: string[]
    ownerId: number
    startDate: string
    endDate: string
    completion: number
    status: string
    notes?: string
}

