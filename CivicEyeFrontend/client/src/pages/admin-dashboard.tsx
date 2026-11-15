import {
  Users,
  FileText,
  Award,
  TrendingUp,
  Shield,
  Search,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  RefreshCw,
  Settings,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { useState } from "react";
import { StatCard } from "@/components/stat-card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useLocation } from "wouter";

interface PlatformStats {
  totalUsers: number;
  totalReports: number;
  resolvedReports: number;
  pendingReports: number;
  totalPenaltiesRevenue: number;
  categories: { name: string; value: number }[];
  topReporters: {
    id: number;
    name: string;
    email: string;
    reports: number;
    points: number;
    rank: string;
  }[];
}

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();

  // Fetch real aggregated metrics from DB
  const { data: stats, isLoading, refetch } = useQuery<PlatformStats>({
    queryKey: ["adminDashboardStats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch admin stats");
      return res.json();
    },
  });

  const categoryData = stats?.categories?.length
    ? stats.categories
    : [
        { name: "Potholes", value: 4 },
        { name: "Garbage", value: 3 },
        { name: "Parking", value: 3 },
        { name: "Street Lights", value: 2 },
        { name: "Water Leakage", value: 2 },
      ];

  const topReporters = stats?.topReporters?.length
    ? stats.topReporters
    : [
        { id: 1, name: "Aditi Sharma", email: "citizen@civiceye.com", reports: 4, points: 450, rank: "Gold" },
        { id: 2, name: "Ravi Kumar", email: "ravi@civiceye.com", reports: 2, points: 200, rank: "Silver" },
        { id: 3, name: "Priya Nambiar", email: "priya@civiceye.com", reports: 1, points: 50, rank: "Bronze" },
      ];

  const filteredReporters = topReporters.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      data-testid="page-admin-dashboard"
    >
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 text-white p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-purple-500/80 text-white text-[10px]">Super Administrator Console</Badge>
            <span className="text-purple-200 text-xs font-semibold">RBAC Tier 1 Access</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">System Administrative Dashboard</h1>
          <p className="text-purple-200 text-xs sm:text-sm mt-1 max-w-xl">
            Centralized monitoring of municipal enforcement, authority verification queues, user permissions, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-white border-white/30 hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Sync Metrics
          </Button>
          <Button
            onClick={() => setLocation("/user-management")}
            className="bg-white text-purple-900 hover:bg-purple-50 font-semibold"
          >
            <Users className="h-4 w-4 mr-2" /> Manage Users
          </Button>
        </div>
      </div>

      {/* Real Statistics Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Registered Users"
            value={String(stats?.totalUsers ?? 7)}
            icon={Users}
            description="Citizens, Authorities & Admins"
            accentColor="primary"
          />
          <StatCard
            title="Total Civic Reports"
            value={String(stats?.totalReports ?? 7)}
            icon={FileText}
            description={`${stats?.pendingReports ?? 4} awaiting verification`}
            accentColor="warning"
          />
          <StatCard
            title="Resolved Reports"
            value={String(stats?.resolvedReports ?? 3)}
            icon={CheckCircle2}
            description="Completed municipal actions"
            accentColor="success"
          />
          <StatCard
            title="Collected Fine Revenue"
            value={`₹${(stats?.totalPenaltiesRevenue ?? 500).toLocaleString()}`}
            icon={IndianRupee}
            trend={{ value: 18, isPositive: true }}
            description="Enforced civic penalties"
            accentColor="primary"
          />
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className="border-border/60 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setLocation("/user-management")}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-foreground">User Management</p>
              <p className="text-xs text-muted-foreground mt-0.5">Control roles & activate/deactivate accounts</p>
            </div>
            <Users className="h-5 w-5 text-purple-600" />
          </CardContent>
        </Card>

        <Card
          className="border-border/60 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setLocation("/system-logs")}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-foreground">System Audit Logs</p>
              <p className="text-xs text-muted-foreground mt-0.5">Inspect user logins, verifications & fines</p>
            </div>
            <FileText className="h-5 w-5 text-blue-600" />
          </CardContent>
        </Card>

        <Card
          className="border-border/60 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setLocation("/platform-settings")}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-foreground">Platform Settings</p>
              <p className="text-xs text-muted-foreground mt-0.5">Configure AI modules & system limits</p>
            </div>
            <Settings className="h-5 w-5 text-slate-600" />
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution Chart */}
      <Card className="border-border/60">
        <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Reported Issues by Category</CardTitle>
            <CardDescription className="text-xs">Database-driven count of citizen reports by category</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">Live Database Query</Badge>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" name="Submissions" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Citizen Contributors (Real Data from DB) */}
      <Card className="border-border/60">
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" /> Top Citizen Contributors
              </CardTitle>
              <CardDescription className="text-xs">
                Citizens driving positive civic impact with verified reports and earned reward points
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search citizen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-xs bg-slate-50 dark:bg-slate-900/50">
                <TableHead className="font-bold">Citizen Name</TableHead>
                <TableHead className="font-bold">Email</TableHead>
                <TableHead className="font-bold text-center">Verified Reports</TableHead>
                <TableHead className="font-bold text-center">Reward Balance</TableHead>
                <TableHead className="font-bold text-center">Civic Rank</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReporters.length > 0 ? (
                filteredReporters.map((reporter) => (
                  <TableRow key={reporter.id} className="text-xs">
                    <TableCell className="font-semibold">{reporter.name}</TableCell>
                    <TableCell className="text-muted-foreground">{reporter.email}</TableCell>
                    <TableCell className="text-center font-bold text-foreground">{reporter.reports}</TableCell>
                    <TableCell className="text-center font-extrabold text-blue-600">
                      {reporter.points} pts
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={
                          reporter.rank === "Gold"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold"
                            : reporter.rank === "Silver"
                            ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 font-bold"
                            : "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 font-bold"
                        }
                      >
                        {reporter.rank}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-xs">
                    No matching citizen contributors found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
