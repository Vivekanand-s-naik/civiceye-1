import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type IssueStatus = "open" | "inprogress" | "resolved" | "violation";

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
}

const statusConfig = {
  open: {
    label: "Open",
    className: "bg-issue-open/10 text-issue-open border-issue-open/20",
  },
  inprogress: {
    label: "In Progress",
    className: "bg-issue-inprogress/10 text-issue-inprogress border-issue-inprogress/20",
  },
  resolved: {
    label: "Resolved",
    className: "bg-issue-resolved/10 text-issue-resolved border-issue-resolved/20",
  },
  violation: {
    label: "Violation",
    className: "bg-issue-violation/10 text-issue-violation border-issue-violation/20",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge
      variant="outline"
      className={cn("border", config.className, className)}
      data-testid={`badge-status-${status}`}
    >
      {config.label}
    </Badge>
  );
}
