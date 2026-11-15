import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { Brain, TrendingUp, AlertCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockAIData = [
  { name: "Mon", violations: 10, detected: 8 },
  { name: "Tue", violations: 15, detected: 12 },
  { name: "Wed", violations: 12, detected: 11 },
  { name: "Thu", violations: 20, detected: 18 },
  { name: "Fri", violations: 25, detected: 22 },
  { name: "Sat", violations: 18, detected: 16 },
  { name: "Sun", violations: 22, detected: 20 },
];

export default function AIInsights() {
  const [filter, setFilter] = useState("weekly");
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    setInsights([
      { title: "Most Common Violation", value: "Littering (42%)", icon: <AlertCircle className="text-red-500" /> },
      { title: "Predicted Hotspot", value: "Indiranagar", icon: <MapPin className="text-indigo-500" /> },
      { title: "Detection Accuracy", value: "94%", icon: <Brain className="text-green-500" /> },
      { title: "Trend Growth", value: "+12% weekly", icon: <TrendingUp className="text-yellow-500" /> },
      { title: "Unverified Reports", value: "7 pending", icon: <AlertCircle className="text-orange-500" /> },
    ]);

    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, [filter]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">AI Insights & Predictions</h1>
        <Select defaultValue="weekly" onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p>Loading AI insights...</p>
      ) : (
        <>
          {/* Insight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((insight, idx) => (
              <Card key={idx} className="hover:shadow-lg transition">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>{insight.title}</CardTitle>
                  {insight.icon}
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{insight.value}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Detailed analysis and AI prediction for {insight.title.toLowerCase()}.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trend Chart */}
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Weekly Violations vs Detected Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockAIData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="violations" stroke="#EF4444" strokeWidth={3} />
                  <Line type="monotone" dataKey="detected" stroke="#4F46E5" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expandable AI Summary */}
          <Card className="p-6">
            <CardHeader>
              <CardTitle>AI Detailed Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The AI module processed <b>312 reports</b> this week, detecting <b>284 violations</b> with an accuracy
                of <b>94%</b>. Predicted hotspots include Indiranagar and MG Road, while unverified reports are
                pending review. AI insights help authorities prioritize resources efficiently and reduce false
                reports by <b>+18%</b>.
              </p>
              <p>
                Suggested actions based on AI predictions:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Deploy patrols in predicted hotspots</li>
                <li>Verify high-risk unverified reports</li>
                <li>Notify citizens for preventive awareness</li>
                <li>Analyze violation trends to optimize penalties</li>
              </ul>
              <Button className="mt-4 bg-indigo-600 text-white">Export AI Report</Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
