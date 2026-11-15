import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  ImageOff,
  User,
  RefreshCw,
  Search,
  Filter,
  Maximize2,
  PlusCircle,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";

interface Report {
  id: number | string;
  category: string;
  issue?: string;
  title?: string;
  description: string;
  location: string;
  address?: string;
  date: string;
  created_at?: string;
  status: string;
  priority?: string;
  image_path?: string;
  image_url?: string;
  report_type: "ISSUE" | "VIOLATION";
  citizen?: string;
  citizen_id?: number | string;
}

export default function MyReportsPage() {
  const { currentUser } = useUser();
  const userId = currentUser?.id || 1;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; category: string } | null>(null);

  // Fetch reports for the citizen from actual DB
  const {
    data: reports = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Report[]>({
    queryKey: ["myReports", userId],
    queryFn: async () => {
      const endpoint = currentUser?.role === "admin" ? "/api/reports" : `/api/my-reports?user_id=${userId}`;
      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error(`Failed to fetch reports: ${res.status}`);
      }
      return res.json();
    },
  });

  const getImageUrl = (report: Report) => {
    if (report.image_url) {
      return report.image_url.startsWith("http") ? report.image_url : report.image_url;
    }
    if (report.image_path) {
      const clean = report.image_path.replace(/^\/+/, "");
      return clean.startsWith("uploads/") ? `/${clean}` : `/uploads/${clean}`;
    }
    return "/uploads/issues/default.jpg";
  };

  const filteredReports = reports.filter((r) => {
    const titleMatch = (r.issue || r.title || r.category || "").toLowerCase().includes(search.toLowerCase());
    const locMatch = (r.location || r.address || "").toLowerCase().includes(search.toLowerCase());
    const descMatch = (r.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesSearch = titleMatch || locMatch || descMatch;

    if (statusFilter === "ALL") return matchesSearch;
    if (statusFilter === "RESOLVED") {
      return matchesSearch && (r.status.toUpperCase() === "RESOLVED" || r.status.toUpperCase() === "VERIFIED");
    }
    if (statusFilter === "IN_PROGRESS") {
      return matchesSearch && r.status.toUpperCase() === "IN_PROGRESS";
    }
    if (statusFilter === "PENDING") {
      return matchesSearch && r.status.toUpperCase() === "PENDING";
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {currentUser?.role === "admin" ? "All Platform Reports" : "My Civic Reports"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {currentUser?.role === "admin"
              ? "Auditing all citizen observations recorded in the municipal database"
              : "Track your reports from initial submission to verified resolution"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <a href="/report">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, location, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {["ALL", "PENDING", "IN_PROGRESS", "RESOLVED"].map((status) => (
              <Button
                key={status}
                type="button"
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={`text-xs h-8 ${
                  statusFilter === status ? "bg-blue-600 text-white" : "text-muted-foreground"
                }`}
              >
                {status.replace("_", " ")}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to connect to the database API. Please check server status.</AlertDescription>
        </Alert>
      ) : filteredReports.length > 0 ? (
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredReports.map((report) => {
            const imageUrl = getImageUrl(report);
            const isResolved =
              report.status.toUpperCase() === "RESOLVED" ||
              report.status.toUpperCase() === "VERIFIED" ||
              report.status.toUpperCase() === "COMPLETED";

            return (
              <Card
                key={`${report.report_type}-${report.id}`}
                className="hover:shadow-xl transition-all border overflow-hidden flex flex-col group rounded-xl"
              >
                {/* File / Image Preview Container with Click-to-Enlarge */}
                <div
                  className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
                  onClick={() =>
                    setSelectedImage({
                      url: imageUrl,
                      title: report.issue || report.category,
                      category: report.category,
                    })
                  }
                >
                  <img
                    src={imageUrl}
                    alt={report.category}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/uploads/issues/default.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium backdrop-blur-xs">
                      <Maximize2 className="h-3.5 w-3.5" /> Click to Enlarge Preview
                    </span>
                  </div>

                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <Badge className="bg-black/70 text-white backdrop-blur-xs text-[10px] uppercase font-bold tracking-wider">
                      {report.report_type}
                    </Badge>
                    <Badge
                      className={`text-[10px] font-bold ${
                        isResolved
                          ? "bg-emerald-600 text-white"
                          : report.status.toUpperCase() === "IN_PROGRESS"
                          ? "bg-blue-600 text-white"
                          : "bg-amber-600 text-white"
                      }`}
                    >
                      {report.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    {isResolved ? (
                      <CheckCircle className="text-emerald-500 h-4 w-4 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="text-amber-500 h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="line-clamp-1">{report.issue || report.category}</span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 pt-0 text-xs text-muted-foreground flex-grow flex flex-col space-y-3">
                  <p className="line-clamp-2 text-slate-700 dark:text-slate-300">
                    {report.description || "No description provided."}
                  </p>

                  <div className="space-y-1.5 text-xs pt-2 border-t mt-auto">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="flex-shrink-0 text-blue-500" />
                      <span className="truncate" title={report.address || report.location}>
                        {report.address || report.location}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-muted-foreground" />
                        <span>{new Date(report.date || report.created_at || Date.now()).toLocaleDateString()}</span>
                      </div>
                      {report.citizen && (
                        <div className="flex items-center gap-1 text-slate-500">
                          <User size={12} />
                          <span>{report.citizen}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      ) : (
        <Card className="text-center py-16 border-dashed">
          <div className="max-w-md mx-auto space-y-3">
            <ImageOff className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-bold">No Reports Found</h3>
            <p className="text-sm text-muted-foreground">
              {search
                ? `No reports matched your search query "${search}".`
                : "You have not submitted any civic reports yet."}
            </p>
            <a href="/report">
              <Button className="mt-2 bg-blue-600">Submit New Issue</Button>
            </a>
          </div>
        </Card>
      )}

      {/* Image Preview Lightbox Dialog */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-3xl p-4 bg-slate-950 text-white border-slate-800">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-lg font-bold text-white flex items-center justify-between">
                <span>{selectedImage.title}</span>
                <Badge variant="outline" className="text-xs text-white border-white/30">
                  {selectedImage.category}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="rounded-lg overflow-hidden max-h-[70vh] flex items-center justify-center bg-black">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-h-[70vh] w-auto max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/uploads/issues/default.jpg";
                }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
              <span>High Resolution Evidence Preview</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedImage(null)}
                className="text-white border-slate-700 hover:bg-slate-800"
              >
                Close Preview
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
