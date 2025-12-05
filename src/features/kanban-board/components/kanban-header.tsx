import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type HeaderStats = {
  total: number;
  inProgress: number;
  todo: number;
  completionPct: number;
};

interface ProjectHeaderProps {
  projectName: string;
  projectId: string | undefined;
  onBack: () => void;
  stats?: HeaderStats;
  companyName?: string;
  startDate?: string | null;
  endDate?: string | null;
}

export const ProjectHeader = ({
  projectName,
  projectId,
  onBack,
  stats,
  companyName,
  startDate,
  endDate,
}: ProjectHeaderProps) => {
  const summary = stats ?? { total: 0, inProgress: 0, todo: 0, completionPct: 0 };
  const duration = formatDuration(startDate, endDate);

  return (
    <div className="flex-shrink-0 px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 space-y-4 border-b border-border bg-background">
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Button>
      </div>

      <div className="flex justify-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {projectName || "Task Project"}
          </h1>
        </div>
      </div>
    </div>
  );
};

function formatDuration(start?: string | null, end?: string | null) {
  if (!start && !end) return "";
  if (start && end) return `${formatDate(start)} - ${formatDate(end)}`;
  if (start) return `${formatDate(start)} -`;
  if (end) return `- ${formatDate(end)}`;
  return "";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
