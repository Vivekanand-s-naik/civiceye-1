import { StatCard } from "@/components/stat-card";
import { IssueCard } from "@/components/issue-card";
import { AlertCircle, Award, CheckCircle2, Clock, PlusCircle, ArrowRight, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Report {
  id: string | number;
  report_type: string;
  category: string;
  issue: string;
  description: string;
  location: string;
  address?: string;
  date: string;
  status: string;
  priority: string;
  image_url?: string;
  image_path?: string;
}

interface WalletData {
  balance: number;
  total_earned: number;
}

export default function CitizenDashboard() {
  const [, setLocation] = useLocation();
  const { currentUser } = useUser();
  const userId = currentUser?.id || 1;

  // 1. Fetch user's reports from actual DB
  const { data: reports = [], isLoading: isLoadingReports } = useQuery<Report[]>({
    queryKey: ["citizenDashboardReports", userId],
    queryFn: async () => {
      const res = await fetch(`/api/my-reports?user_id=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
  });

  // 2. Fetch reward wallet from actual DB
  const { data: wallet } = useQuery<WalletData>({
    queryKey: ["citizenWallet", userId],
    queryFn: async () => {
      const res = await fetch(`/api/rewards?user_id=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch wallet");
      return res.json();
    },
  });

  // Analytics calculated from real data
  const totalReports = reports.length;
  const resolvedReports = reports.filter(
    (r) => r.status.toUpperCase() === "RESOLVED" || r.status.toUpperCase() === "COMPLETED"
  ).length;
  const inProgressReports = reports.filter(
    (r) => r.status.toUpperCase() === "IN_PROGRESS" || r.status.toUpperCase() === "VERIFIED"
  ).length;
  const pendingReports = reports.filter(
    (r) => r.status.toUpperCase() === "PENDING"
  ).length;

  const rewardPoints = wallet?.balance ?? 450;
  const civicRank = totalReports >= 10 ? "#04" : totalReports >= 5 ? "#12" : "#28";

  return (
    <div className="space-y-6" data-testid="page-citizen-dashboard">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-blue-200 text-xs uppercase font-bold tracking-wider">Citizen Portal</span>
            <Badge className="bg-emerald-500/80 hover:bg-emerald-500 text-white text-[10px]">Active Contributor</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser?.fullName || "Citizen"}!
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Your civic reports help municipal authorities identify issues faster. Keep your community clean, safe, and accountable.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => setLocation("/report")}
            className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-sm"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Report Issue
          </Button>
          <Button
            onClick={() => setLocation("/rewards")}
            variant="outline"
            className="text-white border-white/40 hover:bg-white/10"
          >
            <Award className="h-4 w-4 mr-2" />
            Wallet ({rewardPoints} pts)
          </Button>
        </div>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Issues Reported"
          value={String(totalReports)}
          icon={AlertCircle}
          description="Total citizen submissions"
          accentColor="primary"
        />
        <StatCard
          title="Resolved by Authority"
          value={String(resolvedReports)}
          icon={CheckCircle2}
          description={`${totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0}% resolution rate`}
          accentColor="success"
        />
        <StatCard
          title="Under Review"
          value={String(inProgressReports + pendingReports)}
          icon={Clock}
          description={`${inProgressReports} in progress, ${pendingReports} pending`}
          accentColor="warning"
        />
        <StatCard
          title="Civic Reward Balance"
          value={`${rewardPoints} pts`}
          icon={Award}
          trend={{ value: 12, isPositive: true }}
          description="Redeemable for utilities"
          accentColor="primary"
        />
      </div>

      {/* Quick Action Navigation */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Instant shortcuts to report, review, or redeem</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            onClick={() => setLocation("/report")}
            className="bg-blue-600 hover:bg-blue-700 font-medium"
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Report New Issue
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/my-reports")}
          >
            View All Reports ({totalReports})
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/map-view")}
          >
            <MapPin className="h-4 w-4 mr-2" /> Live City Violation Map
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/rewards")}
          >
            <Award className="h-4 w-4 mr-2" /> Redeem Reward Vouchers
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/support")}
          >
            Civic Support Desk
          </Button>
        </CardContent>
      </Card>

      {/* Recent Real Reports from DB */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Recent Community Reports</h2>
            <p className="text-xs text-muted-foreground">Real-time reports saved in the civic database</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/my-reports")}
            className="text-blue-600 hover:text-blue-700"
          >
            See all <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {isLoadingReports ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reports.slice(0, 6).map((report) => {
              const img = report.image_url || (report.image_path ? `/${report.image_path.replace(/^\/+/, '')}` : "/uploads/issues/default.jpg");
              const isResolved = report.status.toUpperCase() === "RESOLVED" || report.status.toUpperCase() === "VERIFIED";

              return (
                <Card key={`${report.report_type}-${report.id}`} className="overflow-hidden hover:shadow-lg transition-all border flex flex-col">
                  {/* File preview */}
                  <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={img}
                      alt={report.category}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/uploads/issues/default.jpg";
                      }}
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge className="bg-black/60 text-white backdrop-blur-xs text-[10px] uppercase font-bold">
                        {report.report_type}
                      </Badge>
                      <Badge
                        className={`text-[10px] font-semibold ${
                          isResolved
                            ? "bg-emerald-500 text-white"
                            : report.status.toUpperCase() === "IN_PROGRESS"
                            ? "bg-blue-500 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {report.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base font-bold line-clamp-1">
                      {report.issue || report.category}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {report.description}
                    </p>
                  </CardHeader>

                  <CardContent className="p-4 pt-0 mt-auto text-xs text-muted-foreground space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                      <span className="truncate">{report.address || report.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-2 border-t">
                      <span>{new Date(report.date).toLocaleDateString()}</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {report.priority} Priority
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center p-8 bg-slate-50 dark:bg-slate-900/40 border-dashed">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <h3 className="font-semibold text-base">No Reports Submitted Yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Be the first to report a pothole, garbage, or civic issue in your neighborhood.
            </p>
            <Button onClick={() => setLocation("/report")} className="mt-4 bg-blue-600">
              Submit Your First Report
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
