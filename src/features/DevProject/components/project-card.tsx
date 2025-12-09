import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconEye, IconTicket } from "@tabler/icons-react";
import { AssignmentCard } from "@/types/developer-projects.types";

interface DeveloperProjectCardProps {
  assignment: AssignmentCard;
}

const formatStatus = (status: string) =>
  status.replace(/_/g, " ").toLowerCase();

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("id-ID") : "-";

export function DeveloperProjectCard({ assignment }: DeveloperProjectCardProps) {
  return (
    <Card className="hover:shadow-md transition border p-2">
      <CardHeader>
        <CardTitle>{assignment.name}</CardTitle>
        <CardDescription className="text-xs mt-1">
          Peran: <Badge variant="secondary">{assignment.roleInProject}</Badge>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Status</span>
          <Badge variant="outline">{formatStatus(assignment.status)}</Badge>
        </div>

        <div className="flex justify-between text-sm">
          <span>Mulai</span>
          <span>{formatDate(assignment.startDate)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Selesai</span>
          <span>{formatDate(assignment.endDate)}</span>
        </div>

        <Link to={`/developer-dashboard/projects/${assignment.projectId}`}>
          <Button className="w-full mt-4 flex items-center gap-2">
            <IconEye className="h-4 w-4" />
            Lihat Task
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}