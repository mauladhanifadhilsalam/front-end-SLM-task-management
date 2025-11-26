import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { IssueDetail } from "@/types/issue-detail.types";
import { getStatusColor } from "@/utils/format.utils";

interface IssueDetailHeaderProps {
  issue: IssueDetail;
}

export const IssueDetailHeader = ({ issue }: IssueDetailHeaderProps) => {
  return (
    <CardHeader className="p-0 pb-4">
      <div className="flex items-center justify-between">
        {/* Diamond Indicator dan Judul */}
        <div className="flex items-center space-x-3">
          <span
            className={`text-2xl leading-none ${getStatusColor(issue.status)}`}
            role="img"
            aria-label="Progress Indicator"
          >
            ◆
          </span>
          <CardTitle className="text-2xl font-bold">{issue.title}</CardTitle>
        </div>

        {/* Priority Badge */}
        <Badge
          variant={
            issue.priority === "CRITICAL" || issue.priority === "HIGH"
              ? "destructive"
              : "outline"
          }
          className={`px-3 py-1 rounded-full ${
            issue.priority === "CRITICAL"
              ? "bg-red-900/50 text-red-300 border-red-800"
              : ""
          }`}
        >
          {issue.priority}
        </Badge>
      </div>
    </CardHeader>
  );
};