import { Link } from "react-router-dom"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { IconEye, IconCalendar, IconDotsVertical, IconListDetails, IconInfoCircle } from "@tabler/icons-react"
import { AssignmentCard } from "@/types/developer-projects.types"

interface DeveloperProjectCardProps {
  assignment: AssignmentCard
}

const formatStatus = (status: string) =>
  status.replace(/_/g, " ").toLowerCase()

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-"

const formatRole = (role: string) =>
  role.replace(/_/g, " ").toLowerCase()

export function DeveloperProjectCard({
  assignment,
}: DeveloperProjectCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 relative">
        <div className="absolute right-4 top-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <Link to={`/developer-dashboard/projects/view/${assignment.projectId}`}>
                  <IconInfoCircle className="h-3.5 w-3.5 mr-2" />
                  Project Details
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardTitle className="text-base font-semibold line-clamp-2 min-h-[3rem] pr-10">
          {assignment.name}
        </CardTitle>
        <Badge variant="secondary" className="w-fit text-xs capitalize mt-1">
          Peran: {formatRole(assignment.roleInProject)}
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 grid grid-rows-2 gap-3 text-sm">
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
          <span className="text-right">
            {formatDate(assignment.startDate)} –{" "}
            {formatDate(assignment.endDate)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
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
  )
}
