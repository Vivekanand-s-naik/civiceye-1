
import {
  Users,
  FileText,
  Award,
  TrendingUp,
  User,
  Shield,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { StatCard } from "@/components/stat-card";
import { ChartCard } from "@/components/chart-card";
import { toast } from "sonner";
import CountUp from "react-countup";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [backendValue, setBackendValue] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingBackend, setLoadingBackend] = useState(true);

  useEffect(() => {
    const fetchBackendValue = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/value");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setBackendValue(data.value);
      } catch (err) {
        console.error("Backend fetch error:", err);
        toast.error("Failed to fetch backend value.");
      } finally {
        setLoadingBackend(false);
      }
    };
    fetchBackendValue();
  }, []);

  const categoryData = [
    { name: "Garbage", value: 45 },
    { name: "Potholes", value: 32 },
    { name: "Street Lights", value: 28 },
    { name: "Water", value: 18 },
  ];

  const monthlyData = [
    { name: "Jan", value: 65 },
    { name: "Feb", value: 72 },
    { name: "Mar", value: 81 },
    { name: "Apr", value: 78 },
    { name: "May", value: 92 },
  ];

  const topReporters = [
    { id: "1", name: "John Doe", email: "john@example.com", reports: 45, points: 1250, rank: "Gold" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", reports: 38, points: 980, rank: "Silver" },
    { id: "3", name: "Bob Wilson", email: "bob@example.com", reports: 32, points: 850, rank: "Silver" },
  ];

  const filteredReporters = topReporters.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      data-testid="page-admin-dashboard"
    >
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          System insights, performance analytics, and management tools
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Users"
          value="1,234"
          icon={Users}
          trend={{ value: 8, isPositive: true }}
          description="Active users"
          accentColor="primary"
        />
        <StatCard
          title="Total Reports"
          value="5,678"
          icon={FileText}
          description="All-time"
          accentColor="success"
        />
        <StatCard
          title="Resolution Rate"
          value="87%"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
          description="This month"
          accentColor="warning"
        />
        <StatCard
          title="Reward Pool"
          value="$12.5K"
          icon={Award}
          description="Available balance"
          // accentColor="info"
        />
        <Card className="flex flex-col justify-center items-center">
          <CardContent className="text-center space-y-1">
            <p className="text-sm text-muted-foreground font-medium">
              Backend Value
            </p>
            {loadingBackend ? (
              <Skeleton className="w-16 h-5 mx-auto" />
            ) : (
              <p className="text-2xl font-semibold text-primary">
                <CountUp end={backendValue ?? 0} duration={1.2} />
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Monthly Trends"
          description="Issue reports over the last 5 months"
          type="bar"
          data={monthlyData}
          dataKey="value"
          xAxisKey="name"
        />
        <ChartCard
          title="Issue Categories"
          description="Distribution by category"
          type="pie"
          data={categoryData}
          dataKey="value"
        />
      </div>

      {/* Top Reporters */}
      <Card className="border-t-4 border-primary/70 shadow-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-lg font-semibold">Top Reporters</CardTitle>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reporter..."
              className="h-8 w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Reports</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReporters.length > 0 ? (
                filteredReporters.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.reports}</TableCell>
                    <TableCell>{user.points}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.rank}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="hover:text-primary"
                                >
                                  <User className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>View Profile</TooltipContent>
                          </Tooltip>
                          <DialogContent>
                            <h3 className="text-lg font-semibold mb-2">
                              {user.name}'s Profile
                            </h3>
                            <div className="space-y-1 text-sm">
                              <p>Email: {user.email}</p>
                              <p>Reports: {user.reports}</p>
                              <p>Points: {user.points}</p>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:text-destructive"
                              onClick={() => toast("Manage access clicked.")}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Manage Access</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    No reporters found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Management Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "User Management",
            icon: Users,
            desc: "Manage user accounts, roles, and permissions",
            testId: "card-user-management",
          },
          {
            title: "Reward Distribution",
            icon: Award,
            desc: "Approve and manage reward point payouts",
            testId: "card-reward-distribution",
          },
          {
            title: "System Logs",
            icon: FileText,
            desc: "View access logs and system analytics",
            testId: "card-system-logs",
          },
        ].map((card) => (
          <motion.div
            key={card.title}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card
              className="cursor-pointer group border border-gray-200 hover:border-primary/50 hover:shadow-md"
              data-testid={card.testId}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 group-hover:text-primary">
                  <card.icon className="h-5 w-5" />
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{card.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
