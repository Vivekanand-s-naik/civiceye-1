import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  accentColor?: "primary" | "success" | "warning" | "danger";
  className?: string;
}

const accentColors = {
  primary: "border-l-primary",
  success: "border-l-issue-resolved",
  warning: "border-l-issue-open",
  danger: "border-l-issue-violation",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  accentColor = "primary",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("border-l-4", accentColors[accentColor], className)} data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`text-stat-value`}>{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            {trend && (
              <span className={trend.isPositive ? "text-issue-resolved" : "text-issue-violation"}>
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
