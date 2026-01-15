import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconEye, IconCalendar } from "@tabler/icons-react";
import { AssignmentCard } from "@/types/developer-projects.types";

interface DeveloperProjectCardProps {
  assignment: AssignmentCard;
}

const formatStatus = (status: string) =>
  status.replace(/_/g, " ").toLowerCase();

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

const formatRole = (role: string) => role.replace(/_/g, " ").toLowerCase();

export function DeveloperProjectCard({
  assignment,
}: DeveloperProjectCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold line-clamp-2">
          {assignment.name}
        </CardTitle>
        <Badge variant="secondary" className="w-fit text-xs capitalize mt-1">
          Peran: {formatRole(assignment.roleInProject)}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Status</span>
          <Badge variant="outline" className="capitalize">
            {formatStatus(assignment.status)}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-1">
            <IconCalendar className="h-3.5 w-3.5" />
            Periode
          </span>
          <span>
            {formatDate(assignment.startDate)} - {formatDate(assignment.endDate)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Link
          to={`/developer-dashboard/projects/${assignment.projectId}`}
          className="w-full"
        >
          <Button className="w-full gap-2">
            <IconEye className="h-4 w-4" />
            Lihat Task
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}