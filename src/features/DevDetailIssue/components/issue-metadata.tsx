import { Badge } from "@/components/ui/badge";
import { IssueDetail } from "@/types/issue-detail.types";
import { formatDate, formatStatus } from "@/utils/format.utils";

interface IssueMetadataProps {
  issue: IssueDetail;
}

export const IssueMetadata = ({ issue }: IssueMetadataProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
        <Badge variant="outline" className="mt-1">
          {formatStatus(issue.status)}
        </Badge>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground">Tipe</h4>
        <Badge variant="secondary" className="mt-1">
          {issue.type}
        </Badge>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground">Due Date</h4>
        <p className="mt-1">{formatDate(issue.dueDate)}</p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground">
          Project ID
        </h4>
        <p className="mt-1">{issue.projectId}</p>
      </div>
    </div>
  );
};