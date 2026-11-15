import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Settings, Shield, Bell, Cpu, Save, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlatformSettings() {
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    aiModule: true,
    penaltyModule: true,
    notifications: true,
    maxReportsPerDay: 10,
    rewardPercentage: 10,
    systemMaintenance: false,
  });

  // Fetch settings from DB
  const { data: dbSettings, isLoading, refetch } = useQuery({
    queryKey: ["platformSettings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      return res.json();
    },
  });

  useEffect(() => {
    if (dbSettings) {
      setSettings((prev) => ({ ...prev, ...dbSettings }));
    }
  }, [dbSettings]);

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Platform Settings Saved",
        description: "Configuration updated successfully in database.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Save Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key: keyof typeof settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Platform Configuration & Controls</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage global enforcement rules, automated AI modules, and rate limits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Reset
          </Button>
          <Button
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Module Settings */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-600" /> Automated Services & AI Engine
              </CardTitle>
              <CardDescription className="text-xs">
                Toggle core automated intelligence capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <p className="text-sm font-semibold">Gemini AI Category Detection</p>
                  <p className="text-xs text-muted-foreground">Automated image classification on evidence upload</p>
                </div>
                <Switch
                  checked={settings.aiModule}
                  onCheckedChange={() => handleToggle("aiModule")}
                />
              </div>

              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <p className="text-sm font-semibold">Penalty Enforcement Module</p>
                  <p className="text-xs text-muted-foreground">Enable legal notices and fee collections</p>
                </div>
                <Switch
                  checked={settings.penaltyModule}
                  onCheckedChange={() => handleToggle("penaltyModule")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Citizen Notification Alerts</p>
                  <p className="text-xs text-muted-foreground">Send real-time alerts for verification & rewards</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={() => handleToggle("notifications")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Operational Limits */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" /> Operational Thresholds & Limits
              </CardTitle>
              <CardDescription className="text-xs">
                Define citizen submission throttling and reward percentages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5 pb-3 border-b">
                <label className="text-sm font-semibold">Max Reports per Citizen per Day</label>
                <p className="text-xs text-muted-foreground mb-1">Throttles spam and duplicate observations</p>
                <Input
                  type="number"
                  value={settings.maxReportsPerDay}
                  onChange={(e) => handleChange("maxReportsPerDay", Number(e.target.value))}
                  className="max-w-xs h-9"
                />
              </div>

              <div className="space-y-1.5 pb-3 border-b">
                <label className="text-sm font-semibold">Citizen Penalty Reward Share (%)</label>
                <p className="text-xs text-muted-foreground mb-1">Percentage of collected penalty awarded to reporting citizen</p>
                <Input
                  type="number"
                  value={settings.rewardPercentage}
                  onChange={(e) => handleChange("rewardPercentage", Number(e.target.value))}
                  className="max-w-xs h-9"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-600">Maintenance Mode</p>
                  <p className="text-xs text-muted-foreground">Restrict submissions for scheduled database maintenance</p>
                </div>
                <Switch
                  checked={settings.systemMaintenance}
                  onCheckedChange={() => handleToggle("systemMaintenance")}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
