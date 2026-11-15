// import { useLocation } from "wouter";
// import { useState, useMemo, useEffect, useCallback } from "react";
// import { StatCard } from "@/components/stat-card";
// import { IssueTable } from "@/components/issue-table";
// import { MapView } from "@/components/map-view";
// import { ChartCard } from "@/components/chart-card";
// import {
//   AlertCircle,
//   CheckCircle,
//   Clock,
//   AlertTriangle,
//   Filter,
//   Download,
//   Search,
//   TrendingUp,
//   BarChart3,
//   Activity,
//   MapPin,
//   Bell,
// } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useToast } from "@/components/ui/use-toast";
// import { saveAs } from "file-saver";
// import * as XLSX from "xlsx";
// // REMOVED: import { useNavigate } from "react-router-dom";

// // TYPES
// type MapMarker = {
//   id: string;
//   position: [number, number];
//   title: string;
//   status: "open" | "inprogress" | "resolved";
//   category: string;
// };

// type Issue = {
//   id: string;
//   title: string;
//   category: string;
//   location: string;
//   status: "open" | "inprogress" | "resolved";
//   date: string;
//   reporter: string;
// };

// // --------------------------------------------------------------------------
// // MAIN DASHBOARD COMPONENT
// // --------------------------------------------------------------------------
// export default function AuthorityDashboard() {
//   const [location, setLocation] = useLocation();
//   // REMOVED: const navigate = useNavigate();
//   const { toast } = useToast();

//   const navigateToVerify = (reportId: string) => {
//     setLocation(`/verify-report?id=${reportId}`);
//   };

//   const navigateToMap = () => {
//     setLocation('/map-view');
//   };

//   // ------------------------------------------------------------------------
//   // MOCK DATA
//   // ------------------------------------------------------------------------
//   const [mockIssues, setMockIssues] = useState<Issue[]>([
//     { id: "1", title: "Broken Streetlight near Mukka Junction", category: "Street Light", location: "Mukka Junction, NH-66", status: "open", date: "2 days ago", reporter: "Anish D'Souza" },
//     { id: "2", title: "Pothole near NITK Main Gate", category: "Road Damage", location: "NITK Surathkal Main Road", status: "inprogress", date: "5 days ago", reporter: "Shreya Shetty" },
//     { id: "3", title: "Garbage Overflow near Panambur Beach", category: "Garbage", location: "Panambur Beach Parking Area", status: "resolved", date: "1 week ago", reporter: "Rohit Rao" },
//     { id: "4", title: "Water Leakage at KSRTC Bus Stand", category: "Water", location: "Mangalore KSRTC Bus Stand, Bejai", status: "open", date: "1 day ago", reporter: "Divya Fernandes" },
//     { id: "5", title: "Overflowing Drain near Kulur Bridge", category: "Drainage", location: "Kulur Bridge Road", status: "open", date: "3 days ago", reporter: "Sanjay Nayak" },
//     { id: "6", title: "Illegal Parking blocking road", category: "Traffic", location: "Urwa Market Road", status: "inprogress", date: "4 days ago", reporter: "Priya Pinto" },
//     { id: "7", title: "Tree fallen due to rain", category: "Public Safety", location: "Kavoor Junction", status: "resolved", date: "6 days ago", reporter: "Rakesh Kamath" },
//     { id: "8", title: "Beach waste accumulation", category: "Garbage", location: "Tannirbhavi Beach", status: "inprogress", date: "2 days ago", reporter: "Meera D'Silva" },
//     { id: "9", title: "Noise pollution near MRPL area", category: "Pollution", location: "MRPL Township Road, Kuthethur", status: "open", date: "1 day ago", reporter: "Nikhil Bhat" },
//     { id: "10", title: "Potholes near Surathkal Railway Station", category: "Road Damage", location: "Surathkal Railway Station Road", status: "resolved", date: "1 week ago", reporter: "Sneha Shenoy" },
//   ]);

//   const [mockMapMarkers, setMockMapMarkers] = useState<MapMarker[]>([
//     { id: "1", position: [12.9507, 74.7856], title: "Broken Streetlight", status: "open", category: "Street Light" },
//     { id: "2", position: [13.0104, 74.7936], title: "Pothole near NITK", status: "inprogress", category: "Road Damage" },
//     { id: "3", position: [12.9253, 74.8082], title: "Garbage Overflow", status: "resolved", category: "Garbage" },
//     { id: "4", position: [12.8731, 74.8426], title: "Water Leakage", status: "open", category: "Water" },
//     { id: "5", position: [12.9085, 74.8124], title: "Drainage Overflow", status: "open", category: "Drainage" },
//     { id: "6", position: [12.8951, 74.8312], title: "Illegal Parking", status: "inprogress", category: "Traffic" },
//     { id: "7", position: [12.9143, 74.8499], title: "Fallen Tree", status: "resolved", category: "Public Safety" },
//     { id: "8", position: [12.9059, 74.7896], title: "Beach Waste", status: "inprogress", category: "Garbage" },
//     { id: "9", position: [12.9882, 74.8244], title: "Noise Pollution", status: "open", category: "Pollution" },
//     { id: "10", position: [13.0194, 74.7901], title: "Potholes", status: "resolved", category: "Road Damage" },
//   ]);

//   // ------------------------------------------------------------------------
//   // STATE + FILTERS
//   // ------------------------------------------------------------------------
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const [categoryFilter, setCategoryFilter] = useState<string>("all");
//   const [showHeatmap, setShowHeatmap] = useState(false);

//   // ------------------------------------------------------------------------
//   // ANALYTICS
//   // ------------------------------------------------------------------------
//   const totalIssues = mockIssues.length;
//   const resolvedCount = mockIssues.filter((i) => i.status === "resolved").length;
//   const pendingCount = mockIssues.filter((i) => i.status !== "resolved").length;
//   const violationCount = mockIssues.filter((i) => i.category === "Traffic" || i.category === "Pollution").length;

//   const resolvedRate = ((resolvedCount / totalIssues) * 100).toFixed(1);
//   const openRate = ((pendingCount / totalIssues) * 100).toFixed(1);

//   // Category Distribution
//   const categoryCounts = useMemo(() => {
//     const counts: Record<string, number> = {};
//     mockIssues.forEach((issue) => {
//       counts[issue.category] = (counts[issue.category] || 0) + 1;
//     });
//     return counts;
//   }, [mockIssues]);

//   // ------------------------------------------------------------------------
//   // FILTER LOGIC
//   // ------------------------------------------------------------------------
//   const filteredIssues = useMemo(() => {
//     return mockIssues.filter((issue) => {
//       const matchesSearch =
//         issue.title.toLowerCase().includes(search.toLowerCase()) ||
//         issue.category.toLowerCase().includes(search.toLowerCase()) ||
//         issue.location.toLowerCase().includes(search.toLowerCase());
//       const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
//       const matchesCategory = categoryFilter === "all" || issue.category === categoryFilter;
//       return matchesSearch && matchesStatus && matchesCategory;
//     });
//   }, [search, statusFilter, categoryFilter, mockIssues]);

//   // ------------------------------------------------------------------------
//   // EXPORT FUNCTIONS
//   // ------------------------------------------------------------------------
//   const exportToExcel = useCallback(() => {
//     const worksheet = XLSX.utils.json_to_sheet(mockIssues);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Issues");
//     const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//     const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
//     saveAs(blob, "Authority_Issues.xlsx");
//     toast({ title: "✅ Exported successfully", description: "Data downloaded as Excel" });
//   }, [mockIssues, toast]);

//   const exportToJSON = useCallback(() => {
//     const blob = new Blob([JSON.stringify(mockIssues, null, 2)], { type: "application/json" });
//     saveAs(blob, "Authority_Issues.json");
//     toast({ title: "✅ JSON Exported", description: "Data downloaded as JSON" });
//   }, [mockIssues, toast]);

//   // ------------------------------------------------------------------------
//   // NAVIGATION - CHANGED: Using setLocation instead of navigate
//   // ------------------------------------------------------------------------
//   const routerToViolations = useCallback(() => {
//     setLocation("/violator-detection");
//   }, [setLocation]);

//   // ------------------------------------------------------------------------
//   // EFFECTS (Simulate Realtime Updates)
//   // ------------------------------------------------------------------------
//   useEffect(() => {
//     const timer = setInterval(() => {
//       if (Math.random() > 0.8) {
//         toast({
//           title: "📢 New report received!",
//           description: "Citizen reported a pothole in Surathkal Main Road.",
//         });
//       }
//     }, 20000);
//     return () => clearInterval(timer);
//   }, [toast]);

//   // ------------------------------------------------------------------------
//   // RENDER
//   // ------------------------------------------------------------------------
//   return (
//     <div className="space-y-8 p-2 md:p-4" data-testid="page-authority-dashboard">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
//         <div>
//           <h1 className="text-3xl font-bold">Authority Dashboard - Mangalore Region</h1>
//           <p className="text-muted-foreground">
//             Monitor and manage civic issues across Mangalore, Surathkal, Mukka, and nearby zones
//           </p>
//         </div>
//         <div className="flex gap-3">
//           <Button variant="outline" onClick={exportToExcel}>
//             <Download className="w-4 h-4 mr-2" /> Export Excel
//           </Button>
//           <Button variant="outline" onClick={exportToJSON}>
//             <Download className="w-4 h-4 mr-2" /> Export JSON
//           </Button>
//         </div>
//       </div>

//       {/* Stat Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard title="Total Issues" value={totalIssues.toString()} icon={AlertCircle} description="All time" accentColor="primary" />
//         <StatCard title="Resolved" value={resolvedCount.toString()} icon={CheckCircle} trend={{ value: Number(resolvedRate), isPositive: true }} description={`${resolvedRate}% resolved`} accentColor="success" />
//         <StatCard title="Pending" value={pendingCount.toString()} icon={Clock} description={`${openRate}% awaiting`} accentColor="warning" />
//         <div onClick={routerToViolations} className="cursor-pointer hover:scale-[1.03] transition-transform">
//           <StatCard title="Violations" value={violationCount.toString()} icon={AlertTriangle} description="Tap to view" accentColor="danger" />
//         </div>
//       </div>

//       {/* Filters */}
//       <Card className="p-4">
//         <div className="flex flex-wrap gap-3 justify-between items-center">
//           <div className="flex gap-2 items-center">
//             <Search className="w-4 h-4" />
//             <Input placeholder="Search issues..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
//           </div>
//           <div className="flex gap-3">
//             <Select onValueChange={setStatusFilter}>
//               <SelectTrigger className="w-36">
//                 <SelectValue placeholder="Status Filter" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All</SelectItem>
//                 <SelectItem value="open">Open</SelectItem>
//                 <SelectItem value="inprogress">In Progress</SelectItem>
//                 <SelectItem value="resolved">Resolved</SelectItem>
//               </SelectContent>
//             </Select>

//             <Select onValueChange={setCategoryFilter}>
//               <SelectTrigger className="w-40">
//                 <SelectValue placeholder="Category Filter" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All</SelectItem>
//                 {Object.keys(categoryCounts).map((cat) => (
//                   <SelectItem key={cat} value={cat}>
//                     {cat}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <Button onClick={() => setShowHeatmap(!showHeatmap)} variant={showHeatmap ? "default" : "outline"}>
//               <MapPin className="mr-2 w-4 h-4" />
//               {showHeatmap ? "Show Pins" : "Show Heatmap"}
//             </Button>
//           </div>
//         </div>
//       </Card>

//       {/* Map & Charts */}
//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Issue Hotspots Map</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <MapView
//               markers={mockMapMarkers}
//               center={[12.95, 74.8]}
//               zoom={12}
//               heatmap={showHeatmap}
//               className="h-96 rounded-lg"
//               onMarkerClick={(id) => toast({ title: "Marker clicked", description: `ID: ${id}` })}
//             />
//           </CardContent>
//         </Card>

//         <ChartCard
//           title="Category Distribution"
//           description="Visual breakdown of issue categories"
//           type="pie"
//           data={Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))}
//           dataKey="value"
//           xAxisKey="name"
//         />
//       </div>

//       {/* Issue Management */}
//       <div>
//         <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
//           <BarChart3 className="w-5 h-5" /> Issue Management
//         </h2>
//         <IssueTable
//           issues={filteredIssues}
//           onView={(id) => toast({ title: "View Issue", description: `Issue ID: ${id}` })}
//           onResolve={(id) => toast({ title: "Marked Resolved", description: `Issue ${id} resolved.` })}
//         />
//       </div>

//       {/* Smart Insights Section */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <TrendingUp className="w-5 h-5" /> Smart Insights
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <ul className="list-disc ml-6 space-y-2 text-sm text-muted-foreground">
//             <li>Garbage-related issues have increased by 30% compared to last week.</li>
//             <li>Surathkal and Bejai areas report the highest open issue count.</li>
//             <li>Traffic violations are down by 10% following new enforcement measures.</li>
//             <li>Average response time improved by 8% this month.</li>
//           </ul>
//         </CardContent>
//       </Card>

//       {/* Recent Activities */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Activity className="w-5 h-5" /> Recent Activities
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <ul className="space-y-2 text-sm text-muted-foreground">
//             <li>✅ Issue #3 (Garbage Overflow) marked as resolved by Supervisor Rajesh.</li>
//             <li>⚠️ New complaint logged: "Water Leakage in Bejai area."</li>
//             <li>🕒 Scheduled maintenance completed near Panambur Beach.</li>
//             <li>📢 Public notification sent for power cut tomorrow in Kavoor area.</li>
//           </ul>
//         </CardContent>
//       </Card>

//       {/* Footer Actions */}
//       <div className="text-center mt-6 flex flex-col md:flex-row justify-center items-center gap-3">
//         <Button onClick={routerToViolations} variant="destructive" className="px-6 py-2">
//           View All Violations
//         </Button>
//         <Button variant="outline" onClick={() => toast({ title: "🔔 Notifications", description: "Coming soon..." })}>
//           <Bell className="w-4 h-4 mr-2" /> Enable Alerts
//         </Button>
//       </div>
//     </div>
//   );
// }

import { useLocation } from "wouter";
import { useState, useMemo, useEffect, useCallback } from "react";
import { StatCard } from "@/components/stat-card";
import { IssueTable } from "@/components/issue-table";
import { MapView } from "@/components/map-view";
import { ChartCard } from "@/components/chart-card";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Search,
  TrendingUp,
  BarChart3,
  Activity,
  MapPin,
  Bell,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

// TYPES
type MapMarker = {
  id: string;
  position: [number, number];
  title: string;
  status: "open" | "inprogress" | "resolved";
  category: string;
};

type BackendReport = {
  id: string;
  report_type: "ISSUE" | "VIOLATION";
  issue: string;
  location: string;
  status: string;
  citizen: string;
  citizen_id: string;
  image_path: string;
  created_at: string;
  priority: string;
  category: string;
  latitude?: number;
  longitude?: number;
};

// --------------------------------------------------------------------------
// MAIN DASHBOARD COMPONENT
// --------------------------------------------------------------------------
export default function AuthorityDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<BackendReport[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // ------------------------------------------------------------------------
  // STATE + FILTERS
  // ------------------------------------------------------------------------
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showHeatmap, setShowHeatmap] = useState(false);

  // ------------------------------------------------------------------------
  // FETCH DATA FROM BACKEND
  // ------------------------------------------------------------------------
  const fetchReports = useCallback(async () => {
    try {
      setRefreshing(true);
      
      // Fetch all reports from backend
      const response = await fetch("http://localhost:5000/api/reports");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched reports from API:", data);
      
      // Transform backend data
      const transformedReports: BackendReport[] = data.map((report: any) => ({
        id: String(report.id || report.report_id || ""),
        report_type: report.report_type === "VIOLATION" ? "VIOLATION" : "ISSUE",
        issue: report.issue || report.title || report.category || "Untitled",
        location: report.location || report.address || "Unknown",
        status: report.status || "PENDING",
        citizen: report.citizen || report.full_name || "Anonymous",
        citizen_id: String(report.citizen_id || report.user_id || ""),
        image_path: report.image_path || report.image_url || "",
        created_at: report.created_at || report.date || new Date().toISOString(),
        priority: report.priority || "MEDIUM",
        category: report.category || report.issue || "General",
        latitude: report.latitude || 12.95 + Math.random() * 0.1,
        longitude: report.longitude || 74.8 + Math.random() * 0.1
      }));
      
      setReports(transformedReports);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    toast({
      title: "Error",
      description: "Failed to load dashboard data. Please check backend connection.",
    });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReports();
    
    // Set up polling for real-time updates every 60 seconds
    const interval = setInterval(fetchReports, 60000);
    
    return () => clearInterval(interval);
  }, [fetchReports]);

  // ------------------------------------------------------------------------
  // ANALYTICS
  // ------------------------------------------------------------------------
  const totalIssues = reports.length;
  const resolvedCount = reports.filter(r => 
    r.status.toUpperCase() === 'RESOLVED' || r.status === 'resolved'
  ).length;
  
  const pendingCount = reports.filter(r => 
    r.status.toUpperCase() === 'PENDING' || 
    r.status.toUpperCase() === 'OPEN' || 
    r.status === 'open'
  ).length;
  
  const inProgressCount = reports.filter(r => 
    r.status.toUpperCase() === 'IN_PROGRESS' || 
    r.status.toUpperCase() === 'VERIFIED' || 
    r.status === 'inprogress'
  ).length;
  
  const violationCount = reports.filter(r => 
    r.report_type === 'VIOLATION'
  ).length;

  const resolvedRate = totalIssues > 0 ? ((resolvedCount / totalIssues) * 100).toFixed(1) : "0";

  // Category Distribution
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((report) => {
      const category = report.category || "Uncategorized";
      counts[category] = (counts[category] || 0) + 1;
    });
    return counts;
  }, [reports]);

  // ------------------------------------------------------------------------
  // CREATE MAP MARKERS
  // ------------------------------------------------------------------------
  const mapMarkers = useMemo(() => {
    return reports.map((report, index) => {
      // Generate consistent coordinates based on report ID for demo
      const baseLat = 12.95;
      const baseLng = 74.8;
      const latOffset = (parseInt(report.id) % 10) * 0.01;
      const lngOffset = (parseInt(report.id) % 7) * 0.01;
      
      // Map status to frontend format
      let status: "open" | "inprogress" | "resolved" = "open";
      const statusUpper = report.status.toUpperCase();
      if (statusUpper === 'RESOLVED') status = 'resolved';
      else if (statusUpper === 'IN_PROGRESS' || statusUpper === 'VERIFIED') status = 'inprogress';
      else status = 'open';
      
      return {
        id: report.id,
        position: [baseLat + latOffset, baseLng + lngOffset] as [number, number],
        title: report.issue,
        status: status,
        category: report.category
      };
    });
  }, [reports]);

  // ------------------------------------------------------------------------
  // FILTER LOGIC
  // ------------------------------------------------------------------------
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.issue.toLowerCase().includes(search.toLowerCase()) ||
        report.category.toLowerCase().includes(search.toLowerCase()) ||
        report.location.toLowerCase().includes(search.toLowerCase()) ||
        report.citizen.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "open" && (report.status.toUpperCase() === 'PENDING' || report.status === 'open')) ||
        (statusFilter === "inprogress" && (report.status.toUpperCase() === 'IN_PROGRESS' || report.status.toUpperCase() === 'VERIFIED')) ||
        (statusFilter === "resolved" && report.status.toUpperCase() === 'RESOLVED');
      
      const matchesCategory = categoryFilter === "all" || 
        report.category.toLowerCase() === categoryFilter.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [reports, search, statusFilter, categoryFilter]);

  // ------------------------------------------------------------------------
  // EXPORT FUNCTIONS
  // ------------------------------------------------------------------------
  const exportToExcel = useCallback(() => {
    const exportData = reports.map(report => ({
      ID: report.id,
      Type: report.report_type,
      Issue: report.issue,
      Category: report.category,
      Location: report.location,
      Status: report.status,
      Reporter: report.citizen,
      "Reported Date": new Date(report.created_at).toLocaleDateString(),
      Priority: report.priority
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Authority_Reports_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast({ title: "✅ Exported successfully", description: "Data downloaded as Excel" });
  }, [reports, toast]);

  // ------------------------------------------------------------------------
  // NAVIGATION
  // ------------------------------------------------------------------------
  const navigateToVerify = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setLocation(`/verify-report?id=${reportId}&type=${report.report_type.toLowerCase()}`);
    }
  };

  const routerToViolations = useCallback(() => {
    setLocation("/violator-detection");
  }, [setLocation]);

  const handleResolveIssue = async (issueId: string) => {
    try {
      const report = reports.find(r => r.id === issueId);
      if (!report) {
        toast({ title: "Error", description: "Report not found"});
        return;
      }
      
      const reportType = report.report_type; // "ISSUE" or "VIOLATION"
      
      const response = await fetch(`http://localhost:5000/api/reports/${issueId}/verify?report_type=${reportType}`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        toast({ 
          title: "✅ Success", 
          description: `Report ${issueId} marked as verified/resolved.` 
        });
        
        // Refresh the data
        fetchReports();
      } else {
        throw new Error(`API responded with ${response.status}`);
      }
    } catch (error) {
      toast({ 
        title: "❌ Error", 
        description: "Failed to update report status"
      });
    }
  };

  const handleViewReport = (issueId: string) => {
    const report = reports.find(r => r.id === issueId);
    if (report) {
      toast({ 
        title: "View Report", 
        description: `Viewing ${report.report_type.toLowerCase()}: ${report.issue}` 
      });
      // You could navigate to a detailed view here
      navigateToVerify(issueId);
    }
  };

  // ------------------------------------------------------------------------
  // FORMAT DATE HELPER
  // ------------------------------------------------------------------------
  const formatDate = (dateString: string) => {
    if (!dateString) return "Some time ago";
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return date.toLocaleDateString();
    } catch (e) {
      return "Some time ago";
    }
  };

  // ------------------------------------------------------------------------
  // LOADING STATE
  // ------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------------
  return (
    <div className="space-y-8 p-4 md:p-6" data-testid="page-authority-dashboard">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Authority Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Managing {totalIssues} reports • {resolvedCount} resolved • {violationCount} violations
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            onClick={fetchReports} 
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportToExcel} disabled={reports.length === 0}>
            <Download className="w-4 h-4 mr-2" /> Export Excel
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Reports" 
          value={totalIssues.toString()} 
          icon={AlertCircle} 
          description={`${reports.filter(r => r.report_type === 'ISSUE').length} issues, ${violationCount} violations`} 
          accentColor="primary" 
        />
        <StatCard 
          title="Resolved" 
          value={resolvedCount.toString()} 
          icon={CheckCircle} 
          trend={{ value: Number(resolvedRate), isPositive: true }} 
          description={`${resolvedRate}% resolution rate`} 
          accentColor="success" 
        />
        <StatCard 
          title="In Progress" 
          value={inProgressCount.toString()} 
          icon={Clock} 
          description={`${pendingCount} pending`} 
          accentColor="warning" 
        />
        <div onClick={routerToViolations} className="cursor-pointer hover:scale-[1.02] transition-transform">
          <StatCard 
            title="Violations" 
            value={violationCount.toString()} 
            icon={AlertTriangle} 
            description="Tap to manage"
            accentColor="danger" 
          />
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex gap-2 items-center w-full md:w-auto">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search reports by issue, category, location, or reporter..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="flex-1"
            />
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Pending/Open</SelectItem>
                <SelectItem value="inprogress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.keys(categoryCounts).sort().map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat} ({categoryCounts[cat]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={() => setShowHeatmap(!showHeatmap)} 
              variant={showHeatmap ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {showHeatmap ? "Pin View" : "Heatmap"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Map & Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Report Locations</span>
              <span className="text-sm font-normal text-muted-foreground">
                {mapMarkers.length} locations
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MapView
              markers={mapMarkers}
              center={[12.95, 74.8]}
              zoom={12}
              heatmap={showHeatmap}
              className="h-96 rounded-lg"
              onMarkerClick={(id) => {
                const report = reports.find(r => r.id === id);
                if (report) {
                  toast({ 
                    title: report.issue, 
                    description: `Status: ${report.status} • Reporter: ${report.citizen}` 
                  });
                }
              }}
            />
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Open ({mapMarkers.filter(m => m.status === 'open').length})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>In Progress ({mapMarkers.filter(m => m.status === 'inprogress').length})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Resolved ({mapMarkers.filter(m => m.status === 'resolved').length})</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation('/map-view')}
              >
                View Full Map →
              </Button>
            </div>
          </CardContent>
        </Card>

        <ChartCard
          title="Category Distribution"
          description={`Across ${totalIssues} total reports`}
          type="pie"
          data={Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, value]) => ({ name, value }))}
          dataKey="value"
          xAxisKey="name"
        />
      </div>

      {/* Reports Management */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Reports Management
          </h2>
          <div className="text-sm text-muted-foreground">
            Showing {filteredReports.length} of {reports.length} reports
          </div>
        </div>
        
        {filteredReports.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No reports found matching your filters.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Issue</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Location</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Reporter</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.slice(0, 10).map((report) => (
                  <tr key={report.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="font-medium">{report.issue}</div>
                      {report.priority && (
                        <div className="text-xs text-muted-foreground">
                          Priority: {report.priority}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                        {report.category}
                      </span>
                    </td>
                    <td className="p-3">{report.location}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${report.status.toUpperCase() === 'RESOLVED' ? 'bg-green-100 text-green-800' : 
                          report.status.toUpperCase() === 'IN_PROGRESS' || report.status.toUpperCase() === 'VERIFIED' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-3">{report.citizen}</td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {formatDate(report.created_at)}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${report.report_type === 'VIOLATION' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {report.report_type}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewReport(report.id)}
                        >
                          View
                        </Button>
                        {report.status.toUpperCase() !== 'RESOLVED' && (
                          <Button 
                            size="sm"
                            onClick={() => handleResolveIssue(report.id)}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredReports.length > 10 && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Showing 10 of {filteredReports.length} reports. Use filters to narrow down.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {reports
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 3)
                .map((report) => (
                  <li key={report.id} className="flex items-center justify-between">
                    <span className="truncate">{report.issue}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(report.created_at)}</span>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([category, count]) => (
                  <li key={category} className="flex items-center justify-between">
                    <span>{category}</span>
                    <span className="font-medium">{count}</span>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="w-4 h-4" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={routerToViolations}
              >
                View Violations
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setLocation('/verify-report')}
              >
                Verify Reports
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={fetchReports}
              >
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}