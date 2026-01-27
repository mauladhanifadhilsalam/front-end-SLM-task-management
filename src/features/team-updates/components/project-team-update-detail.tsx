"use client"

import * as React from "react"

import { useParams, useNavigate } from "react-router-dom"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebarPm } from "@/pages/dashboard/pm/components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import {
    IconArrowLeft,
    IconEdit,
    IconEye,
    IconFolder,
    IconTrash,
} from "@tabler/icons-react"
import { useTeamUpdates } from "../../../pages/dashboard/pm/hooks/use-team-updates"
import { usePmProjects } from "../../../pages/dashboard/pm/hooks/use-pm-projects"
import type { TeamUpdate, TeamUpdateStatus } from "@/types/team-update.type"
import { deleteTeamUpdate } from "@/services/team-update.service"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { teamUpdateKeys } from "@/lib/query-keys"
import { getCurrentUserId } from "@/utils/get-current-user"

type UpdateStatus = TeamUpdateStatus

const statusMeta: Record<UpdateStatus, { label: string; className: string; dotColor: string }> = {
    IN_PROGRESS: {
        label: "In Progress",
        className:
            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300",
        dotColor: "bg-amber-500",
    },
    NOT_STARTED: {
        label: "Not Started",
        className:
            "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300",
        dotColor: "bg-slate-500",
    },
    DONE: {
        label: "Done",
        className:
            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300",
        dotColor: "bg-emerald-500",
    },
}

export function ProjectTeamUpdateDetailPage() {
    const { id } = useParams<{ id: string }>()
    const projectId = id
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const role = (localStorage.getItem("role") ?? "").toLowerCase()
    const isDeveloper = role === "developer"
    const isAdmin = role === "admin"
    const isPm = role === "project_manager"
    const currentUserId = getCurrentUserId()
    
    const { updates, loading, error } = useTeamUpdates()
    const projectFilters = React.useMemo(
        () => (isDeveloper && currentUserId ? { assignedUserId: currentUserId } : undefined),
        [isDeveloper, currentUserId]
    )
    const { projects } = usePmProjects(projectFilters)
    
    const [query, setQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState<UpdateStatus | "ALL">("ALL")
    const [dateFilter, setDateFilter] = React.useState("")
    const [deleteTarget, setDeleteTarget] = React.useState<TeamUpdate | null>(null)

    const basePath = isDeveloper
        ? "/developer-dashboard/daily-updates"
        : isAdmin
          ? "/admin/dashboard/team-updates"
          : "/project-manager/dashboard/team-update"

    // Get project info
    const project = React.useMemo(() => {
        return projects.find((p) => p.id === Number(projectId))
    }, [projects, projectId])

    // Filter updates for this project
    const projectUpdates = React.useMemo(() => {
        let filtered = updates.filter((u) => u.projectId === Number(projectId))

        // Filter by search query
        const q = query.trim().toLowerCase()
        if (q) {
            filtered = filtered.filter((item) => {
                const developer = item.developer.fullName.toLowerCase()
                const yesterday = item.yesterdayWork.toLowerCase()
                const today = item.todayWork.toLowerCase()
                return developer.includes(q) || yesterday.includes(q) || today.includes(q)
            })
        }

        // Filter by status
        if (statusFilter !== "ALL") {
            filtered = filtered.filter((item) => item.status === statusFilter)
        }

        // Filter by date
        if (dateFilter) {
            const filterDate = new Date(dateFilter)
            filterDate.setHours(0, 0, 0, 0)
            filtered = filtered.filter((item) => {
                const itemDate = new Date(item.updatedAt || item.createdAt)
                itemDate.setHours(0, 0, 0, 0)
                return itemDate.getTime() === filterDate.getTime()
            })
        }

        return filtered.sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt).getTime()
            const dateB = new Date(b.updatedAt || b.createdAt).getTime()
            return dateB - dateA // newest first
        })
    }, [updates, projectId, query, statusFilter, dateFilter])

    // Calculate stats
    const stats = React.useMemo(() => {
        return {
            total: projectUpdates.length,
            done: projectUpdates.filter((u) => u.status === "DONE").length,
            inProgress: projectUpdates.filter((u) => u.status === "IN_PROGRESS").length,
            notStarted: projectUpdates.filter((u) => u.status === "NOT_STARTED").length,
        }
    }, [projectUpdates])

    const deleteMutation = useMutation({
        mutationFn: deleteTeamUpdate,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: teamUpdateKeys.all })
            toast.success("Daily update berhasil dihapus")
        },
        onError: (err: any) => {
            const msg =
                err?.response?.data?.message ||
                "Gagal menghapus daily update. Coba lagi."
            toast.error("Gagal menghapus daily update", { description: msg })
        },
    })

    const handleBack = () => {
        navigate(basePath)
    }

    const handleViewUpdate = (id: number) => {
        navigate(`${basePath}/view/${id}`)
    }

    const handleEditUpdate = (id: number) => {
        navigate(`${basePath}/edit/${id}`)
    }

    const handleDeleteUpdate = (item: TeamUpdate) => {
        if (isDeveloper && item.userId !== currentUserId) return
        if (!isDeveloper && !isAdmin && !isPm) return
        setDeleteTarget(item)
    }

    const confirmDelete = () => {
        if (!deleteTarget) return
        deleteMutation.mutate(deleteTarget.id, {
            onSettled: () => setDeleteTarget(null),
        })
    }

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebarPm variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <div className="px-4 lg:px-6">
                                <div className="space-y-6">
                                    {/* Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <IconFolder className="h-6 w-6 text-primary" />
                                                    <h1 className="text-2xl font-bold">
                                                        {project?.name || `Project ${projectId}`}
                                                    </h1>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Team Update Details
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleBack}
                                                    className="flex items-center gap-2 cursor-pointer mt-2 -ml-2"
                                                >
                                                    <IconArrowLeft className="h-4 w-4" />
                                                    Kembali
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="text-2xl font-bold">{stats.total}</div>
                                                <p className="text-xs text-muted-foreground">Total Updates</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="text-2xl font-bold text-emerald-600">{stats.done}</div>
                                                <p className="text-xs text-muted-foreground">Done</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="text-2xl font-bold text-amber-600">{stats.inProgress}</div>
                                                <p className="text-xs text-muted-foreground">In Progress</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="text-2xl font-bold text-slate-600">{stats.notStarted}</div>
                                                <p className="text-xs text-muted-foreground">Not Started</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Main Table */}
                                    <Card>
                                        <CardHeader>
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                <div className="pt-1">
                                                    <CardTitle className="text-xl">Team Updates</CardTitle>
                                                    <CardDescription>
                                                        All daily standup updates for this project
                                                    </CardDescription>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <Input
                                                        value={query}
                                                        onChange={(e) => setQuery(e.target.value)}
                                                        placeholder="Cari developer atau task..."
                                                        className="max-w-[200px] bg-background text-foreground"
                                                    />
                                                    <Input
                                                        type="date"
                                                        value={dateFilter}
                                                        onChange={(e) => setDateFilter(e.target.value)}
                                                        className="w-[160px] bg-background text-foreground"
                                                    />
                                                    <div className="flex flex-col gap-2">
                                                        <Select
                                                            value={statusFilter}
                                                            onValueChange={(val) => setStatusFilter(val as UpdateStatus | "ALL")}
                                                        >
                                                            <SelectTrigger className="w-[140px] bg-background text-foreground">
                                                                <SelectValue placeholder="Filter Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="ALL">Semua Status</SelectItem>
                                                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                                <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                                                                <SelectItem value="DONE">Done</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setQuery("")
                                                                setStatusFilter("ALL")
                                                                setDateFilter("")
                                                            }}
                                                            disabled={!query && statusFilter === "ALL" && !dateFilter}
                                                            className="ml-auto whitespace-nowrap gap-2 w-[120px]"
                                                        >
                                                            Reset Filters
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {loading ? (
                                                <div className="text-sm text-muted-foreground px-4 py-8 text-center">
                                                    Memuat team updates...
                                                </div>
                                            ) : error ? (
                                                <div className="text-sm text-red-600 px-4 py-8 text-center">
                                                    {error}
                                                </div>
                                            ) : projectUpdates.length === 0 ? (
                                                <div className="text-sm text-muted-foreground px-4 py-8 text-center">
                                                    Tidak ada team updates ditemukan.
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                                                    <Table>
                                                        <TableHeader className="bg-slate-100 dark:bg-[#0a0a0a]">
                                                            <TableRow className="hover:bg-slate-100 dark:hover:bg-[#0a0a0a] border-b border-slate-200 dark:border-slate-800/20">
                                                                <TableHead className="min-w-[90px] first:rounded-tl-lg text-slate-700 dark:text-white font-medium uppercase text-xs">Tanggal</TableHead>
                                                                <TableHead className="min-w-[140px] text-slate-700 dark:text-white font-medium uppercase text-xs">Developer</TableHead>
                                                                <TableHead className="min-w-[90px] text-slate-700 dark:text-white font-medium uppercase text-xs">Status</TableHead>
                                                                <TableHead className="min-w-[200px] text-slate-700 dark:text-white font-medium uppercase text-xs">Kemarin</TableHead>
                                                                <TableHead className="min-w-[200px] text-slate-700 dark:text-white font-medium uppercase text-xs">Hari Ini</TableHead>
                                                                <TableHead className="min-w-[200px] text-slate-700 dark:text-white font-medium uppercase text-xs">Blocker</TableHead>
                                                                <TableHead className="min-w-[120px] text-slate-700 dark:text-white font-medium uppercase text-xs">Next Action</TableHead>
                                                                <TableHead className="min-w-[120px] text-right last:rounded-tr-lg text-slate-700 dark:text-white font-medium uppercase text-xs">Actions</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {projectUpdates.map((item) => (
                                                                <TableRow
                                                                    key={item.id}
                                                                    className="bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800/30 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-[#0a0a0a]"
                                                                >
                                                                    <TableCell className="font-medium text-muted-foreground text-sm">
                                                                        {formatDate(item.updatedAt || item.createdAt)}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="flex items-center gap-2">
                                                                            <Avatar className="size-8 border border-background shadow-sm">
                                                                                <AvatarFallback
                                                                                    className={cn(
                                                                                        "text-xs font-bold",
                                                                                        pickAvatarColor(item.developer.fullName)
                                                                                    )}
                                                                                >
                                                                                    {initials(item.developer.fullName)}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                            <span className="text-sm font-medium">
                                                                                {item.developer.fullName}
                                                                            </span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <StatusBadge status={item.status} />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <p className="text-sm line-clamp-2" title={item.yesterdayWork}>
                                                                            {item.yesterdayWork}
                                                                        </p>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <p className="text-sm line-clamp-2" title={item.todayWork}>
                                                                            {item.todayWork}
                                                                        </p>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {item.blocker ? (
                                                                            <div className="flex items-start gap-1.5">
                                                                                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0 mt-1.5" />
                                                                                <p className="text-sm text-red-600 dark:text-red-400 line-clamp-2" title={item.blocker}>
                                                                                    {item.blocker}
                                                                                </p>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-muted-foreground/50">-</span>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="outline" className="font-normal text-xs">
                                                                            {item.nextAction}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="flex items-center justify-end gap-1">
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8"
                                                                                onClick={() => handleViewUpdate(item.id)}
                                                                                aria-label="View update"
                                                                            >
                                                                                <IconEye className="h-4 w-4" />
                                                                            </Button>
                                                                            {isDeveloper && item.userId === currentUserId ? (
                                                                                <>
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className="h-8 w-8"
                                                                                        onClick={() => handleEditUpdate(item.id)}
                                                                                        aria-label="Edit update"
                                                                                    >
                                                                                        <IconEdit className="h-4 w-4" />
                                                                                    </Button>
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className="h-8 w-8 text-red-600 hover:text-red-700"
                                                                                        onClick={() => handleDeleteUpdate(item)}
                                                                                        aria-label="Delete update"
                                                                                        disabled={deleteMutation.isPending}
                                                                                    >
                                                                                        <IconTrash className="h-4 w-4" />
                                                                                    </Button>
                                                                                </>
                                                                            ) : null}
                                                                            {isAdmin || isPm ? (
                                                                                <>
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className="h-8 w-8"
                                                                                        onClick={() => handleEditUpdate(item.id)}
                                                                                        aria-label="Edit update"
                                                                                    >
                                                                                        <IconEdit className="h-4 w-4" />
                                                                                    </Button>
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className="h-8 w-8 text-red-600 hover:text-red-700"
                                                                                        onClick={() => handleDeleteUpdate(item)}
                                                                                        aria-label="Delete update"
                                                                                        disabled={deleteMutation.isPending}
                                                                                    >
                                                                                        <IconTrash className="h-4 w-4" />
                                                                                    </Button>
                                                                                </>
                                                                            ) : null}
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Delete Dialog */}
                                    <AlertDialog
                                        open={!!deleteTarget}
                                        onOpenChange={(open) => (!open ? setDeleteTarget(null) : undefined)}
                                    >
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Hapus daily update?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Update dari {deleteTarget?.developer.fullName} akan dihapus permanen.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel disabled={deleteMutation.isPending}>
                                                    Batal
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={confirmDelete}
                                                    disabled={deleteMutation.isPending}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

// Helper components
function StatusBadge({ status }: { status: UpdateStatus }) {
    const meta = statusMeta[status]

    return (
        <Badge
            variant="outline"
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                meta.className
            )}
        >
            <span className={cn("h-1.5 w-1.5 rounded-full", meta.dotColor)} />
            {meta.label}
        </Badge>
    )
}

// Helper functions
function initials(name: string) {
    if (!name) return "?"
    const parts = name.split(/\s+/).filter(Boolean)
    const first = parts[0]?.[0]
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : ""
    return `${first ?? ""}${last ?? ""}`.toUpperCase() || "?"
}

function formatDate(value?: string) {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date)
}

const avatarPalette = [
    "bg-sky-500/20 text-sky-600 dark:text-sky-300",
    "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300",
    "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    "bg-rose-500/20 text-rose-600 dark:text-rose-300",
    "bg-indigo-500/20 text-indigo-600 dark:text-indigo-300",
    "bg-purple-500/20 text-purple-600 dark:text-purple-300",
    "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300",
]

function pickAvatarColor(seed: string) {
    const idx = Math.abs(hashString(seed)) % avatarPalette.length
    return avatarPalette[idx]
}

function hashString(str: string) {
    let hash = 0
    for (let i = 0; i < str.length; i += 1) {
        hash = (hash << 5) - hash + str.charCodeAt(i)
        hash |= 0
    }
    return hash
}