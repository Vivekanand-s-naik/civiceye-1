// import { StatCard } from "@/components/stat-card";
// import { IssueCard } from "@/components/issue-card";
// import { AlertCircle, Award, FileText, TrendingUp } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// export default function CitizenDashboard() {
//   //todo: remove mock functionality
//   const mockIssues = [
//     {
//       id: "1",
//       title: "Broken Streetlight on Main St",
//       description: "The streetlight near the intersection has been out for 3 days.",
//       status: "open" as const,
//       category: "Street Light",
//       location: "Main St & 5th Ave",
//       date: "2 days ago",
//       imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
//     },
//     {
//       id: "2",
//       title: "Pothole on Highway 101",
//       description: "Large pothole causing traffic issues.",
//       status: "inprogress" as const,
//       category: "Road Damage",
//       location: "Highway 101, Mile 42",
//       date: "5 days ago",
//       imageUrl: "https://www.holcim.co.uk/sites/uk/files/styles/overlap_teaser_no_overlapping_extra/public/img/ss_pothole_wet.webp?h=502e75fa&itok=Cns6mewk",
//     },
//     {
//       id: "3",
//       title: "Water Leakage Near Manglore",
//       description: "Water Leakage Near Manglore. Leading to water overflow",
//       status: "inprogress" as const,
//       category: "Water Leakage",
//       location: "Highway 100, Mile 55",
//       date: "8 days ago",
//       imageUrl: "https://www.sunbeltrentals.co.uk/media/wf4mj4xs/water-leakage-image-adobestock_53692171-1.jpeg?width=460&height=356.8709677419355",
//     },
//   ];

//   return (
//     <div className="space-y-6" data-testid="page-citizen-dashboard">
//       <div>
//         <h1 className="text-3xl font-bold">Welcome back, Citizen!</h1>
//         <p className="text-muted-foreground mt-1">
//           Track your reports and make a difference in your community
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard
//           title="Issues Reported"
//           value="12"
//           icon={AlertCircle}
//           description="Total reports"
//           accentColor="primary"
//         />
//         <StatCard
//           title="Resolved Issues"
//           value="8"
//           icon={FileText}
//           description="Successfully resolved"
//           accentColor="success"
//         />
//         <StatCard
//           title="Reward Points"
//           value="450"
//           icon={Award}
//           trend={{ value: 15, isPositive: true }}
//           description="This month"
//           accentColor="warning"
//         />
//         <StatCard
//           title="Civic Rank"
//           value="#23"
//           icon={TrendingUp}
//           description="In your area"
//           accentColor="primary"
//         />
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Quick Actions</CardTitle>
//           <CardDescription>Common tasks at your fingertips</CardDescription>
//         </CardHeader>
//         <CardContent className="flex flex-wrap gap-3">
//           <Button data-testid="button-report-new">Report New Issue</Button>
//           <Button variant="outline" data-testid="button-view-reports">View My Reports</Button>
//           <Button variant="outline" data-testid="button-rewards">Check Rewards</Button>
//         </CardContent>
//       </Card>

//       <div>
//         <h2 className="text-2xl font-semibold mb-4">My Recent Reports</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {mockIssues.map((issue) => (
//             <IssueCard
//               key={issue.id}
//               {...issue}
//               onClick={() => console.log("Issue clicked:", issue.id)}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }


import { StatCard } from "@/components/stat-card";
import { IssueCard } from "@/components/issue-card";
import { AlertCircle, Award, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter"; // ✅ Import from wouter

export default function CitizenDashboard() {
  const [location, setLocation] = useLocation(); 
  
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
      imageUrl: "https://www.holcim.co.uk/sites/uk/files/styles/overlap_teaser_no_overlapping_extra/public/img/ss_pothole_wet.webp?h=502e75fa&itok=Cns6mewk",
    },
    {
      id: "3",
      title: "Water Leakage Near Manglore",
      description: "Water Leakage Near Manglore. Leading to water overflow",
      status: "inprogress" as const,
      category: "Water Leakage",
      location: "Highway 100, Mile 55",
      date: "8 days ago",
      imageUrl: "https://www.sunbeltrentals.co.uk/media/wf4mj4xs/water-leakage-image-adobestock_53692171-1.jpeg?width=460&height=356.8709677419355",
    },
  ];

  return (
    <div className="space-y-6" data-testid="page-citizen-dashboard">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, Citizen!</h1>
        <p className="text-muted-foreground mt-1">
          Track your reports and make a difference in your community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Issues Reported"
          value="12"
          icon={AlertCircle}
          description="Total reports"
          accentColor="primary"
        />
        <StatCard
          title="Resolved Issues"
          value="8"
          icon={FileText}
          description="Successfully resolved"
          accentColor="success"
        />
        <StatCard
          title="Reward Points"
          value="450"
          icon={Award}
          trend={{ value: 15, isPositive: true }}
          description="This month"
          accentColor="warning"
        />
        <StatCard
          title="Civic Rank"
          value="#23"
          icon={TrendingUp}
          description="In your area"
          accentColor="primary"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks at your fingertips</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button 
            data-testid="button-report-new"
            onClick={() => setLocation("/report")} // ✅ Use wouter's setLocation
          >
            Report New Issue
          </Button>
          <Button 
            variant="outline" 
            data-testid="button-view-reports"
            onClick={() => setLocation("/my-reports")} // ✅ Use wouter's setLocation
          >
            View My Reports
          </Button>
          <Button 
            variant="outline" 
            data-testid="button-rewards"
            onClick={() => setLocation("/rewards")} // ✅ Use wouter's setLocation
          >
            Check Rewards
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4">My Recent Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              {...issue}
              onClick={() => console.log("Issue clicked:", issue.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}