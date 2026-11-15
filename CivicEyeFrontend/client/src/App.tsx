import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bell, Shield, User, Users, LogOut, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

// Public Pages
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/auth";

// Citizen Pages
import CitizenDashboard from "@/pages/citizen/CitizenDashboard";
import ReportIssuePage from "@/pages/report-issue";
import MyReportsPage from "@/pages/citizen/MyReportsPage";
import RewardWallet from "@/pages/citizen/RewardWallet";
import CitizenNotifications from "@/pages/citizen/CitizenNotifications";
import SupportCenter from "@/pages/citizen/SupportCenter";

// Authority Pages
import AuthorityDashboard from "@/pages/authority/AuthorityDashboard";
import VerifyReport from "@/pages/authority/VerifyReport";
import ViolatorDetection from "@/pages/authority/ViolatorDetection";
import PenaltyManagement from "@/pages/authority/PenaltyManagement";
import MapView from "@/pages/authority/MapView";
import AIInsights from "@/pages/authority/AIInsights";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import SystemLogs from "@/pages/admin/SystemLogs";
import PlatformSettings from "@/pages/admin/PlatformSettings";

// 404
import NotFound from "@/pages/not-found";

export type UserRole = "citizen" | "authority" | "admin";

// ================= RBAC Protected Route =================
interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  component: React.ComponentType<any>;
}

function ProtectedRoute({ allowedRoles, component: Component }: ProtectedRouteProps) {
  const { currentUser, isLoggedIn } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const userRole = (currentUser?.role?.toLowerCase() as UserRole) || null;

  useEffect(() => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this portal.",
        variant: "destructive",
      });
      setLocation("/getStarted");
    } else if (userRole && !allowedRoles.includes(userRole)) {
      toast({
        title: "Access Restricted (RBAC)",
        description: `This page requires ${allowedRoles.join(" or ")} privileges. You are logged in as ${userRole.toUpperCase()}.`,
        variant: "destructive",
      });
      // Redirect to user's authorized home dashboard
      if (userRole === "authority") {
        setLocation("/authority-dashboard");
      } else if (userRole === "admin") {
        setLocation("/admin-dashboard");
      } else {
        setLocation("/citizen-dashboard");
      }
    }
  }, [isLoggedIn, userRole, allowedRoles, setLocation, toast]);

  if (!isLoggedIn || !userRole || !allowedRoles.includes(userRole)) {
    return null;
  }

  return (
    <DashboardLayout role={userRole}>
      <Component />
    </DashboardLayout>
  );
}

// ================= Dashboard Layout =================
function DashboardLayout({
  role,
  children,
}: {
  role: UserRole;
  children?: React.ReactNode;
}) {
  const { currentUser, logout, setCurrentUser } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  };

  const getRoleBadge = () => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs">ADMINISTRATOR</Badge>;
      case "authority":
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">AUTHORITY OFFICER</Badge>;
      default:
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">VERIFIED CITIZEN</Badge>;
    }
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full bg-slate-50/50 dark:bg-slate-950">
        <AppSidebar
          role={role}
          userName={currentUser?.fullName || "CivicEye User"}
          userEmail={currentUser?.email || "user@civiceye.com"}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Global Header */}
          <header className="flex items-center justify-between gap-4 px-6 py-3 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-2">
                {getRoleBadge()}
                {currentUser?.zone && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-medium">
                    {currentUser.zone}
                  </span>
                )}
              </div>
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center gap-3">
              {/* Notification icon */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/notifications")}
                className="relative"
                title="View Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
              </Button>

              <ThemeToggle />

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l">
                <div className="hidden md:block text-right">
                  <p className="text-xs font-semibold leading-none">{currentUser?.fullName || "User"}</p>
                  <p className="text-[10px] text-muted-foreground leading-none mt-1">{currentUser?.email || ""}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    setLocation("/");
                  }}
                  className="text-xs gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// ================= Main App Component =================
function MainRouter() {
  const [, setLocation] = useLocation();

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/getStarted">
        <AuthPage
          onLogin={(role) => {
            setLocation(`/${role}-dashboard`);
          }}
        />
      </Route>

      {/* Citizen Protected Routes */}
      <Route path="/citizen-dashboard">
        <ProtectedRoute allowedRoles={["citizen", "admin"]} component={CitizenDashboard} />
      </Route>
      <Route path="/report">
        <ProtectedRoute allowedRoles={["citizen", "admin"]} component={ReportIssuePage} />
      </Route>
      <Route path="/my-reports">
        <ProtectedRoute allowedRoles={["citizen", "admin"]} component={MyReportsPage} />
      </Route>
      <Route path="/rewards">
        <ProtectedRoute allowedRoles={["citizen", "admin"]} component={RewardWallet} />
      </Route>
      <Route path="/notifications">
        <ProtectedRoute allowedRoles={["citizen", "authority", "admin"]} component={CitizenNotifications} />
      </Route>
      <Route path="/support">
        <ProtectedRoute allowedRoles={["citizen", "admin"]} component={SupportCenter} />
      </Route>

      {/* Authority Protected Routes */}
      <Route path="/authority-dashboard">
        <ProtectedRoute allowedRoles={["authority", "admin"]} component={AuthorityDashboard} />
      </Route>
      <Route path="/verify-report">
        <ProtectedRoute allowedRoles={["authority", "admin"]} component={VerifyReport} />
      </Route>
      <Route path="/violator-detection">
        <ProtectedRoute allowedRoles={["authority", "admin"]} component={ViolatorDetection} />
      </Route>
      <Route path="/penalty-management">
        <ProtectedRoute allowedRoles={["authority", "admin"]} component={PenaltyManagement} />
      </Route>
      <Route path="/map-view">
        <ProtectedRoute allowedRoles={["authority", "admin", "citizen"]} component={MapView} />
      </Route>
      <Route path="/ai-insights">
        <ProtectedRoute allowedRoles={["authority", "admin"]} component={AIInsights} />
      </Route>

      {/* Admin Protected Routes */}
      <Route path="/admin-dashboard">
        <ProtectedRoute allowedRoles={["admin"]} component={AdminDashboard} />
      </Route>
      <Route path="/user-management">
        <ProtectedRoute allowedRoles={["admin"]} component={UserManagement} />
      </Route>
      <Route path="/system-logs">
        <ProtectedRoute allowedRoles={["admin"]} component={SystemLogs} />
      </Route>
      <Route path="/platform-settings">
        <ProtectedRoute allowedRoles={["admin"]} component={PlatformSettings} />
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="civiceye-theme">
        <TooltipProvider>
          <UserProvider>
            <MainRouter />
            <ToastContainer />
            <Toaster />
          </UserProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
