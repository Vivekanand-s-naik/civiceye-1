import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type IssueStatus = "open" | "inprogress" | "resolved" | "violation";

interface IssueCardProps {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  category: string;
  location: string;
  date: string;
  imageUrl?: string;
  onClick?: () => void;
  className?: string;
}

export function IssueCard({
  id,
  title,
  description,
  status,
  category,
  location,
  date,
  imageUrl,
  onClick,
  className,
}: IssueCardProps) {
  return (
    <Card
      className={cn(
        "hover-elevate cursor-pointer transition-all",
        className
      )}
      onClick={onClick}
      data-testid={`card-issue-${id}`}
    >
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
            data-testid={`img-issue-${id}`}
          />
        </div>
      )}
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-1" data-testid={`text-issue-title-${id}`}>{title}</h3>
          <StatusBadge status={status} />
        </div>
        <p className="text-sm text-muted-foreground">{category}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-2">{description}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{date}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
