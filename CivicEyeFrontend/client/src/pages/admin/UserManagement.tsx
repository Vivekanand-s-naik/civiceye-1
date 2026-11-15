import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Search, UserCheck, UserX, Shield, User, Users, RefreshCw, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DBUser {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  zone?: string;
  phone_number?: string;
  reports_count?: number;
  created_at?: string;
}

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all users from real DB
  const { data: users = [], isLoading, refetch } = useQuery<DBUser[]>({
    queryKey: ["adminUsersList"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  // Toggle user active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsersList"] });
      toast({
        title: "User Status Updated",
        description: `Account is now ${updated.is_active ? "Active" : "Deactivated"}`,
      });
    },
  });

  // Change user role mutation
  const changeRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to change role");
      return res.json();
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsersList"] });
      toast({
        title: "User Role Updated (RBAC)",
        description: `Role changed to ${updated.role.toUpperCase()}`,
      });
    },
  });

  const filtered = users.filter((u) => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.zone || "").toLowerCase().includes(search.toLowerCase());

    if (roleFilter === "ALL") return matchesSearch;
    return matchesSearch && u.role.toLowerCase() === roleFilter.toLowerCase();
  });

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs">ADMIN</Badge>;
      case "authority":
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">AUTHORITY</Badge>;
      default:
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">CITIZEN</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">User Access & Role Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Role-Based Access Control (RBAC): Inspect user identities, toggle status, and grant elevated privileges
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh Users
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user name, email, or zone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="flex items-center gap-2">
            {["ALL", "citizen", "authority", "admin"].map((r) => (
              <Button
                key={r}
                variant={roleFilter === r ? "default" : "outline"}
                size="sm"
                onClick={() => setRoleFilter(r)}
                className={`text-xs h-8 capitalize ${roleFilter === r ? "bg-blue-600 text-white" : ""}`}
              >
                {r}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u) => (
            <Card key={u.id} className="hover:shadow-md transition-shadow border rounded-xl overflow-hidden flex flex-col">
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base font-bold">{u.name}</CardTitle>
                  <CardDescription className="text-xs mt-0.5">{u.email}</CardDescription>
                </div>
                {getRoleBadge(u.role)}
              </CardHeader>

              <CardContent className="p-4 pt-1 space-y-3 text-xs flex-1 flex flex-col justify-between">
                <div className="space-y-1.5 pt-1 text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account Status:</span>
                    <span className={u.active ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>
                      {u.active ? "Active ✅" : "Deactivated ❌"}
                    </span>
                  </div>
                  {u.zone && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Assigned Zone:</span>
                      <span className="font-semibold text-foreground">{u.zone}</span>
                    </div>
                  )}
                  {u.phone_number && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{u.phone_number}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Reports Logged:</span>
                    <span className="font-semibold text-blue-600">{u.reports_count || 0}</span>
                  </div>
                </div>

                {/* Actions: Change Role & Toggle Status */}
                <div className="pt-3 border-t flex items-center justify-between gap-2">
                  <div className="w-32">
                    <Select
                      defaultValue={u.role.toLowerCase()}
                      onValueChange={(newRole) => changeRoleMutation.mutate({ id: u.id, role: newRole })}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="citizen">Citizen</SelectItem>
                        <SelectItem value="authority">Authority</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    size="sm"
                    variant={u.active ? "outline" : "default"}
                    onClick={() => toggleActiveMutation.mutate({ id: u.id, active: u.active })}
                    className={`text-xs h-7 ${
                      u.active
                        ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {u.active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 border-dashed">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-semibold">No Users Found</h3>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search criteria</p>
        </Card>
      )}
    </div>
  );
}
