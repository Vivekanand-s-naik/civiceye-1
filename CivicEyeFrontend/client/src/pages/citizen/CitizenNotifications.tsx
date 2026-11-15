import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bell, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CitizenNotifications() {
  const { data, isLoading } = useQuery({
    queryKey: ["citizenNotifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      return res.json();
    },
  });

  if (isLoading)
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {data?.length ? (
        data.map((notif: any, idx: number) => (
          <Card key={idx} className="border-gray-200 hover:shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="text-blue-500" size={18} /> {notif.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground flex items-center justify-between">
              <p>{notif.message}</p>
              {notif.status === "read" && (
                <CheckCircle2 className="text-green-500" size={16} />
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-center text-gray-500">No notifications available.</p>
      )}
    </motion.div>
  );
}
