import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function PlatformSettings() {
  const [activeTab, setActiveTab] = useState<"modules" | "notifications" | "system">("modules");
  const [settings, setSettings] = useState({
    aiModule: true,
    penaltyModule: true,
    notifications: true,
    maxReportsPerDay: 5,
    rewardPercentage: 10,
    systemMaintenance: false,
  });
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key: keyof typeof settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    setShowConfirm(false);
    // Simulate API call
    setTimeout(() => {
      console.log("Saved settings:", settings);
      alert("Platform settings saved successfully!");
    }, 1000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "modules":
        return (
          <Card className="space-y-4">
            <CardHeader>
              <CardTitle>Module Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-3">
                <p>AI Module</p>
                <Switch checked={settings.aiModule} onCheckedChange={() => handleToggle("aiModule")} />
              </div>
              <div className="flex justify-between items-center mb-3">
                <p>Penalty Module</p>
                <Switch checked={settings.penaltyModule} onCheckedChange={() => handleToggle("penaltyModule")} />
              </div>
            </CardContent>
          </Card>
        );
      case "notifications":
        return (
          <Card className="space-y-4">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-3">
                <p>Enable Notifications</p>
                <Switch checked={settings.notifications} onCheckedChange={() => handleToggle("notifications")} />
              </div>
              <div className="mb-3">
                <p>Reward Percentage (%)</p>
                <Input
                  type="number"
                  value={settings.rewardPercentage}
                  onChange={(e) => handleChange("rewardPercentage", Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        );
      case "system":
        return (
          <Card className="space-y-4">
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-3">
                <p>Maintenance Mode</p>
                <Switch checked={settings.systemMaintenance} onCheckedChange={() => handleToggle("systemMaintenance")} />
              </div>
              <div className="mb-3">
                <p>Max Reports per Citizen per Day</p>
                <Input
                  type="number"
                  value={settings.maxReportsPerDay}
                  onChange={(e) => handleChange("maxReportsPerDay", Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Platform Settings</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b pb-2">
        <button
          className={`px-4 py-2 font-semibold ${activeTab === "modules" ? "border-b-2 border-indigo-600" : ""}`}
          onClick={() => setActiveTab("modules")}
        >
          Modules
        </button>
        <button
          className={`px-4 py-2 font-semibold ${activeTab === "notifications" ? "border-b-2 border-indigo-600" : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          Notifications
        </button>
        <button
          className={`px-4 py-2 font-semibold ${activeTab === "system" ? "border-b-2 border-indigo-600" : ""}`}
          onClick={() => setActiveTab("system")}
        >
          System
        </button>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Save Button */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogTrigger asChild>
          <Button className="bg-indigo-600 text-white mt-4" onClick={() => setShowConfirm(true)}>
            Save Settings
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Save</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to save these platform settings?</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button className="bg-indigo-600 text-white" onClick={saveSettings}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
