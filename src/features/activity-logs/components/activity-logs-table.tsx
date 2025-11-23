import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconTrash } from "@tabler/icons-react"
import type {
  ActivityLog,
  ActivityLogColumns,
} from "@/types/activity-log.type"

type Props = {
  logs: ActivityLog[]
  filteredLogs: ActivityLog[]
  loading: boolean
  error: string
  cols: ActivityLogColumns
  visibleColCount: number
  onDeleteClick: (log: ActivityLog) => void
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

const getActionVariant = (action: string) => {
  const upper = action.toUpperCase()
  if (upper.includes("AUTH")) return "secondary"
  if (upper.includes("DELETE")) return "destructive"
  if (upper.includes("UPDATE")) return "default"
  if (upper.includes("CREATE")) return "success"
  return "outline"
}

export const ActivityLogsTable: React.FC<Props> = ({
  logs,
  filteredLogs,
  loading,
  error,
  cols,
  visibleColCount,
  onDeleteClick,
}) => {
  const colSpan = visibleColCount || 1

  return (
    <div className="px-4 lg:px-6">
      <Card className="rounded-md border overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              {cols.id && (
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  NO
                </th>
              )}
              {cols.action && (
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Action
                </th>
              )}
              {cols.user && (
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  User
                </th>
              )}
              {cols.role && (
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Role
                </th>
              )}
              {cols.targetType && (
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Target Type
                </th>
              )}
              {cols.targetId && (
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Target ID
                </th>
              )}
              {cols.details && (
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Details
                </th>
              )}
              {cols.occurredAt && (
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Occurred At
                </th>
              )}
              {cols.actions && (
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {loading ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className="px-4 py-6 text-center"
                >
                  Memuat data...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className="px-4 py-6 text-center text-red-600"
                >
                  {error}
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="align-top">
                  {cols.id && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      {log.id}
                    </td>
                  )}

                  {cols.action && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge
                        variant={
                          getActionVariant(
                            log.action,
                          ) as any
                        }
                      >
                        {log.action}
                      </Badge>
                    </td>
                  )}

                  {cols.user && (
                    <td className="px-4 py-3 min-w-[180px]">
                      <div className="font-medium">
                        {log.user.fullName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.user.email}
                      </div>
                    </td>
                  )}

                  {cols.role && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className="uppercase"
                      >
                        {log.user.role}
                      </Badge>
                    </td>
                  )}

                  {cols.targetType && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      {log.targetType}
                    </td>
                  )}

                  {cols.targetId && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      #{log.targetId}
                    </td>
                  )}

                  {cols.details && (
                    <td className="px-4 py-3 max-w-[260px]">
                      <div className="space-y-0.5">
                        {Object.entries(log.details || {}).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="text-xs truncate"
                              title={`${key}: ${String(value)}`}
                            >
                              <span className="font-medium">
                                {key}:{" "}
                              </span>
                              {String(value)}
                            </div>
                          ),
                        )}
                      </div>
                    </td>
                  )}

                  {cols.occurredAt && (
                    <td className="px-4 py-3 whitespace-nowrap text-xs md:text-sm">
                      {formatDate(log.occurredAt)}
                    </td>
                  )}

                  {cols.actions && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteClick(log)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
