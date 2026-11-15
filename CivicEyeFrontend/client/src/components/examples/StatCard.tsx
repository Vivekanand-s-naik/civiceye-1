import { StatCard } from "../stat-card";
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-8">
      <StatCard
        title="Total Issues"
        value="1,234"
        icon={AlertCircle}
        description="All time"
        accentColor="primary"
      />
      <StatCard
        title="Resolved"
        value="856"
        icon={CheckCircle}
        trend={{ value: 12, isPositive: true }}
        description="This month"
        accentColor="success"
      />
      <StatCard
        title="Pending"
        value="245"
        icon={Clock}
        description="Awaiting action"
        accentColor="warning"
      />
      <StatCard
        title="Violations"
        value="133"
        icon={AlertTriangle}
        trend={{ value: 5, isPositive: false }}
        description="This month"
        accentColor="danger"
      />
    </div>
  );
}
