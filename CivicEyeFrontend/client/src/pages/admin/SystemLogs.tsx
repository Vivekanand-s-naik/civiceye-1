import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Search, ShieldAlert, CheckCircle2, FileText, User, Clock, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SystemLog {
  id: number;
  action: string;
  user: string;
  details?: string;
  time: string;
  created_at: string;
}

export default function SystemLogs() {
  const [search, setSearch] = useState("");

  const { data: logs = [], isLoading, refetch } = useQuery<SystemLog[]>({
    queryKey: ["adminSystemLogs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/logs");
      if (!res.ok) throw new Error("Failed to fetch system logs");
      return res.json();
    },
  });

  const filteredLogs = logs.filter(
    (l) =>
      (l.action || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.user || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.details || "").toLowerCase().includes(search.toLowerCase())
  );

  const getActionBadgeColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("login") || act.includes("auth")) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
    }
    if (act.includes("verified") || act.includes("resolved")) {
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
    }
    if (act.includes("penalty") || act.includes("reject")) {
      return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
    }
    if (act.includes("ai") || act.includes("prediction")) {
      return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300";
    }
    return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">System Audit & Activity Logs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Immutable database audit trail recording administrative decisions, verifications, and security events
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh Logs
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by action, user, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Badge variant="outline" className="text-xs">
            {filteredLogs.length} Events Logged
          </Badge>
        </CardContent>
      </Card>

      {/* Logs Timeline */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <Card key={log.id} className="border-border/60 hover:shadow-xs transition-shadow">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-xs font-bold ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </Badge>
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" /> {log.user}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-xs text-muted-foreground pt-0.5">{log.details}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-muted-foreground whitespace-nowrap self-end sm:self-center">
                  <Clock className="h-3 w-3" />
                  <span>{log.time || new Date(log.created_at).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 border-dashed">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-semibold">No System Logs Found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? "No logs match your search criteria." : "Logs will appear as system actions occur."}
          </p>
        </Card>
      )}
    </div>
  );
}
