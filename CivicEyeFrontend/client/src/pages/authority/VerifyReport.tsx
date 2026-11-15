

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// // ✅ ADDED: Import the ImageOff icon for placeholders
// import { AlertTriangle, ImageOff } from "lucide-react";

// // ✅ UPDATED: Define the structure of a report, now including the image path
// interface Report {
//   id: number;
//   citizen: string;
//   issue: string;
//   location: string;
//   status: string;
//   image_path?: string; // The path can be optional
// }

// // Your backend API URL
// const API_URL = "http://0.0.0.0:5000"; 

// export default function VerifyReport() {
//   const [query, setQuery] = useState("");
//   const [confirmId, setConfirmId] = useState<number | null>(null);
//   const [reports, setReports] = useState<Report[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // useEffect(() => {
//   //   const fetchReports = async () => {
//   //     try {
//   //       setIsLoading(true);
//   //       setError(null);
//   //       const response = await fetch(`${API_URL}/api/reports/unverified`);
//   //       if (!response.ok) {
//   //         throw new Error("Network response was not ok");
//   //       }
//   //       const data: Report[] = await response.json();
//   //       setReports(data);
//   //     } catch (err) {
//   //       setError("Failed to load reports. Please make sure the backend server is running.");
//   //       console.error("Fetch error:", err);
//   //     } finally {
//   //       setIsLoading(false);
//   //     }
//   //   };
//   //   fetchReports();
//   // }, []);
//   useEffect(() => {
//   const fetchReports = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
//       const response = await fetch(`${API_URL}/api/reports/unverified`);
//       if (!response.ok) throw new Error("Network response was not ok");

//       const data = await response.json();
//       setReports(data.reports); // ✅ access the reports array
//     } catch (err) {
//       setError("Failed to load reports. Please make sure the backend server is running.");
//       console.error("Fetch error:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   fetchReports();
//   }, []);

//   const filteredReports = reports.filter((r) =>
//     r.issue.toLowerCase().includes(query.toLowerCase())
//   );

//   const handleVerify = async () => {
//     if (confirmId === null) return;
//     try {
//       const response = await fetch(`${API_URL}/api/reports/${confirmId}/verify`, {
//         method: 'PUT',
//       });
//       if (!response.ok) {
//         throw new Error("Failed to verify report on the server.");
//       }
//       setReports((prevReports) => prevReports.filter((r) => r.id !== confirmId));
//       setConfirmId(null);
//     } catch (err) {
//       console.error("Verification error:", err);
//       alert("Failed to verify the report. Please try again.");
//       setConfirmId(null);
//     }
//   };
  
//   if (isLoading) {
//     return (
//       <div className="p-8 space-y-6">
//         <h1 className="text-2xl font-bold">Verify Citizen Reports</h1>
//         <div className="grid gap-4 md:grid-cols-2">
//           {/* ✅ UPDATED: Taller skeleton to account for the image */}
//           {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72 w-full" />)}
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//        <div className="p-8">
//          <Alert variant="destructive">
//            <AlertTriangle className="h-4 w-4" />
//            <AlertTitle>Error</AlertTitle>
//            <AlertDescription>{error}</AlertDescription>
//          </Alert>
//        </div>
//     );
//   }

//   return (
//     <div className="p-8 space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">Verify Citizen Reports</h1>
//         <Input
//           placeholder="Search reports..."
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           className="max-w-xs"
//         />
//       </div>

//       <div className="grid gap-4 md:grid-cols-2">
//         {filteredReports.length > 0 ? (
//           filteredReports.map((r) => (
//             // ✅ UPDATED: Added overflow-hidden to the Card
//             <Card key={r.id} className="hover:shadow-lg transition overflow-hidden">
//               {/* ✅ ADDED: Image preview section */}
//               {r.image_path ? (
//                 <img
//                   src={`${API_URL}/${r.image_path}`}
//                   alt={r.issue}
//                   className="w-full h-40 object-cover bg-gray-100"
//                 />
//               ) : (
//                 <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
//                   <ImageOff className="h-12 w-12 text-gray-400" />
//                 </div>
//               )}
              
//               <CardHeader>
//                 <CardTitle>{r.issue}</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <p><b>Citizen:</b> {r.citizen}</p>
//                 <p><b>Location:</b> {r.location}</p>
//                 <p>
//                   <b>Status:</b>{" "}
//                   <span className="text-red-600 font-semibold">{r.status}</span>
//                 </p>
//                 <Button onClick={() => setConfirmId(r.id)}>Verify Report</Button>
//               </CardContent>
//             </Card>
//           ))
//         ) : (
//           <p className="text-muted-foreground col-span-2 text-center pt-10">No pending reports found.</p>
//         )}
//       </div>

//       <Dialog open={confirmId !== null} onOpenChange={() => setConfirmId(null)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Confirm Verification</DialogTitle>
//           </DialogHeader>
//           <p>Are you sure you want to verify this report? This will move it to the 'In Progress' queue.</p>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setConfirmId(null)}>Cancel</Button>
//             <Button onClick={handleVerify}>Confirm</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { AlertTriangle, ImageOff, Clock, MapPin, User, AlertCircle } from "lucide-react";
// import { Badge } from "@/components/ui/badge";

// // Updated interface to match backend response
// interface Report {
//   id: string;
//   issue: string;
//   location: string;
//   status: string;
//   citizen: string;
//   citizen_id: string;
//   image_path?: string;
//   created_at: string;
//   priority?: string;
//   category?: string;
//   report_type: 'ISSUE' | 'VIOLATION';
// }

// const API_URL = "";

// export default function VerifyReport() {
//   const [query, setQuery] = useState("");
//   const [confirmId, setConfirmId] = useState<string | null>(null);
//   const [confirmType, setConfirmType] = useState<'ISSUE' | 'VIOLATION'>('ISSUE');
//   const [reports, setReports] = useState<Report[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchReports = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);
//         console.log("Fetching reports from:", `${API_URL}/api/reports/unverified`);
        
//         const response = await fetch(`${API_URL}/api/reports/unverified`);
//         if (!response.ok) {
//           const errorText = await response.text();
//           throw new Error(`HTTP ${response.status}: ${errorText}`);
//         }
        
//         const data = await response.json();
//         console.log("Received data:", data);
        
//         if (data.reports && Array.isArray(data.reports)) {
//           setReports(data.reports);
//         } else {
//           throw new Error("Invalid response format");
//         }
//       } catch (err: any) {
//         console.error("Fetch error:", err);
//         setError(`Failed to load reports: ${err.message}. Please make sure the backend server at ${API_URL} is running.`);
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     fetchReports();
//   }, []);

//   const filteredReports = reports.filter((r) =>
//     r.issue.toLowerCase().includes(query.toLowerCase()) ||
//     r.location.toLowerCase().includes(query.toLowerCase()) ||
//     r.citizen.toLowerCase().includes(query.toLowerCase())
//   );

//   const handleVerify = async () => {
//     if (confirmId === null) return;
//     try {
//       const response = await fetch(
//         `${API_URL}/api/reports/${confirmId}/verify?report_type=${confirmType}`,
//         {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Verification failed: ${errorText}`);
//       }
      
//       // Remove the verified report from the list
//       setReports((prevReports) => prevReports.filter((r) => r.id !== confirmId));
//       setConfirmId(null);
//       setConfirmType('ISSUE');
      
//       alert("Report verified successfully!");
//     } catch (err: any) {
//       console.error("Verification error:", err);
//       alert(`Failed to verify the report: ${err.message}`);
//       setConfirmId(null);
//       setConfirmType('ISSUE');
//     }
//   };

//   const getPriorityColor = (priority?: string) => {
//     switch (priority?.toUpperCase()) {
//       case 'HIGH':
//       case 'CRITICAL':
//         return 'bg-red-100 text-red-800';
//       case 'MEDIUM':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'LOW':
//         return 'bg-green-100 text-green-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getReportTypeBadge = (type: string) => {
//     if (type === 'ISSUE') {
//       return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Issue</Badge>;
//     } else {
//       return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Violation</Badge>;
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="p-8 space-y-6">
//         <div className="flex justify-between items-center">
//           <Skeleton className="h-8 w-64" />
//           <Skeleton className="h-10 w-64" />
//         </div>
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//           {[...Array(6)].map((_, i) => (
//             <Card key={i} className="overflow-hidden">
//               <Skeleton className="h-48 w-full" />
//               <CardHeader>
//                 <Skeleton className="h-6 w-3/4" />
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <Skeleton className="h-4 w-full" />
//                 <Skeleton className="h-4 w-full" />
//                 <Skeleton className="h-4 w-full" />
//                 <Skeleton className="h-10 w-full mt-4" />
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-8">
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertTitle>Error Loading Reports</AlertTitle>
//           <AlertDescription>
//             {error}
//             <div className="mt-4 space-y-2">
//               <p className="text-sm">Troubleshooting steps:</p>
//               <ol className="text-sm list-decimal pl-4 space-y-1">
//                 <li>Ensure backend is running at {API_URL}</li>
//                 <li>Check if the endpoint <code>/api/reports/unverified</code> is accessible</li>
//                 <li>Verify database connection in backend logs</li>
//               </ol>
//               <Button 
//                 variant="outline" 
//                 className="mt-4"
//                 onClick={() => window.location.reload()}
//               >
//                 Retry
//               </Button>
//             </div>
//           </AlertDescription>
//         </Alert>
//       </div>
//     );
//   }

//   return (
//     <div className="p-8 space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Verify Citizen Reports</h1>
//           <p className="text-gray-600 mt-2">Review and verify submitted issues and violations</p>
//         </div>
//         <div className="flex items-center space-x-4">
//           <div className="relative">
//             <Input
//               placeholder="Search reports..."
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               className="pl-10 w-64"
//             />
//             <svg
//               className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
//           <Badge variant="secondary" className="px-3 py-1">
//             {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
//           </Badge>
//         </div>
//       </div>

//       {filteredReports.length > 0 ? (
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {filteredReports.map((report) => (
//             <Card key={report.id} className="hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200">
//               {/* Image Section */}
//               <div className="relative">
//                 {report.image_path ? (
//                   <img
//                     src={`${API_URL}/${report.image_path}`}
//                     alt={report.issue}
//                     className="w-full h-48 object-cover"
//                     onError={(e) => {
//                       const target = e.target as HTMLImageElement;
//                       target.src = `https://via.placeholder.com/400x300/3b82f6/ffffff?text=${encodeURIComponent(report.issue.substring(0, 20))}`;
//                     }}
//                   />
//                 ) : (
//                   <div className="w-full h-48 bg-gray-100 flex flex-col items-center justify-center">
//                     <ImageOff className="h-12 w-12 text-gray-400 mb-2" />
//                     <p className="text-gray-500 text-sm">No image available</p>
//                   </div>
//                 )}
//                 <div className="absolute top-2 right-2">
//                   {getReportTypeBadge(report.report_type)}
//                 </div>
//                 {report.priority && (
//                   <div className="absolute top-2 left-2">
//                     <Badge className={`${getPriorityColor(report.priority)} font-medium`}>
//                       {report.priority}
//                     </Badge>
//                   </div>
//                 )}
//               </div>

//               <CardHeader className="pb-3">
//                 <CardTitle className="text-lg font-semibold line-clamp-2">
//                   {report.issue}
//                 </CardTitle>
//                 {report.category && (
//                   <p className="text-sm text-gray-600 mt-1">{report.category}</p>
//                 )}
//               </CardHeader>

//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <div className="flex items-center text-sm text-gray-600">
//                     <User className="h-4 w-4 mr-2" />
//                     <span className="font-medium">Reported by:</span>
//                     <span className="ml-2">{report.citizen}</span>
//                   </div>
//                   <div className="flex items-center text-sm text-gray-600">
//                     <MapPin className="h-4 w-4 mr-2" />
//                     <span className="line-clamp-1">{report.location}</span>
//                   </div>
//                   <div className="flex items-center text-sm text-gray-600">
//                     <Clock className="h-4 w-4 mr-2" />
//                     <span>
//                       {new Date(report.created_at).toLocaleDateString('en-US', {
//                         year: 'numeric',
//                         month: 'short',
//                         day: 'numeric',
//                         hour: '2-digit',
//                         minute: '2-digit'
//                       })}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="flex justify-between items-center pt-4 border-t">
//                   <Badge 
//                     variant={report.status === 'PENDING' ? 'destructive' : 'secondary'}
//                     className="font-medium"
//                   >
//                     {report.status}
//                   </Badge>
//                   <Button 
//                     onClick={() => {
//                       setConfirmId(report.id);
//                       setConfirmType(report.report_type);
//                     }}
//                     className="bg-green-600 hover:bg-green-700"
//                   >
//                     Verify Report
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-12">
//           <div className="mx-auto w-24 h-24 text-gray-400 mb-4">
//             <AlertTriangle className="w-full h-full" />
//           </div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">
//             {query ? 'No matching reports found' : 'No pending reports'}
//           </h3>
//           <p className="text-gray-600 max-w-md mx-auto">
//             {query 
//               ? 'Try adjusting your search terms to find what you\'re looking for.'
//               : 'All reports have been processed. Check back later for new submissions.'
//             }
//           </p>
//           {query && (
//             <Button 
//               variant="outline" 
//               className="mt-4"
//               onClick={() => setQuery('')}
//             >
//               Clear Search
//             </Button>
//           )}
//         </div>
//       )}

//       {/* Verification Dialog */}
//       <Dialog open={confirmId !== null} onOpenChange={() => {
//         setConfirmId(null);
//         setConfirmType('ISSUE');
//       }}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               <AlertTriangle className="h-5 w-5 text-yellow-600" />
//               Confirm Verification
//             </DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4 py-4">
//             <p className="text-gray-700">
//               Are you sure you want to verify this {confirmType?.toLowerCase()} report? 
//               This action will:
//             </p>
//             <ul className="text-sm text-gray-600 space-y-2 ml-4 list-disc">
//               <li>Change the report status to {confirmType === 'ISSUE' ? "'IN PROGRESS'" : "'VERIFIED'"}</li>
//               <li>Move it out of the pending queue</li>
//               <li>Notify the citizen about the update</li>
//             </ul>
//             <Alert className="bg-blue-50 border-blue-200">
//               <AlertTriangle className="h-4 w-4 text-blue-600" />
//               <AlertDescription className="text-blue-700">
//                 This action cannot be undone. Please verify all details before proceeding.
//               </AlertDescription>
//             </Alert>
//           </div>
//           <DialogFooter className="gap-2 sm:gap-0">
//             <Button 
//               variant="outline" 
//               onClick={() => {
//                 setConfirmId(null);
//                 setConfirmType('ISSUE');
//               }}
//             >
//               Cancel
//             </Button>
//             <Button 
//               onClick={handleVerify}
//               className="bg-green-600 hover:bg-green-700"
//             >
//               Confirm Verification
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


// //VerifyReports.tsx
// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";
// import { AlertTriangle, ImageOff, User, MapPin, Clock, AlertCircle, Search, Filter } from "lucide-react";

// // Interface for report data matching backend response
// interface Report {
//   id: string;
//   issue: string;
//   location: string;
//   status: string;
//   citizen: string;
//   citizen_id: string;
//   image_path?: string;
//   created_at: string;
//   priority?: string;
//   category?: string;
//   report_type: 'ISSUE' | 'VIOLATION';
// }

// // Your FastAPI backend URL
// const API_URL = "";

// export default function VerifyReport() {
//   const [query, setQuery] = useState("");
//   const [confirmId, setConfirmId] = useState<string | null>(null);
//   const [confirmType, setConfirmType] = useState<'ISSUE' | 'VIOLATION'>('ISSUE');
//   const [reports, setReports] = useState<Report[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [filter, setFilter] = useState<'ALL' | 'ISSUE' | 'VIOLATION'>('ALL');

//   useEffect(() => {
//     const fetchReports = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);
        
//         console.log(`🔍 [DEBUG] Fetching from: ${API_URL}/api/reports/unverified`);
        
//         const response = await fetch(`${API_URL}/api/reports/unverified`);
        
//         if (!response.ok) {
//           const errorText = await response.text();
//           console.error("🔴 [DEBUG] Error response:", errorText);
//           throw new Error(`Server returned ${response.status}: ${errorText}`);
//         }
        
//         const data = await response.json();
//         console.log("✅ [DEBUG] API Response:", data);
        
//         if (data.reports && Array.isArray(data.reports)) {
//           // Log image URLs for debugging
//           console.log("📸 [DEBUG] Image Analysis:");
//           data.reports.forEach((report: Report, index: number) => {
//             if (report.image_path) {
//               const fullUrl = `${API_URL}/${report.image_path}`;
//               console.log(`  Report ${index + 1} (${report.report_type}):`, {
//                 issue: report.issue,
//                 imagePath: report.image_path,
//                 fullUrl: fullUrl,
//                 willLoad: report.image_path.includes('uploads/')
//               });
//             }
//           });
          
//           setReports(data.reports);
//         } else {
//           throw new Error("Invalid response format: missing 'reports' array");
//         }
        
//       } catch (err: any) {
//         console.error("🔴 [DEBUG] Fetch error:", err);
//         const errorMessage = err.message || "Unknown error occurred";
//         setError(`Failed to load reports: ${errorMessage}. Please make sure the backend server at ${API_URL} is running.`);
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     fetchReports();
//   }, []);

//   // Apply filters and search
//   const filteredReports = reports.filter((report) => {
//     // Apply type filter
//     if (filter !== 'ALL' && report.report_type !== filter) return false;
    
//     // Apply search query
//     if (!query) return true;
    
//     const searchLower = query.toLowerCase();
//     return (
//       report.issue.toLowerCase().includes(searchLower) ||
//       report.location.toLowerCase().includes(searchLower) ||
//       report.citizen.toLowerCase().includes(searchLower) ||
//       (report.category && report.category.toLowerCase().includes(searchLower))
//     );
//   });

//   const handleVerify = async () => {
//     if (confirmId === null) return;
//     try {
//       console.log(`🔍 [DEBUG] Verifying ${confirmType} report: ${confirmId}`);
      
//       const response = await fetch(
//         `${API_URL}/api/reports/${confirmId}/verify?report_type=${confirmType}`,
//         { method: 'PUT' }
//       );
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Verification failed: ${errorText}`);
//       }
      
//       // Remove verified report from list
//       setReports(prev => prev.filter(report => report.id !== confirmId));
//       setConfirmId(null);
//       setConfirmType('ISSUE');
      
//       alert("✅ Report verified successfully! It has been moved to the processing queue.");
//     } catch (err: any) {
//       console.error("🔴 [DEBUG] Verification error:", err);
//       alert(`Failed to verify the report: ${err.message}`);
//       setConfirmId(null);
//       setConfirmType('ISSUE');
//     }
//   };

//   const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, imagePath: string) => {
//     const target = e.target as HTMLImageElement;
//     console.error(`❌ [DEBUG] Image failed to load: ${API_URL}/${imagePath}`);
    
//     target.style.display = 'none';
//     const parent = target.parentElement;
//     if (parent) {
//       parent.innerHTML = `
//         <div class="w-full h-48 bg-gray-100 flex flex-col items-center justify-center p-4">
//           <svg class="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//           </svg>
//           <p class="text-sm text-gray-500 text-center">Image unavailable</p>
//           <p class="text-xs text-gray-400 text-center mt-1">${imagePath}</p>
//           <a href="${API_URL}/${imagePath}" target="_blank" class="text-xs text-blue-500 underline mt-2">Test URL</a>
//         </div>
//       `;
//     }
//   };

//   const handleImageLoad = (imagePath: string) => {
//     console.log(`✅ [DEBUG] Image loaded successfully: ${API_URL}/${imagePath}`);
//   };

//   const getPriorityColor = (priority?: string) => {
//     switch (priority?.toUpperCase()) {
//       case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
//       case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//       case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
//       default: return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="p-6 md:p-8 space-y-6">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//           <div>
//             <Skeleton className="h-8 w-64 mb-2" />
//             <Skeleton className="h-4 w-96" />
//           </div>
//           <div className="flex items-center gap-4 w-full md:w-auto">
//             <Skeleton className="h-10 flex-1 md:flex-none md:w-64" />
//             <Skeleton className="h-10 w-24" />
//           </div>
//         </div>
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {[...Array(6)].map((_, i) => (
//             <Card key={i} className="overflow-hidden">
//               <Skeleton className="h-48 w-full" />
//               <CardHeader>
//                 <Skeleton className="h-6 w-3/4 mb-2" />
//                 <Skeleton className="h-4 w-1/2" />
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <Skeleton className="h-4 w-full" />
//                 <Skeleton className="h-4 w-full" />
//                 <Skeleton className="h-4 w-full" />
//                 <div className="flex justify-between pt-4">
//                   <Skeleton className="h-6 w-20" />
//                   <Skeleton className="h-9 w-20" />
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6 md:p-8">
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertTitle>Error Loading Reports</AlertTitle>
//           <AlertDescription>
//             {error}
//             <div className="mt-4 space-y-3">
//               <p className="text-sm font-medium">Troubleshooting steps:</p>
//               <ol className="text-sm list-decimal pl-4 space-y-2">
//                 <li>
//                   <a href={API_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
//                     Check if backend is running at {API_URL}
//                   </a>
//                 </li>
//                 <li>
//                   <a href={`${API_URL}/api/reports/unverified`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
//                     Test API endpoint directly
//                   </a>
//                 </li>
//                 <li>
//                   <a href={`${API_URL}/uploads/issues/pothole_sample.jpg`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
//                     Test image access: pothole_sample.jpg
//                   </a>
//                 </li>
//               </ol>
//               <div className="flex gap-2 mt-4">
//                 <Button variant="outline" onClick={() => window.location.reload()}>
//                   Retry
//                 </Button>
//                 <Button variant="secondary" onClick={() => {
//                   navigator.clipboard.writeText(`${API_URL}/api/reports/unverified`);
//                   alert("URL copied to clipboard!");
//                 }}>
//                   Copy API URL
//                 </Button>
//               </div>
//             </div>
//           </AlertDescription>
//         </Alert>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 md:p-8 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Verify Citizen Reports</h1>
//           <p className="text-gray-600 mt-1">Review and verify pending issues and violations</p>
//         </div>
//         <div className="flex items-center gap-4 w-full md:w-auto">
//           <div className="relative flex-1 md:flex-none">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <Input
//               placeholder="Search reports..."
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               className="pl-10 w-full md:w-64"
//             />
//           </div>
//           <Badge variant="secondary" className="px-3 py-1.5">
//             {filteredReports.length} pending
//           </Badge>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="flex flex-wrap gap-2">
//         <Button
//           variant={filter === 'ALL' ? 'default' : 'outline'}
//           size="sm"
//           onClick={() => setFilter('ALL')}
//         >
//           All Reports
//         </Button>
//         <Button
//           variant={filter === 'ISSUE' ? 'default' : 'outline'}
//           size="sm"
//           onClick={() => setFilter('ISSUE')}
//         >
//           <AlertTriangle className="h-3.5 w-3.5 mr-2" />
//           Issues
//         </Button>
//         <Button
//           variant={filter === 'VIOLATION' ? 'default' : 'outline'}
//           size="sm"
//           onClick={() => setFilter('VIOLATION')}
//         >
//           <Filter className="h-3.5 w-3.5 mr-2" />
//           Violations
//         </Button>
//       </div>

//       {/* Reports Grid */}
//       {filteredReports.length > 0 ? (
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {filteredReports.map((report) => {
//             const imageUrl = report.image_path ? `${API_URL}/${report.image_path}` : null;
            
//             return (
//               <Card 
//                 key={report.id} 
//                 className="hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200"
//               >
//                 {/* Image Section */}
//                 <div className="relative h-48 w-full overflow-hidden bg-gray-100">
//                   {imageUrl ? (
//                     <>
//                       <img
//                         src={imageUrl}
//                         alt={report.issue}
//                         className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
//                         onLoad={() => handleImageLoad(report.image_path!)}
//                         onError={(e) => handleImageError(e, report.image_path!)}
//                       />
//                       <div className="absolute top-2 right-2">
//                         <Badge 
//                           variant="outline" 
//                           className="bg-white/90 backdrop-blur-sm"
//                         >
//                           {report.report_type}
//                         </Badge>
//                       </div>
//                     </>
//                   ) : (
//                     <div className="w-full h-full flex flex-col items-center justify-center p-4">
//                       <ImageOff className="h-12 w-12 text-gray-400 mb-2" />
//                       <p className="text-sm text-gray-500 text-center">No image available</p>
//                     </div>
//                   )}
//                 </div>

//                 <CardHeader>
//                   <CardTitle className="flex justify-between items-start">
//                     <span className="text-lg font-semibold line-clamp-2">{report.issue}</span>
//                   </CardTitle>
//                   {report.category && (
//                     <p className="text-sm text-gray-600">{report.category}</p>
//                   )}
//                 </CardHeader>

//                 <CardContent className="space-y-4">
//                   {/* Report Details */}
//                   <div className="space-y-3 text-sm">
//                     <div className="flex items-center gap-2">
//                       <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
//                       <div>
//                         <span className="font-medium">Reported by:</span>
//                         <span className="ml-2">{report.citizen}</span>
//                       </div>
//                     </div>
//                     <div className="flex items-start gap-2">
//                       <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
//                       <span className="line-clamp-2">{report.location}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
//                       <span>{new Date(report.created_at).toLocaleDateString('en-US', {
//                         weekday: 'short',
//                         year: 'numeric',
//                         month: 'short',
//                         day: 'numeric'
//                       })}</span>
//                     </div>
//                   </div>

//                   {/* Status and Actions */}
//                   <div className="flex justify-between items-center pt-4 border-t">
//                     <div className="flex flex-wrap gap-2">
//                       <Badge 
//                         variant={report.status === 'PENDING' ? 'destructive' : 'secondary'}
//                         className="font-medium"
//                       >
//                         {report.status.replace('_', ' ')}
//                       </Badge>
//                       {report.priority && (
//                         <Badge 
//                           variant="outline" 
//                           className={getPriorityColor(report.priority)}
//                         >
//                           {report.priority}
//                         </Badge>
//                       )}
//                     </div>
                    
//                     <Button
//                       onClick={() => {
//                         setConfirmId(report.id);
//                         setConfirmType(report.report_type);
//                       }}
//                       className="bg-green-600 hover:bg-green-700"
//                       size="sm"
//                     >
//                       Verify
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       ) : (
//         <div className="text-center py-12 md:py-16">
//           <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
//             <AlertTriangle className="w-full h-full" />
//           </div>
//           <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
//             {query || filter !== 'ALL' ? 'No matching reports found' : 'No pending reports'}
//           </h3>
//           <p className="text-gray-600 max-w-md mx-auto">
//             {query 
//               ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
//               : 'All reports have been verified. New reports will appear here when submitted by citizens.'
//             }
//           </p>
//           {(query || filter !== 'ALL') && (
//             <div className="flex gap-2 justify-center mt-6">
//               {query && (
//                 <Button 
//                   variant="outline" 
//                   onClick={() => setQuery('')}
//                 >
//                   Clear Search
//                 </Button>
//               )}
//               {filter !== 'ALL' && (
//                 <Button 
//                   variant="outline" 
//                   onClick={() => setFilter('ALL')}
//                 >
//                   Show All Reports
//                 </Button>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Verification Dialog */}
//       <Dialog open={confirmId !== null} onOpenChange={() => setConfirmId(null)}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               <AlertTriangle className="h-5 w-5 text-yellow-600" />
//               Confirm Verification
//             </DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4 py-2">
//             <p className="text-gray-700">
//               Are you sure you want to verify this {confirmType?.toLowerCase()} report? 
//               This action will:
//             </p>
//             <ul className="text-sm text-gray-600 space-y-2 ml-4 list-disc">
//               <li>Change status to <strong>{confirmType === 'ISSUE' ? 'IN_PROGRESS' : 'VERIFIED'}</strong></li>
//               <li>Remove it from pending queue</li>
//               <li>Notify the citizen about the update</li>
//               <li>Make it available for further processing</li>
//             </ul>
//             <Alert className="bg-blue-50 border-blue-200">
//               <AlertTriangle className="h-4 w-4 text-blue-600" />
//               <AlertDescription className="text-blue-700">
//                 This action cannot be undone. Please verify all details before proceeding.
//               </AlertDescription>
//             </Alert>
//           </div>
//           <DialogFooter className="gap-2 sm:gap-0">
//             <Button 
//               variant="outline" 
//               onClick={() => setConfirmId(null)}
//               className="flex-1 sm:flex-none"
//             >
//               Cancel
//             </Button>
//             <Button 
//               onClick={handleVerify}
//               className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
//             >
//               Confirm Verification
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Debug Info - Remove in production */}
//       {process.env.NODE_ENV === 'development' && reports.length > 0 && (
//         <details className="mt-8 p-4 bg-gray-50 rounded-lg border">
//           <summary className="cursor-pointer font-medium text-sm text-gray-700">
//             Debug Information
//           </summary>
//           <div className="mt-3 text-xs space-y-3">
//             <div>
//               <p className="font-medium">API Status:</p>
//               <p>Endpoint: {API_URL}/api/reports/unverified</p>
//               <p>Total Reports: {reports.length}</p>
//               <p>Filtered: {filteredReports.length}</p>
//             </div>
//             <div>
//               <p className="font-medium">Sample Report Data:</p>
//               {reports.slice(0, 1).map((report, idx) => (
//                 <pre key={idx} className="mt-2 bg-white p-3 rounded border text-xs overflow-auto">
//                   {JSON.stringify({
//                     id: report.id,
//                     issue: report.issue,
//                     type: report.report_type,
//                     image_path: report.image_path,
//                     constructed_url: report.image_path ? `${API_URL}/${report.image_path}` : null,
//                     citizen: report.citizen,
//                     status: report.status
//                   }, null, 2)}
//                 </pre>
//               ))}
//             </div>
//           </div>
//         </details>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ImageOff, User, MapPin, Clock, AlertCircle, Search, Filter } from "lucide-react";

interface Report {
  id: string;
  issue: string;
  location: string;
  status: string;
  citizen: string;
  citizen_id: string;
  image_path?: string;
  image_url?: string;
  created_at: string;
  priority?: string;
  category?: string;
  report_type: 'ISSUE' | 'VIOLATION';
}

const API_URL = "";

export default function VerifyReport() {
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmType, setConfirmType] = useState<'ISSUE' | 'VIOLATION'>('ISSUE');
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'ISSUE' | 'VIOLATION'>('ALL');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`🔍 [DEBUG] Fetching from: ${API_URL}/api/reports/unverified`);
        
        const response = await fetch(`${API_URL}/api/reports/unverified`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("🔴 [DEBUG] Error response:", errorText);
          throw new Error(`Server returned ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("✅ [DEBUG] API Response:", data);
        
        if (data.reports && Array.isArray(data.reports)) {
          console.log("📸 [DEBUG] Image Analysis:");
          data.reports.forEach((report: Report, index: number) => {
            if (report.image_path || report.image_url) {
              const constructedUrl = report.image_url 
                ? (report.image_url.startsWith('http') ? report.image_url : `${API_URL}${report.image_url}`)
                : report.image_path 
                  ? (() => {
                      const cleanPath = report.image_path!.replace(/^\/+/, '');
                      if (cleanPath.includes('issues/') || cleanPath.includes('violations/')) {
                        return `${API_URL}/${cleanPath}`;
                      }
                      if (cleanPath.startsWith('uploads/')) {
                        return `${API_URL}/${cleanPath}`;
                      }
                      const folder = report.report_type === 'VIOLATION' ? 'violations' : 'issues';
                      return `${API_URL}/${folder}/${cleanPath}`;
                    })()
                  : null;
              
              console.log(`  Report ${index + 1} (${report.report_type}):`, {
                id: report.id,
                issue: report.issue,
                imagePath: report.image_path,
                imageUrl: report.image_url,
                constructedUrl: constructedUrl,
                category: report.category
              });
            } else {
              console.log(`  Report ${index + 1} (${report.report_type}): NO IMAGE`, {
                id: report.id,
                issue: report.issue
              });
            }
          });
          
          setReports(data.reports);
        } else {
          throw new Error("Invalid response format: missing 'reports' array");
        }
        
      } catch (err: any) {
        console.error("🔴 [DEBUG] Fetch error:", err);
        const errorMessage = err.message || "Unknown error occurred";
        setError(`Failed to load reports: ${errorMessage}. Please make sure the backend server at ${API_URL} is running.`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  // Image URL builder - fixed to match actual backend file structure
  const getImageUrl = (report: Report) => {
    console.log(`🖼️ Building URL for report:`, {
      id: report.id,
      issue: report.issue,
      image_path: report.image_path,
      image_url: report.image_url,
      report_type: report.report_type
    });

    // Priority 1: Use image_url if available
    if (report.image_url) {
      const url = report.image_url.startsWith('http') 
        ? report.image_url 
        : `${API_URL}${report.image_url}`;
      console.log(`✅ Using image_url:`, url);
      return url;
    }
    
    // Priority 2: Use image_path if available
    if (report.image_path) {
      let cleanPath = report.image_path.replace(/^\/+/, '');
      console.log(`🔧 Original path:`, cleanPath);
      
      // Fix duplicate folder names like "uploads/issues/issues/" -> "uploads/issues/"
      cleanPath = cleanPath.replace(/\/(issues|violations)\/(issues|violations)\//, '/$1/');
      console.log(`🔧 After removing duplicates:`, cleanPath);
      
      // If path already starts with 'uploads/', use it directly
      if (cleanPath.startsWith('uploads/')) {
        const url = `${API_URL}/${cleanPath}`;
        console.log(`✅ Using direct uploads path:`, url);
        return url;
      }
      
      // If path starts with "issues/" or "violations/", prepend "uploads/"
      if (cleanPath.startsWith('issues/') || cleanPath.startsWith('violations/')) {
        const url = `${API_URL}/uploads/${cleanPath}`;
        console.log(`✅ Constructed URL (prepended uploads/):`, url);
        return url;
      }
      
      // Otherwise, construct the full path based on report type
      const folder = report.report_type === 'VIOLATION' ? 'violations' : 'issues';
      const url = `${API_URL}/uploads/${folder}/${cleanPath}`;
      console.log(`✅ Constructed URL (with folder):`, url);
      return url;
    }
    
    // Priority 3: Fallback images based on category
    const fallbackImages: Record<string, string> = {
      'pothole': '/uploads/issues/pothole_sample.jpg',
      'parking': '/uploads/violations/parking_sample.jpg',
      'garbage': '/uploads/issues/garbage.jpg',
      'water': '/uploads/issues/water_logging.jpg',
      'streetlight': '/uploads/issues/street_light.jpg',
      'dumping': '/uploads/issues/illegal_dumping.jpg',
      'graffiti': '/uploads/issues/graffiti.jpg',
      'helmet': '/uploads/violations/no_helmet_sample.jpg',
      'sanitation': '/uploads/issues/garbage.jpg',
    };
    
    const category = (report.category || report.issue || '').toLowerCase();
    for (const [key, path] of Object.entries(fallbackImages)) {
      if (category.includes(key)) {
        const url = `${API_URL}${path}`;
        console.log(`✅ Using fallback image for ${key}:`, url);
        return url;
      }
    }
    
    // Priority 4: Default fallback
    const defaultUrl = `${API_URL}/uploads/issues/default.jpg`;
    console.log(`⚠️ Using default fallback:`, defaultUrl);
    return defaultUrl;
  };

  const filteredReports = reports.filter((report) => {
    if (filter !== 'ALL' && report.report_type !== filter) return false;
    
    if (!query) return true;
    
    const searchLower = query.toLowerCase();
    return (
      report.issue.toLowerCase().includes(searchLower) ||
      report.location.toLowerCase().includes(searchLower) ||
      report.citizen.toLowerCase().includes(searchLower) ||
      (report.category && report.category.toLowerCase().includes(searchLower))
    );
  });

  const handleVerify = async () => {
    if (confirmId === null) return;
    try {
      console.log(`🔍 [DEBUG] Verifying ${confirmType} report: ${confirmId}`);
      
      const response = await fetch(
        `${API_URL}/api/reports/${confirmId}/verify?report_type=${confirmType}`,
        { method: 'PUT' }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Verification failed: ${errorText}`);
      }
      
      setReports(prev => prev.filter(report => report.id !== confirmId));
      setConfirmId(null);
      setConfirmType('ISSUE');
      
      alert("✅ Report verified successfully! It has been moved to the processing queue.");
    } catch (err: any) {
      console.error("🔴 [DEBUG] Verification error:", err);
      alert(`Failed to verify the report: ${err.message}`);
      setConfirmId(null);
      setConfirmType('ISSUE');
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Skeleton className="h-10 flex-1 md:flex-none md:w-64" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between pt-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Reports</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium">Troubleshooting steps:</p>
              <ol className="text-sm list-decimal pl-4 space-y-2">
                <li>
                  <a href={API_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Check if backend is running at {API_URL}
                  </a>
                </li>
                <li>
                  <a href={`${API_URL}/api/reports/unverified`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Test API endpoint directly
                  </a>
                </li>
                <li>
                  <a href={`${API_URL}/uploads/issues/pothole_sample.jpg`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Test image access: pothole_sample.jpg
                  </a>
                </li>
              </ol>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Verify Citizen Reports</h1>
          <p className="text-gray-600 mt-1">Review and verify pending issues and violations</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search reports..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 w-full md:w-64"
            />
          </div>
          <Badge variant="secondary" className="px-3 py-1.5">
            {filteredReports.length} pending
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'ALL' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('ALL')}
        >
          All Reports
        </Button>
        <Button
          variant={filter === 'ISSUE' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('ISSUE')}
        >
          <AlertTriangle className="h-3.5 w-3.5 mr-2" />
          Issues
        </Button>
        <Button
          variant={filter === 'VIOLATION' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('VIOLATION')}
        >
          <Filter className="h-3.5 w-3.5 mr-2" />
          Violations
        </Button>
      </div>

      {filteredReports.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => {
            const imageUrl = getImageUrl(report);
            
            return (
              <Card 
                key={`${report.report_type}-${report.id}-${report.created_at}`}
                className="hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200"
              >
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={report.issue}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="h-48 w-full bg-gray-100 flex flex-col items-center justify-center p-4">
                            <svg class="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <p class="text-xs text-gray-500 text-center">Image not found</p>
                            <p class="text-xs text-gray-400 text-center mt-1">${report.category || report.issue}</p>
                          </div>
                        `;
                      }
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge 
                      variant="outline" 
                      className="bg-white/90 backdrop-blur-sm"
                    >
                      {report.report_type}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span className="text-lg font-semibold line-clamp-2">{report.issue}</span>
                  </CardTitle>
                  {report.category && (
                    <p className="text-sm text-gray-600">{report.category}</p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Reported by:</span>
                        <span className="ml-2">{report.citizen}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{report.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span>{new Date(report.created_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant={report.status === 'PENDING' ? 'destructive' : 'secondary'}
                        className="font-medium"
                      >
                        {report.status.replace('_', ' ')}
                      </Badge>
                      {report.priority && (
                        <Badge 
                          variant="outline" 
                          className={getPriorityColor(report.priority)}
                        >
                          {report.priority}
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => {
                        setConfirmId(report.id);
                        setConfirmType(report.report_type);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      Verify
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 md:py-16">
          <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
            <AlertTriangle className="w-full h-full" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
            {query || filter !== 'ALL' ? 'No matching reports found' : 'No pending reports'}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {query 
              ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
              : 'All reports have been verified. New reports will appear here when submitted by citizens.'
            }
          </p>
          {(query || filter !== 'ALL') && (
            <div className="flex gap-2 justify-center mt-6">
              {query && (
                <Button 
                  variant="outline" 
                  onClick={() => setQuery('')}
                >
                  Clear Search
                </Button>
              )}
              {filter !== 'ALL' && (
                <Button 
                  variant="outline" 
                  onClick={() => setFilter('ALL')}
                >
                  Show All Reports
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <Dialog open={confirmId !== null} onOpenChange={() => setConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Confirm Verification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-gray-700">
              Are you sure you want to verify this {confirmType?.toLowerCase()} report? 
              This action will:
            </p>
            <ul className="text-sm text-gray-600 space-y-2 ml-4 list-disc">
              <li>Change status to <strong>{confirmType === 'ISSUE' ? 'IN_PROGRESS' : 'VERIFIED'}</strong></li>
              <li>Remove it from pending queue</li>
              <li>Notify the citizen about the update</li>
              <li>Make it available for further processing</li>
            </ul>
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                This action cannot be undone. Please verify all details before proceeding.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setConfirmId(null)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleVerify}
              className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
            >
              Confirm Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}