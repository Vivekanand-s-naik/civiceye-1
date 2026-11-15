// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Camera, AlertCircle, UserCheck } from "lucide-react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";

// export default function ViolatorDetection() {
//   const [detected, setDetected] = useState(false);
//   const [violator, setViolator] = useState<any>(null);
//   const [dialogOpen, setDialogOpen] = useState(false);

//   const mockDetection = () => {
//     setDetected(false);
//     setTimeout(() => {
//       setDetected(true);
//       setViolator({
//         name: "Unknown (Matched: Aadhar 4829)",
//         age: 32,
//         violation: "Illegal Dumping",
//         location: "MG Road",
//         confidence: "92%",
//         reportId: 101,
//       });
//     }, 2000);
//   };

//   return (
//     <div className="p-8 space-y-6">
//       <h1 className="text-2xl font-bold">Violator Detection</h1>
//       <Card className="p-6 text-center">
//         <CardHeader className="flex flex-col items-center gap-2">
//           <Camera className="h-10 w-10 text-indigo-600" />
//           <CardTitle>Live Camera Feed</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {!detected ? (
//             <>
//               <p>Scanning for violators using facial recognition...</p>
//               <Button onClick={mockDetection} className="bg-indigo-600 text-white">
//                 Start Detection
//               </Button>
//             </>
//           ) : (
//             <>
//               <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
//               <p><b>Name:</b> {violator.name}</p>
//               <p><b>Age:</b> {violator.age}</p>
//               <p><b>Violation:</b> {violator.violation}</p>
//               <p><b>Location:</b> {violator.location}</p>
//               <p><b>Confidence:</b> {violator.confidence}</p>
//               <Button onClick={() => setDialogOpen(true)} className="mt-2">
//                 View Full Details
//               </Button>
//             </>
//           )}
//         </CardContent>
//       </Card>

//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Violator Full Record</DialogTitle>
//           </DialogHeader>
//           <CardContent className="space-y-2">
//             <p><b>Report ID:</b> {violator?.reportId}</p>
//             <p><b>Name:</b> {violator?.name}</p>
//             <p><b>Age:</b> {violator?.age}</p>
//             <p><b>Violation:</b> {violator?.violation}</p>
//             <p><b>Location:</b> {violator?.location}</p>
//             <p><b>Match Confidence:</b> {violator?.confidence}</p>
//           </CardContent>
//           <DialogFooter>
//             <Button onClick={() => setDialogOpen(false)}>Close</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, AlertCircle, Loader2, ServerCrash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// --- Type Definition for API Response ---
interface Violator {
  id?: number;
  violator_id?: number;
  full_name?: string;
  name?: string;
  match_confidence: number;
  face_image_path?: string;
  report_id?: number;
  violation: string;
  location: string;
  aadhar_number: string;
}

// --- API Configuration ---

const API_URL = "";

export default function ViolatorDetection() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [violator, setViolator] = useState<Violator | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDetection = async () => {
    setIsDetecting(true);
    setError(null);
    setViolator(null);
    try {
      const response = await fetch(`${API_URL}/api/violators/detect-random`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to find a violator.");
      }
      const data: Violator = await response.json();
      setViolator(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsDetecting(false);
    }
  };

  const renderDetectionState = () => {
    if (isDetecting) {
      return (
        <div className="flex flex-col items-center gap-4 text-muted-foreground animate-pulse">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p>Scanning for violators using facial recognition...</p>
        </div>
      );
    }

    if (error) {
       return (
         <Alert variant="destructive">
           <ServerCrash className="h-4 w-4" />
           <AlertTitle>Detection Failed</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
       );
    }

    if (violator) {
      return (
        <div className="space-y-3 text-left">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-4" />
          <div className="flex gap-4 items-center">
            <img 
              src={violator.face_image_path ? `/${violator.face_image_path.replace(/^\/+/, '')}` : "/uploads/violations/parking_sample.jpg"} 
              alt="Detected Violator"
              className="h-24 w-24 rounded-lg border object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/uploads/violations/parking_sample.jpg";
              }}
            />
            <div className="space-y-1">
              <p><b>Name:</b> {violator.full_name || violator.name || "Unknown"}</p>
              <p><b>Aadhar Match:</b> **** **** {violator.aadhar_number?.slice(-4)}</p>
              <p><b>Violation:</b> {violator.violation}</p>
              <p><b>Confidence:</b> {(violator.match_confidence * 100).toFixed(1)}%</p>
            </div>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="w-full mt-4">
            View Full Details
          </Button>
        </div>
      );
    }

    return (
      <>
        <p className="text-muted-foreground">System is ready to scan for known violators.</p>
        <Button onClick={startDetection} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Start Detection
        </Button>
      </>
    );
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Real-Time Violator Detection</h1>
      <Card className="p-6">
        <CardHeader className="flex flex-col items-center gap-2">
          <Camera className="h-10 w-10 text-indigo-600" />
          <CardTitle>Live Camera Feed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {renderDetectionState()}
        </CardContent>
      </Card>

      {/* Show scan again button only after a successful detection */}
      {violator && !isDetecting && (
          <div className="text-center">
             <Button onClick={startDetection} variant="outline">Scan Again</Button>
          </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Violator Full Record</DialogTitle>
          </DialogHeader>
          {violator && (
            <div className="space-y-2">
              <p><b>Report ID:</b> {violator.report_id}</p>
              <p><b>Name:</b> {violator.full_name}</p>
              <p><b>Aadhar Match:</b> **** **** {violator.aadhar_number?.slice(-4)}</p>
              <p><b>Violation:</b> {violator.violation}</p>
              <p><b>Location:</b> {violator.location}</p>
              <p><b>Match Confidence:</b> {(violator.match_confidence * 100).toFixed(1)}%</p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}