import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { ProjectUpdate } from "@/types/project-update.type"

type Props = {
  todayUpdates: ProjectUpdate[]
  loading: boolean
  error: string | null
  onEdit: (update: ProjectUpdate) => void
  onDelete: (id: number) => void
  onOpenDialog: () => void
}

export function ProjectUpdatesSection({
  todayUpdates,
  loading,
  error,
  onEdit,
  onDelete,
  onOpenDialog,
}: Props) {
  return (
    <Card className="border border-border/60 shadow-none">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Project Updates</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8" onClick={onOpenDialog}>
              <Plus className="h-4 w-4 mr-1" />
              Add Update
            </Button>
          </DialogTrigger>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">
            Memuat project updates...
          </div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : todayUpdates.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            There are no project updates for today
          </div>
        ) : (
          <div className="space-y-4">
            {todayUpdates.map((update) => (
              <div
                key={update.id}
                className="rounded-lg border border-border/60 bg-card/60 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-sm font-medium">
                    {formatDate(update.reportDate)}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => onEdit(update)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => onDelete(update.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Phase</span>
                    <span className="text-right font-medium">
                      {update.phase?.name ?? "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Peserta</span>
                    <span className="text-right font-medium">
                      {update.participant || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Tujuan Daily</span>
                    <span className="text-right font-medium">
                      {update.objective || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Highlight Progress</span>
                    <span className="text-right font-medium">
                      {update.progressHighlight || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Mood Team</span>
                    <span className="text-right font-medium">
                      {update.teamMood || "-"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
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