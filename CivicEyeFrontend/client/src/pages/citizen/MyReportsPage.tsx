//MyReportsPage.tsx
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, CheckCircle, AlertTriangle, ImageOff, User, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";

interface Report {
  id: number | string;
  category: string;
  description: string;
  location: string;
  date: string;
  status: string;
  image_path?: string;
  image_url?: string;
  report_type: 'ISSUE' | 'VIOLATION';
  citizen?: string;
  citizen_id?: number | string;
}

interface UserData {
  id: number;
  email: string;
  fullName: string;
  role: string;
  aadharNumber?: string;
  phoneNumber?: string;
}

const API_BASE_URL = "http://localhost:5000";

export default function MyReportsPage() {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('civiceye_user');
      if (storedUser) {
        try {
          const userData: UserData = JSON.parse(storedUser);
          setCurrentUser(userData);
          setUserId(userData.id);
          console.log("👤 User loaded:", userData);
        } catch (error) {
          console.error("❌ Failed to parse user data:", error);
        }
      }
    };

    loadUser();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'civiceye_user') {
        loadUser();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const { data, isLoading, isError, refetch } = useQuery<Report[]>({
    queryKey: ["myReports", userId],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/reports`);
        if (!res.ok) {
          throw new Error(`Failed to fetch reports: ${res.status} ${res.statusText}`);
        }
        
        const allReports: Report[] = await res.json();
        
        if (!userId) {
          console.log("👁 Admin view: Showing all reports");
          return allReports;
        }
        
        const userReports = allReports.filter((report: Report) => {
          const reportUserId = String(report.citizen_id);
          const currentUserId = String(userId);
          return reportUserId === currentUserId;
        });
        
        console.log(`👤 User ${userId}: Found ${userReports.length} out of ${allReports.length} total reports`);
        
        if (userReports.length === 0 && allReports.length > 0) {
          console.log("⚠ No reports matched user ID. Checking available user IDs:");
          const uniqueUserIds = [...new Set(allReports.map(r => r.citizen_id))];
          console.log("Available user IDs in reports:", uniqueUserIds);
          console.log("Current user ID:", userId);
        }
        
        return userReports;
        
      } catch (error) {
        console.error("❌ Error fetching reports:", error);
        throw error;
      }
    },
    enabled: true,
  });

  const getImageUrl = (report: Report) => {
    if (report.image_url) {
      return report.image_url.startsWith('http') 
        ? report.image_url 
        : `${API_BASE_URL}${report.image_url}`;
    }
    
    if (report.image_path) {
      const cleanPath = report.image_path.replace(/^\/+/, '');
      
      if (cleanPath.startsWith('uploads/')) {
        return `${API_BASE_URL}/${cleanPath}`;
      }
      
      return `${API_BASE_URL}/uploads/${cleanPath}`;
    }
    
    const fallbackImages: Record<string, string> = {
      'pothole': '/uploads/issues/pothole_sample.jpg',
      'parking': '/uploads/violations/parking_sample.jpg',
      'garbage': '/uploads/issues/garbage.jpg',
      'water': '/uploads/issues/water_logging.jpg',
      'streetlight': '/uploads/issues/street_light.jpg',
      'dumping': '/uploads/issues/illegal_dumping.jpg',
      'graffiti': '/uploads/issues/graffiti.jpg',
    };
    
    const category = report.category.toLowerCase();
    for (const [key, path] of Object.entries(fallbackImages)) {
      if (category.includes(key)) {
        return `${API_BASE_URL}${path}`;
      }
    }
    
    return `${API_BASE_URL}/uploads/issues/default.jpg`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Reports</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold">Failed to load reports</p>
            <p className="text-sm mt-1">Please make sure the backend server is running at {API_BASE_URL}</p>
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          className="mt-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentUser && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold">{currentUser.fullName}</span> 
                <span className="text-blue-600 dark:text-blue-400 ml-2">({currentUser.role})</span>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  Viewing {data?.length || 0} {data?.length === 1 ? 'report' : 'reports'}
                </p>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                User ID: {userId}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {!currentUser && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You are not logged in. Showing all reports. 
            <a href="/login" className="ml-2 font-semibold underline">
              Log in to see your reports
            </a>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {currentUser ? 'My Reports' : 'All Reports'}
        </h2>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {data && data.length > 0 ? (
          data.map((report) => {
            const imageUrl = getImageUrl(report);
            
            return (
              <Card
                key={`${report.report_type}-${report.id}`}
                className="hover:shadow-xl transition-shadow border overflow-hidden flex flex-col"
              >
                <div className="h-40 w-full overflow-hidden bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={report.category}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="h-40 w-full bg-gray-100 flex flex-col items-center justify-center">
                            <svg class="h-10 w-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <p class="text-xs text-gray-500">Image not found</p>
                            <p class="text-xs text-gray-400 mt-1">${report.category}</p>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>

                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-md">
                    {report.status === "Resolved" || report.status === "VERIFIED" || report.status === "COMPLETED" ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <AlertTriangle className="text-yellow-500" size={20} />
                    )}
                    <span className="capitalize">{report.category}</span>
                    <Badge 
                      variant="outline" 
                      className="ml-auto text-xs"
                    >
                      {report.report_type}
                    </Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-sm text-muted-foreground flex-grow flex flex-col">
                  <p className="mb-4 line-clamp-2 flex-grow">
                    {report.description || "No description provided"}
                  </p>
                  
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="flex-shrink-0" /> 
                      <span className="truncate" title={report.location}>
                        {report.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="flex-shrink-0" /> 
                      <span>{new Date(report.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                    {report.citizen && !currentUser && (
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <User size={14} className="flex-shrink-0" />
                        <span>Submitted by: {report.citizen}</span>
                      </div>
                    )}
                  </div>
                  
                  <Badge
                    className={`mt-4 self-start ${
                      report.status === "Resolved" || report.status === "VERIFIED" || report.status === "COMPLETED"
                        ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-200"
                        : report.status === "IN_PROGRESS" || report.status === "UNDER_REVIEW"
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {report.status.replace('_', ' ')}
                  </Badge>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-16">
            <div className="mx-auto max-w-md space-y-4">
              <ImageOff className="h-16 w-16 text-gray-400 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No reports found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {currentUser 
                  ? "You haven't submitted any reports yet. Submit your first report!"
                  : "No reports available. Log in to submit a report."}
              </p>
              {currentUser && (
                <a 
                  href="/report" 
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Report
                </a>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}