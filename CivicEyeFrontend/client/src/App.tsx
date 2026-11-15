import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { UserProvider } from "@/contexts/UserContext"; // ✅ Add this import

// Pages
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

// ================= Router =================
function Router({ role }: { role: UserRole }) {
  return (
    <Switch>
      {/* Citizen Routes */}
      {role === "citizen" && (
        <>
          <Route path="/citizen-dashboard" component={CitizenDashboard} />
          <Route path="/report" component={ReportIssuePage} />
          <Route path="/my-reports" component={MyReportsPage} />
          <Route path="/rewards" component={RewardWallet} />
          <Route path="/notifications" component={CitizenNotifications} />
          <Route path="/support" component={SupportCenter} />
        </>
      )}

      {/* Authority Routes */}
      {role === "authority" && (
        <>
          <Route path="/authority-dashboard" component={AuthorityDashboard} />
          <Route path="/verify-report" component={VerifyReport} />
          <Route path="/violator-detection" component={ViolatorDetection} />
          <Route path="/penalty-management" component={PenaltyManagement} />
          <Route path="/map-view" component={MapView} />
          <Route path="/ai-insights" component={AIInsights} />
        </>
      )}

      {/* Admin Routes */}
      {role === "admin" && (
        <>
          <Route path="/admin-dashboard" component={AdminDashboard} />
          <Route path="/user-management" component={UserManagement} />
          <Route path="/system-logs" component={SystemLogs} />
          <Route path="/platform-settings" component={PlatformSettings} />
        </>
      )}

      {/* Fallback 404 */}
      <Route component={NotFound} />
    </Switch>
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
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar
          role={role}
          userName="John Doe"
          userEmail="john@example.com"
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between gap-4 p-4 border-b">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="relative hidden md:block w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search issues..." className="pl-9" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <ThemeToggle />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// ================= App =================
export default function App() {
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    // Initialize from localStorage or sessionStorage
    const stored = localStorage.getItem("userRole");
    return stored ? (stored as UserRole) : null;
  });
  const [location, setLocation] = useLocation();

  // Persist role to localStorage
  useEffect(() => {
    if (userRole) {
      localStorage.setItem("userRole", userRole);
    } else {
      localStorage.removeItem("userRole");
    }
  }, [userRole]);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    // Navigate to role-specific dashboard
    const dashboardPath = `/${role}-dashboard`;
    setLocation(dashboardPath);
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem("userRole");
    setLocation("/");
  };

  const isPublicRoute = location === "/" || location.startsWith("/getStarted");

  // Protected routes - redirect to login if not authenticated
  const isProtectedRoute = !isPublicRoute && location !== "/";

  if (isProtectedRoute && !userRole) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="civiceye-theme">
          <TooltipProvider>
            <UserProvider> {/* ✅ Add UserProvider here too */}
              <Redirect to="/getStarted" />
              <ToastContainer />
              <Toaster />
            </UserProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="civiceye-theme">
        <TooltipProvider>
          <UserProvider> {/* ✅ Wrap everything with UserProvider */}
            <Switch>
              {/* Public Routes */}
              <Route path="/" component={LandingPage} />
              <Route path="/getStarted">
                <AuthPage onLogin={handleLogin} />
              </Route>

              {/* Protected Routes - Only render if userRole exists */}
              {userRole && (
                <>
                  {/* Citizen Routes */}
                  {userRole === "citizen" && (
                    <>
                      <Route path="/citizen-dashboard">
                        <DashboardLayout role={userRole}>
                          <CitizenDashboard />
                        </DashboardLayout>
                      </Route>
                      <Route path="/report">
                        <DashboardLayout role={userRole}>
                          <ReportIssuePage />
                        </DashboardLayout>
                      </Route>
                      <Route path="/my-reports">
                        <DashboardLayout role={userRole}>
                          <MyReportsPage />
                        </DashboardLayout>
                      </Route>
                      <Route path="/rewards">
                        <DashboardLayout role={userRole}>
                          <RewardWallet />
                        </DashboardLayout>
                      </Route>
                      <Route path="/notifications">
                        <DashboardLayout role={userRole}>
                          <CitizenNotifications />
                        </DashboardLayout>
                      </Route>
                      <Route path="/support">
                        <DashboardLayout role={userRole}>
                          <SupportCenter />
                        </DashboardLayout>
                      </Route>
                    </>
                  )}

                  {/* Authority Routes */}
                  {userRole === "authority" && (
                    <>
                      <Route path="/authority-dashboard">
                        <DashboardLayout role={userRole}>
                          <AuthorityDashboard />
                        </DashboardLayout>
                      </Route>
                      <Route path="/verify-report">
                        <DashboardLayout role={userRole}>
                          <VerifyReport />
                        </DashboardLayout>
                      </Route>
                      <Route path="/violator-detection">
                        <DashboardLayout role={userRole}>
                          <ViolatorDetection />
                        </DashboardLayout>
                      </Route>
                      <Route path="/penalty-management">
                        <DashboardLayout role={userRole}>
                          <PenaltyManagement />
                        </DashboardLayout>
                      </Route>
                      <Route path="/map-view">
                        <DashboardLayout role={userRole}>
                          <MapView />
                        </DashboardLayout>
                      </Route>
                      <Route path="/ai-insights">
                        <DashboardLayout role={userRole}>
                          <AIInsights />
                        </DashboardLayout>
                      </Route>
                    </>
                  )}

                  {/* Admin Routes */}
                  {userRole === "admin" && (
                    <>
                      <Route path="/admin-dashboard">
                        <DashboardLayout role={userRole}>
                          <AdminDashboard />
                        </DashboardLayout>
                      </Route>
                      <Route path="/user-management">
                        <DashboardLayout role={userRole}>
                          <UserManagement />
                        </DashboardLayout>
                      </Route>
                      <Route path="/system-logs">
                        <DashboardLayout role={userRole}>
                          <SystemLogs />
                        </DashboardLayout>
                      </Route>
                      <Route path="/platform-settings">
                        <DashboardLayout role={userRole}>
                          <PlatformSettings />
                        </DashboardLayout>
                      </Route>
                    </>
                  )}
                </>
              )}

              {/* 404 Fallback */}
              <Route component={NotFound} />
            </Switch>

            <ToastContainer />
            <Toaster />
          </UserProvider> {/* ✅ Close UserProvider here */}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}