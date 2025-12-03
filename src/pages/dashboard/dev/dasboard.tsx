"use client";

import * as React from "react";
import axios from "axios";
import { AppSidebarDev } from "@/components/app-sidebardev";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  ListTodo,
  AlertCircle,
  TrendingUp,
  Zap,
  MessageSquare,
  Award,
  Calendar,
  CheckCircle2,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export default function DeveloperDashboard() {
  const [dashboard, setDashboard] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token tidak ditemukan!");
          return;
        }

        const res = await axios.get("http://localhost:3000/dashboard/developer", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDashboard(res.data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const safeNumber = (v: any, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

  if (loading) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebarDev />
        <SidebarInset>
          <SiteHeader />
          <div className="flex items-center justify-center h-[calc(100vh-var(--header-height))]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!dashboard) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebarDev />
        <SidebarInset>
          <SiteHeader />
          <div className="flex items-center justify-center h-[calc(100vh-var(--header-height))]">
            <p className="text-muted-foreground">Tidak dapat memuat data dashboard.</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // normalize values
  const totalAssignedTasks = safeNumber(dashboard.totalAssignedTasks, 0);
  const tasksInProgress = safeNumber(dashboard.tasksInProgress, 0);
  const overdueTasks = safeNumber(dashboard.overdueTasks, 0);
  const taskCompletionPercentage = clamp(safeNumber(dashboard.taskCompletionPercentage, 0));
  const openTasksHighPriority = safeNumber(dashboard.openTasksHighPriority, 0);
  const tasksDueNext7Days = safeNumber(dashboard.tasksDueNext7Days, 0);
  const completedTasksLast7Days = safeNumber(dashboard.completedTasksLast7Days, 0);

  const totalAssignedIssues = safeNumber(dashboard.totalAssignedIssues, 0);
  const issuesInProgress = safeNumber(dashboard.issuesInProgress, 0);
  const criticalIssues = safeNumber(dashboard.criticalIssues, 0);
  const completedIssuesLast7Days = safeNumber(dashboard.completedIssuesLast7Days, 0);

  const commentsWrittenLast7Days = safeNumber(dashboard.commentsWrittenLast7Days, 0);

  // Additional fields from API (displayed per user request)
  const userId = dashboard.userId ?? null;
  const email = dashboard.email ?? "";
  const bugToTaskCompletionRatio = dashboard.bugToTaskCompletionRatio ?? null;
  const totalAssignedProjects = safeNumber(dashboard.totalAssignedProjects, 0);
  const projectsInProgress = safeNumber(dashboard.projectsInProgress, 0);
  const workloadIndex = safeNumber(dashboard.workloadIndex, 0);
  const newTicketsAssignedLast7Days = safeNumber(dashboard.newTicketsAssignedLast7Days, 0);
  const commentsOnMyTicketsLast7Days = safeNumber(dashboard.commentsOnMyTicketsLast7Days, 0);
  const openIssuesHighPriority = safeNumber(dashboard.openIssuesHighPriority, 0);
  const issuesDueNext7Days = safeNumber(dashboard.issuesDueNext7Days, 0);

  const weeklyTasks = completedTasksLast7Days ?? 0;
  const weeklyIssues = completedIssuesLast7Days ?? 0;


  // Performance Rating Calculation
  const calculatePerformanceRating = () => {
    let score = 0;

    // Task Completion Rate (50 points)
    score += (taskCompletionPercentage / 100) * 50;

    // Overdue Tasks Penalty (30 points)
    const overdueRatio = totalAssignedTasks > 0 ? overdueTasks / totalAssignedTasks : 0;
    score += Math.max(0, 30 - (overdueRatio * 30));

    // Recent Productivity (10 points)
    const recentProductivity = completedTasksLast7Days + completedIssuesLast7Days;
    if (totalAssignedTasks === 0) {
      score += 5;
    } else if (recentProductivity > 0) {
      score += Math.min(10, recentProductivity * 2);
    }

    // Issue Resolution (5 points)
    if (totalAssignedIssues > 0) {
      const issueCompletionRate = ((totalAssignedIssues - issuesInProgress - criticalIssues) / totalAssignedIssues) * 5;
      score += issueCompletionRate;
    } else {
      score += 5;
    }

    // Engagement (5 points)
    if (commentsWrittenLast7Days > 0) {
      score += Math.min(5, commentsWrittenLast7Days * 0.5);
    } else {
      score += 2.5;
    }

    return Math.round(Math.min(100, score));
  };

  const performanceScore = calculatePerformanceRating();
  
  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "text-green-600", bgColor: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20", borderColor: "border-green-200 dark:border-green-900" };
    if (score >= 75) return { label: "Great", color: "text-blue-600", bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20", borderColor: "border-blue-200 dark:border-blue-900" };
    if (score >= 60) return { label: "Good", color: "text-yellow-600", bgColor: "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20", borderColor: "border-yellow-200 dark:border-yellow-900" };
    if (score >= 40) return { label: "Fair", color: "text-orange-600", bgColor: "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20", borderColor: "border-orange-200 dark:border-orange-900" };
    return { label: "Needs Improvement", color: "text-red-600", bgColor: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20", borderColor: "border-red-200 dark:border-red-900" };
  };

  const performanceLevel = getPerformanceLevel(performanceScore);

  // Chart data
  const taskOverviewData = [
    { name: "In Progress", value: tasksInProgress },
    { name: "Overdue", value: overdueTasks },
    { name: "Completed", value: Math.max(0, totalAssignedTasks - tasksInProgress - overdueTasks) },
  ];

  const issueOverviewData = [
    { name: "In Progress", value: issuesInProgress },
    { name: "Critical", value: criticalIssues },
    { name: "Resolved", value: Math.max(0, totalAssignedIssues - issuesInProgress - criticalIssues) },
  ];

  const ticketsByProjectData = Array.isArray(dashboard.ticketsByProject)
    ? dashboard.ticketsByProject.map((p: any) => ({
        project: `#${p.projectId}`,
        open: safeNumber(p.openTickets, 0),
        closed: Math.max(0, safeNumber(p.totalTickets, 0) - safeNumber(p.openTickets, 0)),
      }))
    : [];

  const COLORS = ["#3b82f6", "#f97316", "#10b981", "#ef4444"];
  
  // Custom tooltip for tickets chart showing colored squares matching bars
  const TicketsTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    // helper to pick color: prefer payload.color, fallback by dataKey
    const colorFor = (entry: any, index: number) => {
      if (entry && entry.color) return entry.color;
      if (entry && entry.dataKey) {
        if (entry.dataKey === "open") return COLORS[1];
        if (entry.dataKey === "closed") return COLORS[2];
      }
      return COLORS[index] || COLORS[0];
    };

    return (
      <div style={{ background: '#0b1220', color: '#fff', borderRadius: 8, padding: 10, minWidth: 140, boxShadow: '0 10px 30px rgba(2,6,23,0.6)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#d1d5db' }}>{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: i === payload.length - 1 ? 0 : 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, background: colorFor(p, i), borderRadius: 4, display: 'inline-block' }} />
              <span style={{ color: '#cbd5e1', fontSize: 12 }}>{p.name ?? p.dataKey}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 12 }}>{p.value ?? 0}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebarDev />
      <SidebarInset>
        <SiteHeader />

        <div className="p-4 space-y-4 bg-background">
          {/* Welcome Header */}
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back, {dashboard.fullName ?? "User"}!
            </h1>
            <p className="text-sm text-muted-foreground">
              Here's an overview of your tasks and progress
            </p>
          </div>

          {/* Performance & Key Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Performance Rating Card */}
            <Card className={`${performanceLevel.bgColor} ${performanceLevel.borderColor} border-2 shadow-sm`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                  <Award className={`h-4 w-4 ${performanceLevel.color}`} />
                  Performance Rating
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-3">
                <div className="flex items-center justify-center">
                  <div className="relative w-28 h-28">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="50"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="50"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - performanceScore / 100)}`}
                        className={performanceLevel.color}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${performanceLevel.color}`}>
                        {performanceScore}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">/ 100</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <Badge className={`${performanceLevel.color} bg-opacity-20 dark:bg-opacity-20 text-xs px-3 py-0.5 font-semibold`}>
                    {performanceLevel.label}
                  </Badge>
                </div>

                <div className="pt-2 border-t border-gray-300 dark:border-gray-700 space-y-1.5">
                  <div className ="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Weekly Output</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                    {weeklyTasks > 0 || weeklyIssues > 0
                    ? `${weeklyTasks} task${weeklyTasks !== 1 ? "s" : ""} | ${weeklyIssues} issue${weeklyIssues !== 1 ? "s" : ""}`
                    : "0 tasks | 0 issue"}
                    </span>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-3">
              {/* Total Tasks */}
              <Card className="hover:shadow-md transition-all duration-300 border border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Total Tasks</CardTitle>
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                    <ListTodo className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalAssignedTasks}</div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">All assigned to you</p>
                </CardContent>
              </Card>

              {/* In Progress */}
              <Card className="hover:shadow-md transition-all duration-300 border border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground">In Progress</CardTitle>
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                    <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{tasksInProgress}</div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Active work items</p>
                </CardContent>
              </Card>

              {/* Completion Rate */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
                  <CardTitle className="text-xs font-medium text-green-700 dark:text-green-400">Completion Task</CardTitle>
                  <div className="p-1.5 bg-green-200 dark:bg-green-900/50 rounded-md">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {taskCompletionPercentage}%
                  </div>
                  <Progress value={clamp(taskCompletionPercentage)} className="h-1.5 mt-1.5" />
                </CardContent>
              </Card>

              {/* Overdue */}
              <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-800 hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
                  <CardTitle className="text-xs font-medium text-red-700 dark:text-red-400">Overdue</CardTitle>
                  <div className="p-1.5 bg-red-200 dark:bg-red-900/50 rounded-md">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-2xl font-bold text-red-700 dark:text-red-400">{overdueTasks}</div>
                  <p className="text-[10px] text-red-600 dark:text-red-500 mt-0.5">Requires attention</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Charts & Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Task Overview Chart */}
            <Card className="hover:shadow-md transition-all duration-300 border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Task Distribution</CardTitle>
                <p className="text-[10px] text-muted-foreground">Current task states overview</p>
              </CardHeader>
              <CardContent className="pb-3">
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={taskOverviewData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={60}
                        innerRadius={35}
                        paddingAngle={4}
                      >
                        {taskOverviewData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  {taskOverviewData.map((d, idx) => (
                    <div key={d.name} className="text-center p-1.5 rounded-lg bg-muted/30 hover:bg-muted transition-colors">
                      <div className="w-2.5 h-2.5 rounded-full mx-auto mb-1" style={{ backgroundColor: COLORS[idx] }} />
                      <div className="font-bold text-sm text-foreground">{d.value}</div>
                      <div className="text-muted-foreground text-[9px] mt-0.5">{d.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Issue Status */}
            <Card className="hover:shadow-md transition-all duration-300 border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Issue</CardTitle>
                <p className="text-[10px] text-muted-foreground">Current issues breakdown</p>
              </CardHeader>
              <CardContent className="space-y-2 pb-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-100 dark:border-blue-900 hover:shadow-sm transition-all">
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{issuesInProgress}</div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">In Progress</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border border-red-100 dark:border-red-900 hover:shadow-sm transition-all">
                    <div className="text-xl font-bold text-red-600 dark:text-red-400">{criticalIssues}</div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">Critical</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-100 dark:border-orange-900 hover:shadow-sm transition-all">
                    <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{openIssuesHighPriority}</div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">High Priority</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-100 dark:border-amber-900 hover:shadow-sm transition-all">
                    <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{issuesDueNext7Days}</div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">Due 7 Days</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total Issues</span>
                    <Badge variant="outline" className="text-sm font-bold border-border text-foreground">{totalAssignedIssues}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Tickets Chart */}
          <Card className="hover:shadow-md transition-all duration-300 border border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Project Tickets Overview</CardTitle>
              <p className="text-[10px] text-muted-foreground">Open vs Closed tickets per project</p>
            </CardHeader>
            <CardContent className="pb-3">
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={ticketsByProjectData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="project" tick={{ fontSize: 11, fill: 'currentColor' }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} className="text-muted-foreground" />
                    <Tooltip content={<TicketsTooltip />} wrapperStyle={{ overflow: 'visible', zIndex: 9999 }} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: '8px' }} />
                    <Bar dataKey="open" fill={COLORS[1]} radius={[6, 6, 0, 0]} name="Open Tickets" />
                    <Bar dataKey="closed" fill={COLORS[2]} radius={[6, 6, 0, 0]} name="Closed Tickets" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Activity & Upcoming */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Activity */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 border-border bg-card">
  <CardHeader className="pb-3">
    <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
      <Activity className="h-5 w-5" />
      Recent Activity
    </CardTitle>
    <p className="text-xs text-muted-foreground">Last 7 days summary</p>
  </CardHeader>

  <CardContent className="space-y-2 pb-3">
    {/* Completed Tasks */}
    <div className="flex items-center justify-between p-2 rounded-md bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-100 dark:border-blue-900">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-blue-500/20">
          <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <span className="text-xs font-medium text-foreground">Completed Tasks</span>
      </div>
      <Badge className="bg-blue-600 dark:bg-blue-500 text-white text-[10px] px-2 py-0.5">
        {completedTasksLast7Days}
      </Badge>
    </div>

    {/* Comments Written */}
    <div className="flex items-center justify-between p-2 rounded-md bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-100 dark:border-green-900">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-green-500/20">
          <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <span className="text-xs font-medium text-foreground">Comments Written</span>
      </div>
      <Badge className="bg-green-600 dark:bg-green-500 text-white text-[10px] px-2 py-0.5">
        {commentsWrittenLast7Days}
      </Badge>
    </div>

    {/* Completed Issues */}
    <div className="flex items-center justify-between p-2 rounded-md bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-100 dark:border-purple-900">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-purple-500/20">
          <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <span className="text-xs font-medium text-foreground">Completed Issues</span>
      </div>
      <Badge className="bg-purple-600 dark:bg-purple-500 text-white text-[10px] px-2 py-0.5">
        {completedIssuesLast7Days}
      </Badge>
    </div>
  </CardContent>
</Card>


            {/* Upcoming & Priority */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 border-border bg-card">
  <CardHeader className="pb-3">
    <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
      <Calendar className="h-5 w-5" />
      Priority & Upcoming
    </CardTitle>
    <p className="text-xs text-muted-foreground">What needs attention</p>
  </CardHeader>

  <CardContent className="space-y-2 pb-3">

    {/* High Priority */}
    <div className="flex items-center justify-between p-2 rounded-md bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-100 dark:border-orange-900">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-orange-500/20">
          <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </div>
        <span className="text-xs font-medium text-foreground">High Priority Tasks</span>
      </div>
      <Badge className="bg-orange-600 dark:bg-orange-500 text-white text-[10px] px-2 py-0.5">
        {openTasksHighPriority}
      </Badge>
    </div>

    {/* Due 7 Days */}
    <div className="flex items-center justify-between p-2 rounded-md bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border border-yellow-100 dark:border-yellow-900">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-yellow-500/20">
          <Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        </div>
        <span className="text-xs font-medium text-foreground">Tasks Due Next 7 Days</span>
      </div>
      <Badge className="bg-yellow-600 dark:bg-yellow-500 text-white text-[10px] px-2 py-0.5">
        {tasksDueNext7Days}
      </Badge>
    </div>

    {/* Critical Issues */}
    <div className="flex items-center justify-between p-2 rounded-md bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border border-red-100 dark:border-red-900">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        </div>
        <span className="text-xs font-medium text-foreground">Critical Issues</span>
      </div>
      <Badge className="bg-red-600 dark:bg-red-500 text-white text-[10px] px-2 py-0.5">
        {criticalIssues}
      </Badge>
    </div>

  </CardContent>
</Card>

          </div>

          {/* Projects Overview */}
          <Card className="hover:shadow-md transition-all duration-300 border border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Activity className="h-4 w-4" />
                Projects Overview
              </CardTitle>
              <p className="text-[10px] text-muted-foreground">Your assigned projects</p>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-indigo-500/10">
                      <ListTodo className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-xs font-medium text-foreground">Total Projects</span>
                  </div>
                  <Badge className="bg-indigo-600 dark:bg-indigo-500 text-white text-xs px-2 py-0.5">{totalAssignedProjects}</Badge>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/20 dark:to-fuchsia-950/20 border border-violet-100 dark:border-violet-900 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-violet-500/10">
                      <TrendingUp className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="text-xs font-medium text-foreground">In Progress</span>
                  </div>
                  <Badge className="bg-violet-600 dark:bg-violet-500 text-white text-xs px-2 py-0.5">{projectsInProgress}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}