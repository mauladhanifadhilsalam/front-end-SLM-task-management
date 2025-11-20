"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"


import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { IconArrowLeft, IconCheck } from "@tabler/icons-react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

type RoleInProject =
  | "FRONT_END"
  | "BACK_END"
  | "TECH_LEAD"
  | "DEVOPS"
  | "CLOUD_ENGINEER"
  | ""

type ProjectLite = {
  id: number
  name: string
}

type UserLite = {
  id: number
  fullName: string
  email?: string
}

type FormState = {
  projectId: string
  userId: string
  roleInProject: RoleInProject
  assignedAt: string
  note: string
}

type FormError = Partial<Record<keyof FormState, string>>

const API_BASE = import.meta.env.VITE_API_BASE

export default function CreateProjectAssignment() {
    const navigate = useNavigate()

    const [projects, setProjects] = React.useState<ProjectLite[]>([])
    const [users, setUsers] = React.useState<UserLite[]>([])
    const [loadingProjects, setLoadingProjects] = React.useState(false)
    const [loadingUsers, setLoadingUsers] = React.useState(false)

    const [form, setForm] = React.useState<FormState>({
        projectId: "",
        userId: "",
        roleInProject: "",
        assignedAt: "",
        note: "",
    })

    const [errors, setErrors] = React.useState<FormError>({})
    const [saving, setSaving] = React.useState(false)

    const handleChange = (field: keyof FormState, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    const validateAll = (values: FormState): FormError => {
        const next: FormError = {}

        if (!values.projectId) next.projectId = "Project wajib dipilih."
        if (!values.userId) next.userId = "User wajib dipilih."
        if (!values.roleInProject) next.roleInProject = "Role wajib dipilih."

        return next
    }

    const fetchProjects = React.useCallback(async () => {
        setLoadingProjects(true)
        try {
        const token = localStorage.getItem("token")
        const res = await axios.get(`${API_BASE}/projects`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const raw: any[] = Array.isArray(res.data) ? res.data : res.data?.data ?? []
        const normalized: ProjectLite[] = raw.map((p) => ({
            id: Number(p.id),
            name: p.name ?? p.projectName ?? `Project #${p.id}`,
        }))
        setProjects(normalized)
        } catch (e) {
        // optional: bisa tambahin Swal error kalau mau
        } finally {
        setLoadingProjects(false)
        }
    }, [])

    const fetchUsers = React.useCallback(async () => {
        setLoadingUsers(true)
        try {
        const token = localStorage.getItem("token")
        const res = await axios.get(`${API_BASE}/users`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const raw: any[] = Array.isArray(res.data) ? res.data : res.data?.data ?? []
        const normalized: UserLite[] = raw.map((u) => ({
            id: Number(u.id),
            fullName: u.fullName ?? u.name ?? `User #${u.id}`,
            email: u.email ?? "",
        }))
        setUsers(normalized)
        } catch (e) {
        // optional: bisa tambahin Swal error kalau mau
        } finally {
        setLoadingUsers(false)
        }
    }, [])

    React.useEffect(() => {
        fetchProjects()
        fetchUsers()
    }, [fetchProjects, fetchUsers])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const nextErrors = validateAll(form)
        setErrors(nextErrors)
        const hasError = Object.values(nextErrors).some(Boolean)
        if (hasError) return

        const payload = {
        projectId: Number(form.projectId),
        userId: Number(form.userId),
        roleInProject: form.roleInProject,
        assignedAt: form.assignedAt || undefined,
        note: form.note.trim() || undefined,
        }

        try {
        setSaving(true)
        const token = localStorage.getItem("token")

        await axios.post(`${API_BASE}/project-assignments`, payload, {
            headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        })

        toast.success("Project assignment berhasil dibuat", {
            description: "Project assignment baru sudah tersimpan.",
            })



        navigate("/admin-dashboard/project-assignments")
       } catch (err: any) {
            const msg =
                err?.response?.data?.message || "Gagal membuat project assignment. Coba lagi."
            toast.error("Gagal membuat project assignment", {
                description: msg,
            })
            } finally {
            setSaving(false)
            }

    }

    return (
        <div>
        <SidebarProvider
            style={
            {
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="px-4 lg:px-6">
                    <div className="mb-4 flex items-center gap-4">
                        <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            navigate("/admin-dashboard/project-assignments")
                        }
                        className="flex cursor-pointer items-center gap-2"
                        >
                        <IconArrowLeft className="h-4 w-4" />
                        Kembali
                        </Button>
                    </div>
                    <h1 className="text-2xl font-semibold">
                        Tambah Project Assignment
                    </h1>
                    </div>

                    <div className="px-4 lg:px-6">
                    <Card>
                        <CardHeader>
                        <CardTitle>Informasi Assignment</CardTitle>
                        <CardDescription>
                            Pilih project, user, dan role dalam project.
                        </CardDescription>
                        </CardHeader>
                        <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                            noValidate
                        >
                            <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="projectId">Project *</Label>
                                <Select
                                value={form.projectId}
                                onValueChange={(val) =>
                                    handleChange("projectId", val)
                                }
                                >
                                <SelectTrigger id="projectId">
                                    <SelectValue
                                    placeholder={
                                        loadingProjects
                                        ? "Memuat project..."
                                        : "Pilih project"
                                    }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((p) => (
                                    <SelectItem
                                        key={p.id}
                                        value={String(p.id)}
                                    >
                                        {p.name} (ID: {p.id})
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                {errors.projectId && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.projectId}
                                </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="userId">User *</Label>
                                <Select
                                value={form.userId}
                                onValueChange={(val) =>
                                    handleChange("userId", val)
                                }
                                >
                                <SelectTrigger id="userId">
                                    <SelectValue
                                    placeholder={
                                        loadingUsers
                                        ? "Memuat user..."
                                        : "Pilih user"
                                    }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((u) => (
                                    <SelectItem
                                        key={u.id}
                                        value={String(u.id)}
                                    >
                                        {u.fullName} (ID: {u.id})
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                {errors.userId && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.userId}
                                </p>
                                )}
                            </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Role in Project *</Label>
                                <Select
                                value={form.roleInProject}
                                onValueChange={(val) =>
                                    handleChange(
                                    "roleInProject",
                                    val as RoleInProject,
                                    )
                                }
                                >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FRONT_END">
                                    FRONT_END
                                    </SelectItem>
                                    <SelectItem value="BACK_END">
                                    BACK_END
                                    </SelectItem>
                                    <SelectItem value="TECH_LEAD">
                                    TECH_LEAD
                                    </SelectItem>
                                    <SelectItem value="DEVOPS">
                                    DEVOPS
                                    </SelectItem>
                                    <SelectItem value="CLOUD_ENGINEER">
                                    CLOUD_ENGINEER
                                    </SelectItem>
                                </SelectContent>
                                </Select>
                                {errors.roleInProject && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.roleInProject}
                                </p>
                                )}
                            </div>
                            </div>


                            <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={saving}
                                onClick={() =>
                                navigate(
                                    "/admin-dashboard/project-assignments",
                                )
                                }
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="cursor-pointer"
                            >
                                <IconCheck className="mr-2 h-4 w-4" />
                                {saving ? "Menyimpan..." : "Simpan Assignment"}
                            </Button>
                            </div>
                        </form>
                        </CardContent>
                    </Card>
                    </div>
                </div>
                </div>
            </div>
            </SidebarInset>
        </SidebarProvider>
        </div>
    )
}
