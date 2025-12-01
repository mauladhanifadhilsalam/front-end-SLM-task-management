import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ProjectHeaderProps {
  projectName: string;
  projectId: string | undefined;
  onBack: () => void;
}

export const ProjectHeader = ({
  projectName,
  projectId,
  onBack,
}: ProjectHeaderProps) => {
  return (
    <div className="flex-shrink-0 px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 space-y-3 md:space-y-4 border-b border-border">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Button>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          {projectName || "Task Project"}
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          Project ID: {projectId}
        </p>
      </div>
    </div>
  );
};