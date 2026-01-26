"use client"

import * as React from "react"
import { AppSidebarPm } from "../components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TrendingUp, Clock, Users } from "lucide-react"
import { useInboxLeaderboard } from "@/pages/dashboard/pm/hooks/useInboxLeaderboard"
import { Developer } from "@/types/leaderboard.types"

const formatScore = (score: number): string => {
  return (score * 100).toFixed(2)
}

// Subcomponent: Criteria Weight Card
const CriteriaWeightCard: React.FC<{
  icon: React.ReactNode
  label: string
  value: number
}> = ({ icon, label, value }) => (
  <div className="rounded-lg border bg-card p-4">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{formatScore(value)}%</p>
      </div>
    </div>
  </div>
)

// Subcomponent: Score Bar
const ScoreBar: React.FC<{ score: number }> = ({ score }) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-sm font-medium">{formatScore(score)}%</span>
    <div className="w-full max-w-[100px] h-1.5 bg-muted rounded-full overflow-hidden">
      <div 
        className="h-full bg-primary rounded-full transition-all"
        style={{ width: `${score * 100}%` }}
      />
    </div>
  </div>
)

// Subcomponent: Developer Row
const DeveloperRow: React.FC<{ developer: Developer; rank: number }> = ({ 
  developer, 
  rank 
}) => (
  <tr className="border-b last:border-0 hover:bg-muted/50 transition-colors">
    <td className="p-4">
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted text-sm font-semibold">
        {rank}
      </div>
    </td>
    <td className="p-4">
      <div>
        <p className="font-medium">{developer.fullName}</p>
        <p className="text-xs text-muted-foreground">{developer.email}</p>
      </div>
    </td>
    <td className="p-4 text-center">
      <span className="font-medium">{developer.completedTicketCount}</span>
    </td>
    <td className="p-4">
      <ScoreBar score={developer.averagePriorityScore} />
    </td>
    <td className="p-4">
      <ScoreBar score={developer.averageDueUrgencyScore} />
    </td>
    <td className="p-4">
      <ScoreBar score={developer.ticketLoadScore} />
    </td>
    <td className="p-4 text-center">
      <span className="inline-flex items-center justify-center rounded-md bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
        {formatScore(developer.rewardScore)}
      </span>
    </td>
  </tr>
)

// Main Component
export default function InboxLeaderboardPage() {
  const { data: leaderboardData, loading, error, refetch } = useInboxLeaderboard()

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebarPm variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col overflow-auto">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              
              <div className="px-4 lg:px-6 space-y-6">
                
                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-sm text-muted-foreground">
                      Loading leaderboard data...
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <p className="text-sm text-destructive font-medium">
                      {error}
                    </p>
                    <button 
                      onClick={refetch}
                      className="mt-2 text-xs text-destructive underline hover:no-underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {/* Content */}
                {!loading && !error && leaderboardData && (
                  <>
                    {/* Header */}
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold tracking-tight">
                        Leaderboard
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Performance metrics for {leaderboardData.projectName} • Last 30 days
                      </p>
                    </div>

                    {/* Criteria Weights */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <CriteriaWeightCard
                        icon={<TrendingUp className="h-4 w-4 text-primary" />}
                        label="Priority Weight"
                        value={leaderboardData.criteriaWeights.priority}
                      />
                      <CriteriaWeightCard
                        icon={<Clock className="h-4 w-4 text-primary" />}
                        label="Due Time Weight"
                        value={leaderboardData.criteriaWeights.dueTime}
                      />
                      <CriteriaWeightCard
                        icon={<Users className="h-4 w-4 text-primary" />}
                        label="Ticket Load Weight"
                        value={leaderboardData.criteriaWeights.ticketLoad}
                      />
                    </div>

                    {/* Leaderboard Table */}
                    <div className="rounded-lg border bg-card">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-sm">
                                Rank
                              </th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-sm">
                                Developer
                              </th>
                              <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground text-sm">
                                Completed
                              </th>
                              <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground text-sm">
                                Priority Score
                              </th>
                              <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground text-sm">
                                Due Urgency Score
                              </th>
                              <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground text-sm">
                                Ticket Load Score
                              </th>
                              <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground text-sm">
                                Total Score
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {leaderboardData.developers.map((dev, index) => (
                              <DeveloperRow
                                key={dev.userId}
                                developer={dev}
                                rank={index + 1}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    </>
                )}

              </div>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}