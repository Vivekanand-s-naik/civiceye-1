import { IssueCard } from "@/components/issue-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";

export default function MyReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  //todo: remove mock functionality
  const mockIssues = [
    {
      id: "1",
      title: "Broken Streetlight on Main St",
      description: "The streetlight near the intersection has been out for 3 days.",
      status: "open" as const,
      category: "Street Light",
      location: "Main St & 5th Ave",
      date: "2 days ago",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    },
    {
      id: "2",
      title: "Pothole on Highway 101",
      description: "Large pothole causing traffic issues.",
      status: "inprogress" as const,
      category: "Road Damage",
      location: "Highway 101, Mile 42",
      date: "5 days ago",
    },
    {
      id: "3",
      title: "Garbage Overflow",
      description: "Public bin overflowing, needs immediate attention.",
      status: "resolved" as const,
      category: "Garbage",
      location: "Central Park Entrance",
      date: "1 week ago",
      imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop",
    },
  ];

  const filteredIssues = mockIssues.filter((issue) => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || issue.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" data-testid="page-my-reports">
      <div>
        <h1 className="text-3xl font-bold">My Reports</h1>
        <p className="text-muted-foreground mt-1">
          Track the status of your submitted issue reports
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40" data-testid="select-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="inprogress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredIssues.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No reports found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              {...issue}
              onClick={() => console.log("Issue clicked:", issue.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
