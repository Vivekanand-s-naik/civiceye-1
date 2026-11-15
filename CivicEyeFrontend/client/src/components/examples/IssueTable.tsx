import { IssueTable } from "../issue-table";

export default function IssueTableExample() {
  const mockIssues = [
    {
      id: "1",
      title: "Broken Streetlight on Main St",
      category: "Street Light",
      location: "Main St & 5th Ave",
      status: "open" as const,
      date: "2 days ago",
      reporter: "John Doe",
    },
    {
      id: "2",
      title: "Pothole on Highway 101",
      category: "Road Damage",
      location: "Highway 101, Mile 42",
      status: "inprogress" as const,
      date: "5 days ago",
      reporter: "Jane Smith",
    },
    {
      id: "3",
      title: "Garbage Overflow",
      category: "Garbage",
      location: "Central Park Entrance",
      status: "resolved" as const,
      date: "1 week ago",
      reporter: "Bob Wilson",
    },
  ];

  return (
    <div className="p-8">
      <IssueTable
        issues={mockIssues}
        onView={(id) => console.log("View issue:", id)}
        onResolve={(id) => console.log("Resolve issue:", id)}
      />
    </div>
  );
}
