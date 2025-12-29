"use client"

import * as React from "react"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    IconChevronRight,
    IconFileSpreadsheet,
    IconFolder,
    IconPlus,
} from "@tabler/icons-react"
import { useTeamUpdates } from "../../../pages/dashboard/pm/hooks/use-team-updates"
import { usePmProjects } from "../../../pages/dashboard/pm/hooks/use-pm-projects"
import type { TeamUpdate, TeamUpdateStatus } from "@/types/team-update.type"
import { useNavigate } from "react-router-dom"

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

const projectColors = {
    bg: "bg-muted/50",
    border: "border-border",
    icon: "text-foreground",
}

type TeamUpdateTableProps = {
    title?: string
    description?: string
    createLabel?: string
    createPath?: string
    showCreateButton?: boolean
}

export function TeamUpdateTable({
    title = "Team Update",
    description = "Daily standup updates per project",
    createLabel = "Create Daily Update",
    createPath = "/project-manager/dashboard/team-update/create",
    showCreateButton = true,
}: TeamUpdateTableProps) {
    const navigate = useNavigate()
    const { updates, loading, error } = useTeamUpdates()
    const { projects } = usePmProjects()
    const [query, setQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState<UpdateStatus | "ALL">("ALL")
    const [expandedProjects, setExpandedProjects] = React.useState<Set<string>>(new Set())
    const didInitExpansion = React.useRef(false)

    const projectLabels = React.useMemo(() => {
        const map = new Map<number, string>()
        projects.forEach((project) => {
            map.set(project.id, project.name)
        })
        updates.forEach((item) => {
            if (!map.has(item.projectId)) {
                map.set(item.projectId, `Project ${item.projectId}`)
            }
        })
        return map
    }, [projects, updates])

    const projectIds = React.useMemo(() => {
        return Array.from(projectLabels.keys())
            .sort((a, b) => a - b)
            .map((id) => id.toString())
    }, [projectLabels])

    React.useEffect(() => {
        if (didInitExpansion.current) return
        if (projectIds.length === 0) return
        setExpandedProjects(new Set(projectIds))
        didInitExpansion.current = true
    }, [projectIds])

    // Group updates by project
    const groupedUpdates = React.useMemo(() => {
        let filtered = updates

        // Filter by search query
        const q = query.trim().toLowerCase()
        if (q) {
            filtered = filtered.filter((item) => {
                const developer = item.developer.fullName.toLowerCase()
                const yesterday = item.yesterdayWork.toLowerCase()
                const today = item.todayWork.toLowerCase()
                const project = (projectLabels.get(item.projectId) ?? "").toLowerCase()
                return developer.includes(q) || yesterday.includes(q) || today.includes(q) || project.includes(q)
            })
        }

        // Filter by status
        if (statusFilter !== "ALL") {
            filtered = filtered.filter((item) => item.status === statusFilter)
        }

        // Group by project
        const grouped: Record<string, TeamUpdate[]> = {}
        for (const projectId of projectIds) {
            const numericId = Number(projectId)
            grouped[projectId] = filtered.filter((u) => u.projectId === numericId)
        }
        return grouped
    }, [query, statusFilter, updates, projectIds, projectLabels])

    // Calculate stats per project
    const projectStats = React.useMemo(() => {
        const stats: Record<string, { done: number; notStarted: number; inProgress: number }> = {}
        for (const projectId of projectIds) {
            const numericId = Number(projectId)
            const projectUpdates = updates.filter((u) => u.projectId === numericId)
            stats[projectId] = {
                done: projectUpdates.filter((u) => u.status === "DONE").length,
                notStarted: projectUpdates.filter((u) => u.status === "NOT_STARTED").length,
                inProgress: projectUpdates.filter((u) => u.status === "IN_PROGRESS").length,
            }
        }
        return stats
    }, [projectIds, updates])

    const toggleProject = (project: string) => {
        setExpandedProjects((prev) => {
            const next = new Set(prev)
            if (next.has(project)) {
                next.delete(project)
            } else {
                next.add(project)
            }
            return next
        })
    }

    // Export handlers (dummy for now)
    const handleExportExcel = (project: string, data: TeamUpdate[]) => {
        console.log(`Exporting Excel for ${project}:`, data)
        alert(`Export Excel untuk "${project}" dengan ${data.length} data`)
    }

    const handleCreateUpdate = () => {
        navigate(createPath)
    }


    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-col gap-3 pb-4 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                <div className="flex flex-col gap-2">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            {title}
                        </CardTitle>
                        <CardDescription>
                            {description}
                        </CardDescription>
                    </div>
                </div>


                {/* Filters */}
                <div className="flex flex-col w-full sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Cari developer atau task..."
                            className="max-w-xs"
                        />
                        <Select
                            value={statusFilter}
                            onValueChange={(val) => setStatusFilter(val as UpdateStatus | "ALL")}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Semua Status</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                                <SelectItem value="DONE">Done</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {showCreateButton ? (
                        <Button size="sm" onClick={handleCreateUpdate} className="shrink-0">
                            <IconPlus className="mr-1 h-4 w-4" />
                            {createLabel}
                        </Button>
                    ) : null}
                </div>
            </CardHeader>

            <CardContent className="px-4 pb-6 space-y-4">
                {loading ? (
                    <div className="text-sm text-muted-foreground px-4 py-8 text-center">
                        Memuat team updates...
                    </div>
                ) : error ? (
                    <div className="text-sm text-red-600 px-4 py-8 text-center">
                        {error}
                    </div>
                ) : projectIds.length === 0 ? (
                    <div className="text-sm text-muted-foreground px-4 py-8 text-center">
                        Belum ada team updates.
                    </div>
                ) : projectIds.map((projectId) => {
                    const projectLabel = projectLabels.get(Number(projectId)) ?? `Project ${projectId}`
                    const updates = groupedUpdates[projectId]
                    const stats = projectStats[projectId]
                    const colors = projectColors
                    const isExpanded = expandedProjects.has(projectId)

                    return (
                        <div
                            key={projectId}
                            className={cn(
                                "rounded-xl border overflow-hidden transition-all duration-200",
                                colors.border,
                                isExpanded ? "shadow-md" : "shadow-sm hover:shadow-md"
                            )}
                        >
                            {/* Project Header - Clickable */}
                            <button
                                onClick={() => toggleProject(projectId)}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 transition-colors",
                                    colors.bg,
                                    "hover:brightness-95 dark:hover:brightness-110"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <IconChevronRight 
                                        className={cn(
                                            "h-5 w-5 text-muted-foreground transition-transform duration-300 ease-in-out",
                                            isExpanded && "rotate-90"
                                        )} 
                                    />
                                    <IconFolder className={cn("h-5 w-5", colors.icon)} />
                                    <span className="font-semibold text-foreground">{projectLabel}</span>
                                    <Badge variant="secondary" className="ml-2">
                                        {updates.length} updates
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    {stats?.done > 0 && (
                                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                            {stats.done}
                                        </span>
                                    )}
                                    {stats?.inProgress > 0 && (
                                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                            {stats.inProgress}
                                        </span>
                                    )}
                                    {stats?.notStarted > 0 && (
                                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                            <span className="h-2 w-2 rounded-full bg-slate-500" />
                                            {stats.notStarted}
                                        </span>
                                    )}
                                </div>
                            </button>

                            {/* Expanded Content with smooth animation */}
                            <div 
                                className={cn(
                                    "grid transition-all duration-300 ease-in-out",
                                    isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                )}
                            >
                                <div className="overflow-hidden">
                                    <div className="border-t bg-background">
                                    {/* Export Buttons */}
                                    <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleExportExcel(projectLabel, updates)
                                            }}
                                            className="gap-2"
                                            disabled={updates.length === 0}
                                        >
                                            <IconFileSpreadsheet className="h-4 w-4 text-green-600" />
                                            Export Excel
                                        </Button>
                                    </div>

                                    {/* Table */}
                                    {updates.length === 0 ? (
                                        <div className="text-sm text-muted-foreground px-4 py-8 text-center">
                                            Tidak ada update yang ditemukan untuk project ini.
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table className="border-separate border-spacing-0">
                                                <TableHeader className="bg-muted/40 dark:bg-muted/20">
                                                    <TableRow className="hover:bg-transparent">
                                                        <TableHead className="min-w-[90px] pl-4">
                                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                                Tanggal
                                                            </span>
                                                        </TableHead>
                                                        <TableHead className="min-w-[140px]">
                                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                                Developer
                                                            </span>
                                                        </TableHead>
                                                        <TableHead className="min-w-[90px]">
                                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                                Status
                                                            </span>
                                                        </TableHead>
                                                        <TableHead className="min-w-[140px]">
                                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                                Kemarin
                                                            </span>
                                                        </TableHead>
                                                        <TableHead className="min-w-[140px]">
                                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                                Hari Ini
                                                            </span>
                                                        </TableHead>
                                                        <TableHead className="min-w-[160px]">
                                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                                Blocker
                                                            </span>
                                                        </TableHead>
                                                        <TableHead className="min-w-[120px] pr-4">
                                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                                Next Action
                                                            </span>
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {updates.map((item, index) => (
                                                        <TableRow
                                                            key={item.id}
                                                            className={cn(
                                                                "transition-all duration-200 hover:bg-primary/5",
                                                                "group",
                                                                index % 2 === 0 ? "bg-background" : "bg-muted/20"
                                                            )}
                                                        >
                                                            <TableCell className="pl-4 font-medium text-muted-foreground text-sm">
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
                                                                    <span className="text-sm font-medium">{item.developer.fullName}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <StatusBadge status={item.status} />
                                                            </TableCell>
                                                            <TableCell>
                                                                <p className="text-sm truncate max-w-[160px]" title={item.yesterdayWork}>
                                                                    {item.yesterdayWork}
                                                                </p>
                                                            </TableCell>
                                                            <TableCell>
                                                                <p className="text-sm truncate max-w-[160px]" title={item.todayWork}>
                                                                    {item.todayWork}
                                                                </p>
                                                            </TableCell>
                                                            <TableCell>
                                                                {item.blocker ? (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                                                                        <p className="text-sm text-red-600 dark:text-red-400 truncate max-w-[180px]" title={item.blocker}>
                                                                            {item.blocker}
                                                                        </p>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground/50">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="pr-4">
                                                                <Badge variant="outline" className="font-normal text-xs">
                                                                    {item.nextAction}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
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
