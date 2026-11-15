import { StatusBadge } from "../status-badge";

export default function StatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-4 p-8">
      <StatusBadge status="open" />
      <StatusBadge status="inprogress" />
      <StatusBadge status="resolved" />
      <StatusBadge status="violation" />
    </div>
  );
}
