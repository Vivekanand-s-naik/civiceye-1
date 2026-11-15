import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const logs = [
  { id: 1, action: "Report Verified", user: "Authority Asha", time: "2 mins ago" },
  { id: 2, action: "Penalty Added", user: "Authority Ravi", time: "15 mins ago" },
  { id: 3, action: "User Activated", user: "Admin", time: "1 hour ago" },
  { id: 4, action: "AI Prediction Generated", user: "System", time: "3 hours ago" },
];

export default function SystemLogs() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">System Logs</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {logs.map((log) => (
          <Card key={log.id} className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>{log.action}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Performed by: <b>{log.user}</b></p>
              <p>Time: <b>{log.time}</b></p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
