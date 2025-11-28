import { Card, CardContent } from "@/components/ui/card";
import { IssueDetail } from "@/types/issue-detail.types";
import { IssueDetailHeader } from "./issue-detail-header";
import { IssueDescription } from "./issue-description";
import { IssueMetadata } from "./issue-metadata";
import { IssueAssignees } from "./issue-assignees";

interface IssueDetailCardProps {
  issue: IssueDetail;
}

export const IssueDetailCard = ({ issue }: IssueDetailCardProps) => {
  return (
    <Card className="p-6">
      <IssueDetailHeader issue={issue} />

      <CardContent className="p-0 space-y-4">
        <IssueDescription description={issue.description} />
        <IssueMetadata issue={issue} />
        <IssueAssignees assignees={issue.assignees} />
      </CardContent>
    </Card>
  );
};