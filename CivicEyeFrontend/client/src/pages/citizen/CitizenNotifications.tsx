import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bell, CheckCircle2, Award, AlertTriangle, Trash2, RefreshCw, CheckCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

interface NotificationItem {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  status: string;
  created_at: string;
}

export default function CitizenNotifications() {
  const { currentUser } = useUser();
  const userId = currentUser?.id || 1;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: notifications = [], isLoading, refetch } = useQuery<NotificationItem[]>({
    queryKey: ["citizenNotificationsList", userId],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?user_id=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citizenNotificationsList", userId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citizenNotificationsList", userId] });
      toast({ title: "Notification removed" });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reward_credited":
        return <Award className="text-amber-500 h-5 w-5 flex-shrink-0" />;
      case "report_status_update":
        return <CheckCircle2 className="text-emerald-500 h-5 w-5 flex-shrink-0" />;
      case "penalty_issued":
        return <AlertTriangle className="text-blue-500 h-5 w-5 flex-shrink-0" />;
      default:
        return <Bell className="text-blue-600 h-5 w-5 flex-shrink-0" />;
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Citizen Alerts & Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time updates regarding your submitted civic reports, authority verifications, and earned rewards
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`border transition-all ${
                notif.is_read
                  ? "bg-white dark:bg-slate-900 border-border/50 opacity-80"
                  : "bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 shadow-xs"
              }`}
            >
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getNotificationIcon(notif.type)}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-foreground">{notif.title}</p>
                      {!notif.is_read && (
                        <Badge className="bg-blue-600 text-white text-[9px] px-1.5 py-0 h-4">NEW</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground/70 pt-1">
                      {new Date(notif.created_at).toLocaleDateString()} at{" "}
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {!notif.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950"
                      onClick={() => markReadMutation.mutate(notif.id)}
                      title="Mark as Read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={() => deleteMutation.mutate(notif.id)}
                    title="Delete Notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16 border-dashed">
          <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-semibold">No Notifications</h3>
          <p className="text-xs text-muted-foreground mt-1">
            You're all caught up! Updates regarding your reports will appear here.
          </p>
        </Card>
      )}
    </motion.div>
  );
}
