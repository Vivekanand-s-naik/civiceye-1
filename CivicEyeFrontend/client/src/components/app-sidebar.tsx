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
} from "lucide-react";
import { useLocation } from "wouter";
import type { LucideIcon } from "lucide-react";

interface SidebarItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface AppSidebarProps {
  role?: "citizen" | "authority" | "admin"; // optional to prevent crash
  userName: string;
  userEmail: string;
}

export function AppSidebar({ role, userName, userEmail }: AppSidebarProps) {
  const [location] = useLocation();

  if (!role) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        <p>Loading sidebar...</p>
      </div>
    );
  }

  const roleItems: Record<string, SidebarItem[]> = {
    citizen: [
      { title: "Dashboard", href: "/citizen-dashboard", icon: Home },
      { title: "Report Issue", href: "/report", icon: FileText },
      { title: "My Reports", href: "/my-reports", icon: FileText },
      { title: "Reward Wallet", href: "/rewards", icon: Award },
      { title: "Notifications", href: "/notifications", icon: Bell },
      { title: "Support Center", href: "/support", icon: Shield },
    ],
    authority: [
      { title: "Dashboard", href: "/authority-dashboard", icon: Home },
      { title: "Verify Reports", href: "/verify-report", icon: Shield },
      { title: "Violator Detection", href: "/violator-detection", icon: Users },
      { title: "Penalty Management", href: "/penalty-management", icon: FileText },
      { title: "Map View", href: "/map-view", icon: Map },
      { title: "AI Insights", href: "/ai-insights", icon: BarChart3 },
    ],
    admin: [
      { title: "Admin Dashboard", href: "/admin-dashboard", icon: Home },
      { title: "User Management", href: "/user-management", icon: Users },
      { title: "System Logs", href: "/system-logs", icon: FileText },
      { title: "Platform Settings", href: "/platform-settings", icon: Settings },
    ],
  };

  const items = roleItems[role] ?? [];

  return (
    <Sidebar>
      {/* User Info */}
      <SidebarGroup>
        <SidebarGroupLabel>
          <div className="p-2">
            <p className="text-sm font-semibold">{userName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </SidebarGroupLabel>

        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a
                    href={item.href}
                    className={`flex items-center gap-2 px-2 py-1 rounded-md transition-colors ${
                      location === item.href
                        ? "bg-primary text-white"
                        : "hover:bg-muted"
                    }`}
                    aria-current={location === item.href ? "page" : undefined}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Account Section */}
      <SidebarGroup>
        <SidebarGroupLabel>Account</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/logout" className="flex items-center gap-2 text-red-500">
                  <LogOut className="h-4 w-4" />
                  Logout
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </Sidebar>
  );
}
