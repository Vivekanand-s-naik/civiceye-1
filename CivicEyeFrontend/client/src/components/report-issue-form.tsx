
// import { useState, useRef, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Camera, Upload, MapPin, X, AlertTriangle, FileText, Loader2, Sparkles, User, LogIn, CheckCircle2 } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// const API_URL = "";

// interface CategoryPrediction {
//   predicted_category: string;
//   confidence: number;
//   all_scores: { [key: string]: number };
//   detected_features?: any[];
// }

// interface UserData {
//   id: number;
//   email: string;
//   fullName: string;
//   role: string;
//   aadharNumber?: string;
//   phoneNumber?: string;
// }

// const issueCategories = [
//   { value: "garbage", label: "Garbage Collection" },
//   { value: "pothole", label: "Pothole" },
//   { value: "streetlight", label: "Street Light" },
//   { value: "water", label: "Water Leakage" },
//   { value: "road", label: "Road Damage" },
//   { value: "dumping", label: "Illegal Dumping" },
//   { value: "graffiti", label: "Graffiti" },
//   { value: "other", label: "Other" },
// ];

// const violationCategories = [
//   { value: "parking", label: "Parking Violation" },
//   { value: "noise", label: "Noise Pollution" },
//   { value: "construction", label: "Illegal Construction" },
//   { value: "encroachment", label: "Public Space Encroachment" },
//   { value: "littering", label: "Public Littering" },
//   { value: "traffic", label: "Traffic Rule Violation" },
//   { value: "other", label: "Other Violation" },
// ];

// const categoryFields: any = {
//   garbage: [
//     { name: "binNumber", label: "Bin Number", type: "text", placeholder: "Enter bin number" },
//     { name: "overflowLevel", label: "Overflow Level", type: "select", options: ["Low", "Medium", "High", "Critical"] }
//   ],
//   pothole: [
//     { name: "severity", label: "Severity", type: "select", options: ["Minor", "Moderate", "Major", "Critical"] },
//     { name: "diameter", label: "Diameter (cm)", type: "number", placeholder: "Approximate diameter" }
//   ],
//   streetlight: [
//     { name: "poleNumber", label: "Pole Number", type: "text", placeholder: "Street light pole number" },
//     { name: "issueType", label: "Issue Type", type: "select", options: ["Not Working", "Flickering", "Damaged", "Missing"] }
//   ],
//   water: [
//     { name: "severity", label: "Severity", type: "select", options: ["Minor", "Moderate", "Major", "Critical"] },
//     { name: "waterSource", label: "Water Source", type: "select", options: ["Pipeline", "Tap", "Underground", "Unknown"] }
//   ],
//   road: [
//     { name: "damageType", label: "Damage Type", type: "select", options: ["Crack", "Depression", "Edge Break", "Surface Wear"] },
//     { name: "length", label: "Length (meters)", type: "number", placeholder: "Approximate length" }
//   ],
//   dumping: [
//     { name: "wasteType", label: "Waste Type", type: "select", options: ["Household", "Construction", "Electronic", "Hazardous", "Mixed"] },
//     { name: "estimatedVolume", label: "Volume", type: "select", options: ["Small", "Medium", "Large", "Very Large"] }
//   ],
//   graffiti: [
//     { name: "surfaceType", label: "Surface Type", type: "select", options: ["Wall", "Public Property", "Vehicle", "Other"] },
//     { name: "size", label: "Size", type: "select", options: ["Small", "Medium", "Large"] }
//   ],
//   parking: [
//     { name: "vehicleNumber", label: "Vehicle Number", type: "text", placeholder: "Enter vehicle number" },
//     { name: "violationType", label: "Violation Type", type: "text", placeholder: "Describe violation" }
//   ],
//   noise: [
//     { name: "noiseType", label: "Noise Type", type: "select", options: ["Construction", "Vehicle", "Music", "Industrial", "Other"] },
//     { name: "duration", label: "Duration", type: "select", options: ["< 30 mins", "30-60 mins", "1-2 hours", "> 2 hours"] }
//   ],
//   construction: [
//     { name: "constructionType", label: "Construction Type", type: "select", options: ["Residential", "Commercial", "Renovation", "Demolition"] },
//     { name: "permitNumber", label: "Permit Number (if known)", type: "text", placeholder: "Enter permit number" }
//   ],
//   encroachment: [
//     { name: "encroachmentType", label: "Encroachment Type", type: "select", options: ["Temporary Structure", "Permanent Structure", "Vehicle", "Goods", "Other"] },
//     { name: "area", label: "Area (sq meters)", type: "number", placeholder: "Approximate area" }
//   ],
//   littering: [
//     { name: "litterType", label: "Litter Type", type: "select", options: ["Plastic", "Food Waste", "Cigarette Butts", "Glass", "Mixed"] }
//   ],
//   traffic: [
//     { name: "violationType", label: "Violation Type", type: "text", placeholder: "Describe violation" },
//     { name: "vehicleNumber", label: "Vehicle Number (if visible)", type: "text", placeholder: "Enter vehicle number" }
//   ]
// };

// export function ReportIssueForm(props: { onSubmit: (data: any) => void }) {
//   const [step, setStep] = useState(1);
//   const [reportType, setReportType] = useState<"issue" | "violation" | "">("");
//   const [category, setCategory] = useState("");
//   const [formData, setFormData] = useState<any>({});
//   const [image, setImage] = useState<string>("");
//   const [location, setLocation] = useState({ address: "", lat: 0, lng: 0 });
//   const [showCamera, setShowCamera] = useState(false);
//   const [predicting, setPredicting] = useState(false);
//   const [prediction, setPrediction] = useState<CategoryPrediction | null>(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState<string>("");
//   const { onSubmit } = props;
//   const [currentUser, setCurrentUser] = useState<UserData | null>(() => {
//     const stored = localStorage.getItem('civiceye_user');
//     if (stored) {
//       try {
//         const parsed = JSON.parse(stored);
//         // QUICK FIX: If no ID, add a default one
//         if (!parsed.id && parsed.email === 'citizen@civiceye.com') {
//           parsed.id = 2; // Replace with actual ID from database
//         }
//         console.log("🔍 Loaded from localStorage:", parsed);
//         return parsed;
//       } catch (err) {
//         console.error("Failed to parse user from localStorage:", err);
//         return null;
//       }
//     }
//     return null;
//   });
  
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const streamRef = useRef<MediaStream | null>(null);

//   const currentCategories = reportType === "issue" ? issueCategories : violationCategories;
  
//   useEffect(() => {
//     console.log("🔐 Current User State:", {
//       isLoggedIn: !!currentUser,
//       userId: currentUser?.id,
//       userEmail: currentUser?.email,
//       userName: currentUser?.fullName,
//       role: currentUser?.role,
//       fullUserObject: currentUser
//     });
    
//     if (!currentUser) {
//       const stored = localStorage.getItem('civiceye_user');
//       console.log("📦 localStorage contents:", stored);
//       if (stored) {
//         try {
//           const user = JSON.parse(stored);
//           console.log("✅ Restoring user from localStorage:", user);
//           setCurrentUser(user);
//         } catch (err) {
//           console.error("Failed to restore user from localStorage:", err);
//         }
//       }
//     } else {
//       console.log("✅ User already in state:", currentUser);
//     }
//   }, []);

//   useEffect(() => {
//     return () => {
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, []);

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         video: { 
//           facingMode: "environment",
//           width: { ideal: 1920 },
//           height: { ideal: 1080 }
//         },
//         audio: false 
//       });
      
//       setShowCamera(true);
      
//       setTimeout(() => {
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//           streamRef.current = stream;
//           videoRef.current.play().catch(err => {
//             console.error("Error playing video:", err);
//             setError("Failed to start video preview");
//           });
//         }
//       }, 100);
//     } catch (err) {
//       console.error("Camera error:", err);
//       setError("Unable to access camera. Please check permissions.");
//       setShowCamera(false);
//     }
//   };

//   const capturePhoto = () => {
//     if (videoRef.current) {
//       const canvas = document.createElement("canvas");
//       canvas.width = videoRef.current.videoWidth;
//       canvas.height = videoRef.current.videoHeight;
//       const ctx = canvas.getContext("2d");
//       if (ctx) {
//         ctx.drawImage(videoRef.current, 0, 0);
//         const photoData = canvas.toDataURL("image/jpeg");
//         setImage(photoData);
//         getCurrentLocation();
//         stopCamera();
//         predictCategory(photoData);
//       }
//     }
//   };

//   const stopCamera = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => track.stop());
//       streamRef.current = null;
//     }
//     setShowCamera(false);
//   };

//   const getCurrentLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//           setLocation({
//             address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
//             lat: latitude,
//             lng: longitude
//           });
//         },
//         (err) => {
//           console.error("Location error:", err);
//           setError("Unable to get location. Please enable location services.");
//         }
//       );
//     } else {
//       setError("Geolocation is not supported by your browser.");
//     }
//   };

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (file.size > 10 * 1024 * 1024) {
//         setError("Image size must be less than 10MB");
//         return;
//       }
      
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         const photoData = reader.result as string;
//         setImage(photoData);
//         getCurrentLocation();
//         predictCategory(photoData);
//       };
//       reader.onerror = () => {
//         setError("Failed to read image file");
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const predictCategory = async (imageData: string) => {
//     if (!reportType) {
//       console.log("No report type selected");
//       return;
//     }
    
//     setPredicting(true);
//     setError("");
    
//     try {
//       const formData = new FormData();
//       formData.append("image_base64", imageData);
//       formData.append("report_type", reportType);

//       const response = await fetch(`${API_URL}/api/ml/predict-category-base64`, {
//         method: "POST",
//         body: formData
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("Prediction failed:", response.status, errorText);
//         throw new Error(`Prediction failed: ${response.status}`);
//       }

//       const result = await response.json();
//       console.log("Prediction result:", result);
//       setPrediction(result);
//       setCategory(result.predicted_category);
//     } catch (error) {
//       console.error("Error predicting category:", error);
//       setError("AI prediction failed. Please select category manually.");
//       setPrediction(null);
//     } finally {
//       setPredicting(false);
//     }
//   };

//   const renderDynamicFields = () => {
//     const fields = categoryFields[category] || [];
    
//     return fields.map((field: any) => (
//       <div key={field.name} className="space-y-2">
//         <Label htmlFor={field.name}>{field.label}</Label>
//         {field.type === "select" ? (
//           <Select 
//             value={formData[field.name] || ""} 
//             onValueChange={(value) => setFormData({ ...formData, [field.name]: value })}
//           >
//             <SelectTrigger id={field.name}>
//               <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
//             </SelectTrigger>
//             <SelectContent>
//               {field.options.map((opt: string) => (
//                 <SelectItem key={opt} value={opt}>
//                   {opt}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         ) : (
//           <Input
//             id={field.name}
//             type={field.type}
//             placeholder={field.placeholder}
//             value={formData[field.name] || ""}
//             onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
//           />
//         )}
//       </div>
//     ));
//   };

//   const handleSubmit = async () => {
//     setError("");
    
//     console.log("🔍 Submit validation:", {
//       hasUser: !!currentUser,
//       userId: currentUser?.id,
//       userEmail: currentUser?.email
//     });

//     if (!currentUser || !currentUser.id) {
//       const errorMsg = "You must be logged in to submit a report. Please log in and try again.";
//       setError(errorMsg);
//       console.error("❌ Auth check failed - No user data available");
//       return;
//     }

//     if (!image) {
//       setError("Please capture or upload an image");
//       return;
//     }

//     if (!category) {
//       setError("Please select a category");
//       return;
//     }

//     if (!location.address) {
//       setError("Location is required. Please enable location services.");
//       return;
//     }

//     setSubmitting(true);
    
//     try {
//       const submitFormData = new FormData();
      
//       // Required fields matching backend
//       submitFormData.append("user_id", String(currentUser.id));
//       submitFormData.append("title", formData.title || `${category.charAt(0).toUpperCase() + category.slice(1)} Report`);
//       submitFormData.append("description", formData.description || "No additional description provided");
//       submitFormData.append("category", category);
//       submitFormData.append("location", location.address);
      
//       // Optional coordinates
//       if (location.lat && location.lng) {
//         submitFormData.append("latitude", String(location.lat));
//         submitFormData.append("longitude", String(location.lng));
//       }
      
//       // Base64 image
//       submitFormData.append("image", image);
      
//       // Prediction data
//       if (prediction) {
//         submitFormData.append("predicted_category", prediction.predicted_category);
//         submitFormData.append("ai_confidence", String(prediction.confidence));
//       }
      
//       // Metadata
//       const metadata = {
//         ...formData,
//         prediction_category: prediction?.predicted_category,
//         prediction_confidence: prediction?.confidence,
//         submitted_by_name: currentUser.fullName,
//         submitted_by_email: currentUser.email,
//         submitted_by_role: currentUser.role
//       };
//       submitFormData.append("metadata", JSON.stringify(metadata));

//       console.log("📤 Submitting report:", {
//         userId: currentUser.id,
//         userName: currentUser.fullName,
//         category: category,
//         reportType: reportType,
//         hasImage: !!image
//       });

//       const response = await fetch(
//         `${API_URL}/api/ml/submit-report?report_type=${reportType}`,
//         {
//           method: "POST",
//           body: submitFormData
//         }
//       );

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("❌ Server response:", errorText);
        
//         let errorMessage = `Server error: ${response.status}`;
//         try {
//           const errorData = JSON.parse(errorText);
//           errorMessage = errorData.detail || errorData.message || errorMessage;
//         } catch (e) {
//           errorMessage = errorText || errorMessage;
//         }
        
//         throw new Error(errorMessage);
//       }

//       const result = await response.json();
//       console.log("✅ Report submitted successfully:", result);
      
//       alert(`✅ Report submitted successfully!\n\nReport ID: ${result.report_id}\nType: ${result.report_type}\n\nYou can view your report in "My Reports" section.`);
      
//       // Reset form
//       setStep(1);
//       setReportType("");
//       setCategory("");
//       setFormData({});
//       setImage("");
//       setLocation({ address: "", lat: 0, lng: 0 });
//       setPrediction(null);
//       setError("");
      
//     } catch (error: any) {
//       console.error("❌ Error submitting report:", error);
//       setError(error.message || "Failed to submit report. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const isLoggedIn = !!currentUser;

//   return (
//     <div className="max-w-2xl mx-auto p-4">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Sparkles className="h-5 w-5" />
//             AI-Powered Report System
//           </CardTitle>
//           <CardDescription>
//             Step {step} of 3: {step === 1 ? "Choose Report Type" : step === 2 ? "Capture Evidence" : "Provide Details"}
//           </CardDescription>
          
//           {isLoggedIn && currentUser && (
//             <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
//               <div className="flex items-start gap-3">
//                 <div className="flex-shrink-0 mt-0.5">
//                   <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-2 mb-1">
//                     <User className="h-4 w-4 text-green-700 dark:text-green-400" />
//                     <h3 className="font-semibold text-green-900 dark:text-green-100 text-sm">
//                       Logged in as {currentUser.role}
//                     </h3>
//                   </div>
//                   <div className="space-y-1 text-sm">
//                     <p className="text-green-800 dark:text-green-200 font-medium">
//                       {currentUser.fullName}
//                     </p>
//                     <p className="text-green-700 dark:text-green-300 text-xs">
//                       {currentUser.email}
//                     </p>
//                     <p className="text-green-600 dark:text-green-400 text-xs font-mono">
//                       User ID: {currentUser.id}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {!isLoggedIn && (
//             <Alert variant="destructive" className="mt-4">
//               <LogIn className="h-4 w-4" />
//               <AlertTitle>Authentication Required</AlertTitle>
//               <AlertDescription>
//                 You must be logged in to submit reports. Please log in to continue.
//               </AlertDescription>
//             </Alert>
//           )}
//         </CardHeader>
//         <CardContent>
//           {error && (
//             <Alert variant="destructive" className="mb-4">
//               <AlertTriangle className="h-4 w-4" />
//               <AlertTitle>Error</AlertTitle>
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}

//           {step === 1 && (
//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label>Select Report Type</Label>
//                 <div className="grid grid-cols-2 gap-4">
//                   <Button
//                     variant={reportType === "issue" ? "default" : "outline"}
//                     className="h-24 flex flex-col gap-2"
//                     onClick={() => setReportType("issue")}
//                   >
//                     <FileText className="h-8 w-8" />
//                     <span>Report Issue</span>
//                   </Button>
//                   <Button
//                     variant={reportType === "violation" ? "default" : "outline"}
//                     className="h-24 flex flex-col gap-2"
//                     onClick={() => setReportType("violation")}
//                   >
//                     <AlertTriangle className="h-8 w-8" />
//                     <span>Report Violation</span>
//                   </Button>
//                 </div>
//               </div>

//               {reportType && (
//                 <Button 
//                   onClick={() => setStep(2)} 
//                   className="w-full"
//                   disabled={!isLoggedIn}
//                 >
//                   {isLoggedIn ? "Continue to Capture Evidence" : "Please log in to continue"}
//                 </Button>
//               )}
//             </div>
//           )}

//           {step === 2 && (
//             <div className="space-y-4">
//               {!image ? (
//                 <>
//                   {showCamera ? (
//                     <div className="space-y-4">
//                       <video
//                         ref={videoRef}
//                         autoPlay
//                         playsInline
//                         className="w-full rounded-lg"
//                       />
//                       <div className="flex gap-2">
//                         <Button onClick={capturePhoto} className="flex-1">
//                           <Camera className="h-4 w-4 mr-2" />
//                           Capture Photo
//                         </Button>
//                         <Button onClick={stopCamera} variant="outline">
//                           Cancel
//                         </Button>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="space-y-4">
//                       <Button onClick={startCamera} className="w-full h-32">
//                         <Camera className="h-8 w-8 mr-2" />
//                         Open Camera
//                       </Button>
//                       <div className="relative">
//                         <div className="absolute inset-0 flex items-center">
//                           <span className="w-full border-t" />
//                         </div>
//                         <div className="relative flex justify-center text-xs uppercase">
//                           <span className="bg-background px-2 text-muted-foreground">Or</span>
//                         </div>
//                       </div>
//                       <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent">
//                         <Upload className="h-8 w-8 mb-2" />
//                         <span className="text-sm">Upload from gallery</span>
//                         <input
//                           type="file"
//                           className="hidden"
//                           accept="image/*"
//                           onChange={handleImageUpload}
//                         />
//                       </label>
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <div className="space-y-4">
//                   <div className="relative">
//                     <img src={image} alt="Captured" className="w-full rounded-lg" />
//                     <Button
//                       variant="destructive"
//                       size="icon"
//                       className="absolute top-2 right-2"
//                       onClick={() => {
//                         setImage("");
//                         setPrediction(null);
//                         setError("");
//                       }}
//                     >
//                       <X className="h-4 w-4" />
//                     </Button>
//                   </div>

//                   {predicting && (
//                     <Alert>
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                       <AlertDescription>
//                         AI is analyzing the image to predict the category...
//                       </AlertDescription>
//                     </Alert>
//                   )}

//                   {prediction && !predicting && (
//                     <Alert>
//                       <Sparkles className="h-4 w-4" />
//                       <AlertDescription>
//                         <strong>AI Prediction:</strong> {prediction.predicted_category} 
//                         <span className="text-muted-foreground ml-2">
//                           ({(prediction.confidence * 100).toFixed(1)}% confidence)
//                         </span>
//                       </AlertDescription>
//                     </Alert>
//                   )}

//                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                     <MapPin className="h-4 w-4" />
//                     <span>{location.address || "Capturing location..."}</span>
//                   </div>

//                   <div className="space-y-2">
//                     <Label>Confirm or Change Category</Label>
//                     <Select value={category} onValueChange={setCategory}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select category" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {currentCategories.map((cat) => (
//                           <SelectItem key={cat.value} value={cat.value}>
//                             {cat.label}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <Button 
//                     onClick={() => setStep(3)} 
//                     className="w-full"
//                     disabled={!category}
//                   >
//                     Continue to Details
//                   </Button>
//                 </div>
//               )}

//               <Button onClick={() => setStep(1)} variant="outline" className="w-full">
//                 Back
//               </Button>
//             </div>
//           )}

//           {step === 3 && (
//             <div className="space-y-4">
//               {renderDynamicFields()}
              
//               <div className="space-y-2">
//                 <Label htmlFor="title">Title (Optional)</Label>
//                 <Input
//                   id="title"
//                   placeholder="Brief title for the report"
//                   value={formData.title || ""}
//                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="description">Additional Details (Optional)</Label>
//                 <Textarea
//                   id="description"
//                   placeholder="Provide any additional information..."
//                   value={formData.description || ""}
//                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   rows={4}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label>Location</Label>
//                 <div className="flex items-center gap-2">
//                   <Input value={location.address} readOnly />
//                   <Button type="button" variant="outline" size="icon" onClick={getCurrentLocation}>
//                     <MapPin className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>

//               <div className="flex gap-2">
//                 <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
//                   Back
//                 </Button>
//                 <Button 
//                   onClick={handleSubmit} 
//                   className="flex-1"
//                   disabled={submitting || !isLoggedIn}
//                 >
//                   {submitting ? (
//                     <>
//                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                       Submitting...
//                     </>
//                   ) : !isLoggedIn ? (
//                     "Please log in"
//                   ) : (
//                     "Submit Report"
//                   )}
//                 </Button>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, MapPin, X, AlertTriangle, FileText, Loader2, Sparkles, User, LogIn, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const API_URL = "";

interface CategoryPrediction {
  predicted_category: string;
  confidence: number;
  all_scores: { [key: string]: number };
  detected_features?: any[];
}

interface UserData {
  id: number;
  email: string;
  fullName: string;
  role: string;
  aadharNumber?: string;
  phoneNumber?: string;
}

const issueCategories = [
  { value: "garbage", label: "Garbage Collection" },
  { value: "pothole", label: "Pothole" },
  { value: "streetlight", label: "Street Light" },
  { value: "water", label: "Water Leakage" },
  { value: "road", label: "Road Damage" },
  { value: "dumping", label: "Illegal Dumping" },
  { value: "graffiti", label: "Graffiti" },
  { value: "other", label: "Other" },
];

const violationCategories = [
  { value: "parking", label: "Parking Violation" },
  { value: "noise", label: "Noise Pollution" },
  { value: "construction", label: "Illegal Construction" },
  { value: "encroachment", label: "Public Space Encroachment" },
  { value: "littering", label: "Public Littering" },
  { value: "traffic", label: "Traffic Rule Violation" },
  { value: "other", label: "Other Violation" },
];

const categoryFields: any = {
  garbage: [
    { name: "binNumber", label: "Bin Number", type: "text", placeholder: "Enter bin number" },
    { name: "overflowLevel", label: "Overflow Level", type: "select", options: ["Low", "Medium", "High", "Critical"] }
  ],
  pothole: [
    { name: "severity", label: "Severity", type: "select", options: ["Minor", "Moderate", "Major", "Critical"] },
    { name: "diameter", label: "Diameter (cm)", type: "number", placeholder: "Approximate diameter" }
  ],
  streetlight: [
    { name: "poleNumber", label: "Pole Number", type: "text", placeholder: "Street light pole number" },
    { name: "issueType", label: "Issue Type", type: "select", options: ["Not Working", "Flickering", "Damaged", "Missing"] }
  ],
  water: [
    { name: "severity", label: "Severity", type: "select", options: ["Minor", "Moderate", "Major", "Critical"] },
    { name: "waterSource", label: "Water Source", type: "select", options: ["Pipeline", "Tap", "Underground", "Unknown"] }
  ],
  road: [
    { name: "damageType", label: "Damage Type", type: "select", options: ["Crack", "Depression", "Edge Break", "Surface Wear"] },
    { name: "length", label: "Length (meters)", type: "number", placeholder: "Approximate length" }
  ],
  dumping: [
    { name: "wasteType", label: "Waste Type", type: "select", options: ["Household", "Construction", "Electronic", "Hazardous", "Mixed"] },
    { name: "estimatedVolume", label: "Volume", type: "select", options: ["Small", "Medium", "Large", "Very Large"] }
  ],
  graffiti: [
    { name: "surfaceType", label: "Surface Type", type: "select", options: ["Wall", "Public Property", "Vehicle", "Other"] },
    { name: "size", label: "Size", type: "select", options: ["Small", "Medium", "Large"] }
  ],
  parking: [
    // { name: "violationType", label: "Violation Type", type: "text", placeholder: "Describe violation" }
  ],
  noise: [
    { name: "noiseType", label: "Noise Type", type: "select", options: ["Construction", "Vehicle", "Music", "Industrial", "Other"] },
    { name: "duration", label: "Duration", type: "select", options: ["< 30 mins", "30-60 mins", "1-2 hours", "> 2 hours"] }
  ],
  construction: [
    { name: "constructionType", label: "Construction Type", type: "select", options: ["Residential", "Commercial", "Renovation", "Demolition"] },
    { name: "permitNumber", label: "Permit Number (if known)", type: "text", placeholder: "Enter permit number" }
  ],
  encroachment: [
    { name: "encroachmentType", label: "Encroachment Type", type: "select", options: ["Temporary Structure", "Permanent Structure", "Vehicle", "Goods", "Other"] },
    { name: "area", label: "Area (sq meters)", type: "number", placeholder: "Approximate area" }
  ],
  littering: [
    { name: "litterType", label: "Litter Type", type: "select", options: ["Plastic", "Food Waste", "Cigarette Butts", "Glass", "Mixed"] }
  ],
  traffic: [
    { name: "vehicleNumber", label: "Vehicle Number (if visible)", type: "text", placeholder: "Enter vehicle number" }
  ]
};

export function ReportIssueForm(props: { onSubmit: (data: any) => void }) {
  const [step, setStep] = useState(1);
  const [reportType, setReportType] = useState<"issue" | "violation" | "">("");
  const [category, setCategory] = useState("");
  const [formData, setFormData] = useState<any>({});
  const [image, setImage] = useState<string>("");
  const [location, setLocation] = useState({ address: "", lat: 0, lng: 0 });
  const [showCamera, setShowCamera] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState<CategoryPrediction | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const { onSubmit } = props;
  const [currentUser, setCurrentUser] = useState<UserData | null>(() => {
    const stored = localStorage.getItem('civiceye_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // QUICK FIX: If no ID, add a default one
        if (!parsed.id && parsed.email === 'citizen@civiceye.com') {
          parsed.id = 2; // Replace with actual ID from database
        }
        console.log("🔍 Loaded from localStorage:", parsed);
        return parsed;
      } catch (err) {
        console.error("Failed to parse user from localStorage:", err);
        return null;
      }
    }
    return null;
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentCategories = reportType === "issue" ? issueCategories : violationCategories;
  
  useEffect(() => {
    console.log("🔐 Current User State:", {
      isLoggedIn: !!currentUser,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      userName: currentUser?.fullName,
      role: currentUser?.role,
      fullUserObject: currentUser
    });
    
    if (!currentUser) {
      const stored = localStorage.getItem('civiceye_user');
      console.log("📦 localStorage contents:", stored);
      if (stored) {
        try {
          const user = JSON.parse(stored);
          console.log("✅ Restoring user from localStorage:", user);
          setCurrentUser(user);
        } catch (err) {
          console.error("Failed to restore user from localStorage:", err);
        }
      }
    } else {
      console.log("✅ User already in state:", currentUser);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false 
      });
      
      setShowCamera(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          videoRef.current.play().catch(err => {
            console.error("Error playing video:", err);
            setError("Failed to start video preview");
          });
        }
      }, 100);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Unable to access camera. Please check permissions.");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const photoData = canvas.toDataURL("image/jpeg");
        setImage(photoData);
        getCurrentLocation();
        stopCamera();
        predictCategory(photoData);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            lat: latitude,
            lng: longitude
          });
        },
        (err) => {
          console.error("Location error:", err);
          setError("Unable to get location. Please enable location services.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result as string;
        setImage(photoData);
        getCurrentLocation();
        predictCategory(photoData, file.name);
      };
      reader.onerror = () => {
        setError("Failed to read image file");
      };
      reader.readAsDataURL(file);
    }
  };

  const predictCategory = async (imageData: string, customFileName?: string) => {
    if (!reportType) {
      console.log("No report type selected");
      return;
    }
    
    setPredicting(true);
    setError("");
    
    try {
      const response = await fetch(`${API_URL}/api/ml/predict-category-base64`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_base64: imageData,
          report_type: reportType,
          file_name: customFileName || "",
          title: formData?.title || "",
          description: formData?.description || "",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Prediction failed:", response.status, errorText);
        throw new Error(`Prediction failed: ${response.status}`);
      }

      const result = await response.json();
      console.log("Prediction result:", result);
      setPrediction(result);
      setCategory(result.predicted_category);
    } catch (error) {
      console.error("Error predicting category:", error);
      setError("AI prediction failed. Please select category manually.");
      setPrediction(null);
    } finally {
      setPredicting(false);
    }
  };

  const renderDynamicFields = () => {
    const fields = categoryFields[category] || [];
    
    return fields.map((field: any) => (
      <div key={field.name} className="space-y-2">
        <Label htmlFor={field.name}>{field.label}</Label>
        {field.type === "select" ? (
          <Select 
            value={formData[field.name] || ""} 
            onValueChange={(value) => setFormData({ ...formData, [field.name]: value })}
          >
            <SelectTrigger id={field.name}>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((opt: string) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={field.name}
            type={field.type}
            placeholder={field.placeholder}
            value={formData[field.name] || ""}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
          />
        )}
      </div>
    ));
  };

  const handleSubmit = async () => {
    setError("");
    
    console.log("🔍 Submit validation:", {
      hasUser: !!currentUser,
      userId: currentUser?.id,
      userEmail: currentUser?.email
    });

    if (!currentUser || !currentUser.id) {
      const errorMsg = "You must be logged in to submit a report. Please log in and try again.";
      setError(errorMsg);
      console.error("❌ Auth check failed - No user data available");
      return;
    }

    if (!image) {
      setError("Please capture or upload an image");
      return;
    }

    if (!category) {
      setError("Please select a category");
      return;
    }

    if (!location.address) {
      setError("Location is required. Please enable location services.");
      return;
    }

    setSubmitting(true);
    
    try {
      const payload = {
        user_id: String(currentUser.id),
        title: formData.title || `${category.charAt(0).toUpperCase() + category.slice(1)} Report`,
        description: formData.description || "No additional description provided",
        category: category,
        location: location.address,
        address: location.address,
        latitude: location.lat ? String(location.lat) : undefined,
        longitude: location.lng ? String(location.lng) : undefined,
        image: image,
        report_type: reportType,
        predicted_category: prediction?.predicted_category,
        ai_confidence: prediction?.confidence,
        metadata: JSON.stringify({
          ...formData,
          prediction_category: prediction?.predicted_category,
          prediction_confidence: prediction?.confidence,
          submitted_by_name: currentUser.fullName,
          submitted_by_email: currentUser.email,
          submitted_by_role: currentUser.role,
        }),
      };

      console.log("📤 Submitting report:", {
        userId: currentUser.id,
        userName: currentUser.fullName,
        category: category,
        reportType: reportType,
        hasImage: !!image,
      });

      const response = await fetch(
        `${API_URL}/api/ml/submit-report?report_type=${reportType}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server response:", errorText);
        
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("✅ Report submitted successfully:", result);
      
      alert(`✅ Report submitted successfully!\n\nReport ID: ${result.report_id}\nType: ${result.report_type}\n\nYou can view your report in "My Reports" section.`);
      
      // Reset form
      setStep(1);
      setReportType("");
      setCategory("");
      setFormData({});
      setImage("");
      setLocation({ address: "", lat: 0, lng: 0 });
      setPrediction(null);
      setError("");
      
    } catch (error: any) {
      console.error("❌ Error submitting report:", error);
      setError(error.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isLoggedIn = !!currentUser;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI-Powered Report System
          </CardTitle>
          <CardDescription>
            Step {step} of 3: {step === 1 ? "Choose Report Type" : step === 2 ? "Capture Evidence" : "Provide Details"}
          </CardDescription>
          
          {isLoggedIn && currentUser && (
            <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-green-700 dark:text-green-400" />
                    <h3 className="font-semibold text-green-900 dark:text-green-100 text-sm">
                      Logged in as {currentUser.role}
                    </h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      {currentUser.fullName}
                    </p>
                    <p className="text-green-700 dark:text-green-300 text-xs">
                      {currentUser.email}
                    </p>
                    <p className="text-green-600 dark:text-green-400 text-xs font-mono">
                      User ID: {currentUser.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isLoggedIn && (
            <Alert variant="destructive" className="mt-4">
              <LogIn className="h-4 w-4" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                You must be logged in to submit reports. Please log in to continue.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Report Type</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={reportType === "issue" ? "default" : "outline"}
                    className="h-24 flex flex-col gap-2"
                    onClick={() => setReportType("issue")}
                  >
                    <FileText className="h-8 w-8" />
                    <span>Report Issue</span>
                  </Button>
                  <Button
                    variant={reportType === "violation" ? "default" : "outline"}
                    className="h-24 flex flex-col gap-2"
                    onClick={() => setReportType("violation")}
                  >
                    <AlertTriangle className="h-8 w-8" />
                    <span>Report Violation</span>
                  </Button>
                </div>
              </div>

              {reportType && (
                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full"
                  disabled={!isLoggedIn}
                >
                  {isLoggedIn ? "Continue to Capture Evidence" : "Please log in to continue"}
                </Button>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {!image ? (
                <>
                  {showCamera ? (
                    <div className="space-y-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full rounded-lg"
                      />
                      <div className="flex gap-2">
                        <Button onClick={capturePhoto} className="flex-1">
                          <Camera className="h-4 w-4 mr-2" />
                          Capture Photo
                        </Button>
                        <Button onClick={stopCamera} variant="outline">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Button onClick={startCamera} className="w-full h-32">
                        <Camera className="h-8 w-8 mr-2" />
                        Open Camera
                      </Button>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Or</span>
                        </div>
                      </div>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent">
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="text-sm">Upload from gallery</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img src={image} alt="Captured" className="w-full rounded-lg" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImage("");
                        setPrediction(null);
                        setError("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {predicting && (
                    <Alert>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <AlertDescription>
                        AI is analyzing the image to predict the category...
                      </AlertDescription>
                    </Alert>
                  )}

                  {prediction && !predicting && (
                    <Alert>
                      <Sparkles className="h-4 w-4" />
                      <AlertDescription>
                        <strong>AI Prediction:</strong> {prediction.predicted_category} 
                        <span className="text-muted-foreground ml-2">
                          ({(prediction.confidence * 100).toFixed(1)}% confidence)
                        </span>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{location.address || "Capturing location..."}</span>
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm or Change Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={() => setStep(3)} 
                    className="w-full"
                    disabled={!category}
                  >
                    Continue to Details
                  </Button>
                </div>
              )}

              <Button onClick={() => setStep(1)} variant="outline" className="w-full">
                Back
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {renderDynamicFields()}
              
              <div className="space-y-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="Brief title for the report"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional Details (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Provide any additional information..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <div className="flex items-center gap-2">
                  <Input value={location.address} readOnly />
                  <Button type="button" variant="outline" size="icon" onClick={getCurrentLocation}>
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  className="flex-1"
                  disabled={submitting || !isLoggedIn}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : !isLoggedIn ? (
                    "Please log in"
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}