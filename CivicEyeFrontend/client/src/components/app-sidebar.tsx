import {
  Sidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Home,
  FileText,
  Award,
  Bell,
  Map,
  Users,
  Shield,
  BarChart3,
  Settings,
  LogOut,
  HelpCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useLocation } from "wouter";
import type { LucideIcon } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Badge } from "@/components/ui/badge";

interface SidebarItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

interface AppSidebarProps {
  role?: "citizen" | "authority" | "admin";
  userName?: string;
  userEmail?: string;
}

export function AppSidebar({ role, userName, userEmail }: AppSidebarProps) {
  const [location, setLocation] = useLocation();
  const { currentUser, logout } = useUser();

  const activeRole = role || (currentUser?.role as any) || "citizen";
  const name = userName || currentUser?.fullName || "Citizen User";
  const email = userEmail || currentUser?.email || "user@civiceye.com";

  const roleItems: Record<string, SidebarItem[]> = {
    citizen: [
      { title: "Citizen Home", href: "/citizen-dashboard", icon: Home },
      { title: "Report Issue", href: "/report", icon: AlertCircle },
      { title: "My Reports", href: "/my-reports", icon: FileText },
      { title: "Reward Wallet", href: "/rewards", icon: Award },
      { title: "Notifications", href: "/notifications", icon: Bell },
      { title: "Support Center", href: "/support", icon: HelpCircle },
    ],
    authority: [
      { title: "Authority Overview", href: "/authority-dashboard", icon: Home },
      { title: "Verify Reports", href: "/verify-report", icon: Shield },
      { title: "Violator AI Detection", href: "/violator-detection", icon: Users },
      { title: "Penalty Enforcement", href: "/penalty-management", icon: FileText },
      { title: "City Violation Map", href: "/map-view", icon: Map },
      { title: "AI Analytics & Hotspots", href: "/ai-insights", icon: BarChart3 },
    ],
    admin: [
      { title: "Admin Console", href: "/admin-dashboard", icon: Home },
      { title: "User Management", href: "/user-management", icon: Users },
      { title: "System Audit Logs", href: "/system-logs", icon: FileText },
      { title: "Platform Settings", href: "/platform-settings", icon: Settings },
      // Admin audit view into other dashboards
      { title: "Review Reports (Audit)", href: "/verify-report", icon: Shield },
      { title: "City Map View", href: "/map-view", icon: Map },
    ],
  };

  const items = roleItems[activeRole] ?? roleItems.citizen;

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const getRoleBadgeColor = () => {
    switch (activeRole) {
      case "admin":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-300";
      case "authority":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300";
      default:
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300";
    }
  };

  return (
    <Sidebar className="border-r border-border/60">
      {/* Brand Header */}
      <div className="p-4 border-b border-border/60 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 font-bold text-lg text-primary tracking-tight">
          <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Eye className="h-4 w-4" />
          </div>
          <span>Civic<span className="text-blue-600">Eye</span></span>
        </a>
        <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${getRoleBadgeColor()}`}>
          {activeRole}
        </Badge>
      </div>

      {/* User Info Bar */}
      <SidebarGroup className="py-2">
        <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-4">
          Logged-In Profile
        </SidebarGroupLabel>
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg mx-2 my-1 border border-border/40">
          <p className="text-sm font-semibold truncate text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground truncate">{email}</p>
          {currentUser?.aadharNumber && (
            <p className="text-[10px] text-muted-foreground/80 mt-1">
              Aadhaar: {currentUser.aadharNumber}
            </p>
          )}
        </div>
      </SidebarGroup>

      {/* Navigation Menu */}
      <SidebarGroup className="flex-1 py-1">
        <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-4">
          Navigation
        </SidebarGroupLabel>
        <SidebarGroupContent className="px-2">
          <SidebarMenu>
            {items.map((item) => {
              const isActive = location === item.href;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        setLocation(item.href);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                      }`}
                    >
                      <item.icon className={`h-4 w-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Account Section */}
      <SidebarGroup className="border-t border-border/60 pt-2 pb-4">
        <SidebarGroupContent className="px-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="h-4 w-4 text-red-600" />
                  <span>Sign Out</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </Sidebar>
  );
}
