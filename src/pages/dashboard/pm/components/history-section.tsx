import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type HistoryRow = {
  date: string
  totalIssues: number
  note: string
}

type Props = {
  historyRows: HistoryRow[]
}

export function HistorySection({ historyRows }: Props) {
  return (
    <Card className="border border-border/60 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">History</CardTitle>
      </CardHeader>
      <CardContent>
        {historyRows.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            History not found.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/60">
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0 text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground w-[28%]">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground w-[18%]">
                      Jumlah Isu
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Catatan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historyRows.map((row, idx) => (
                    <tr
                      key={`${row.date}-${idx}`}
                      className="transition-colors hover:bg-primary/5 border-t border-border/60"
                    >
                      <td className="px-4 py-3 font-medium">
                        {formatDate(row.date)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.totalIssues}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatDate(value?: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}