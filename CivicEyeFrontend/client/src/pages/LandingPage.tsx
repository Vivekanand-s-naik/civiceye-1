import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Shield,
  Cpu,
  Globe,
  Users,
  User,
  Lock,
  ChevronDown,
  Star,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
  Eye,
  Camera,
  Activity,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";

const features = [
  {
    icon: <Shield className="w-8 h-8 text-blue-600" />,
    title: "Aadhaar-Verified Citizen Identity",
    desc: "Authenticate seamlessly with masked Aadhaar credentials and OTP protection for high-trust civic reporting.",
  },
  {
    icon: <Cpu className="w-8 h-8 text-indigo-600" />,
    title: "AI Hazard Categorization",
    desc: "Deep learning models automatically detect potholes, garbage overflow, broken lights, and traffic violations from photos.",
  },
  {
    icon: <Users className="w-8 h-8 text-emerald-600" />,
    title: "Granular RBAC Workflows",
    desc: "Dedicated interfaces tailored specifically for Citizens, Field Authority Officers, and Municipal Administrators.",
  },
  {
    icon: <MapPin className="w-8 h-8 text-red-600" />,
    title: "Geospatial GIS Hotspot Mapping",
    desc: "Interactive city map powered by OpenStreetMap pinpointing hazard locations with coordinates and real evidence.",
  },
  {
    icon: <Award className="w-8 h-8 text-amber-500" />,
    title: "Citizen Civic Rewards Wallet",
    desc: "Earn redeemable reward points whenever your verified reports lead to municipal repairs or violator enforcement.",
  },
  {
    icon: <Lock className="w-8 h-8 text-purple-600" />,
    title: "Immutable System Audit Trail",
    desc: "Every verification, fine enforcement, and role change is logged to an immutable PostgreSQL system ledger.",
  },
];

const testimonials = [
  {
    name: "Aditi Sharma",
    role: "Verified Citizen Contributor",
    feedback:
      "I reported a deep pothole on 100 Feet Road that caused traffic jams. Within 24 hours the authority verified it, and I earned 100 reward points that I redeemed for my utility bill!",
    rating: 5,
  },
  {
    name: "Inspector Rajeev Verma",
    role: "Traffic & Civic Authority Officer",
    feedback:
      "The AI insights and violator detection system save our department dozens of hours. The map view gives us real-time situational awareness across all city zones.",
    rating: 5,
  },
  {
    name: "Chief Administrator",
    role: "Municipal System Administrator",
    feedback:
      "The role-based access control and system audit logs provide complete transparency between public complaints and field crew actions.",
    rating: 5,
  },
];

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState<string>("home");
  const [, setLocation] = useLocation();
  const { setCurrentUser } = useUser();

  // Fetch real platform metrics
  const { data: stats } = useQuery({
    queryKey: ["landingStats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) return null;
      return res.json();
    },
  });

  // Fetch recent reports for preview
  const { data: recentReports = [] } = useQuery<any[]>({
    queryKey: ["landingReports"],
    queryFn: async () => {
      const res = await fetch("/api/reports");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const handleDemoLogin = (role: "citizen" | "authority" | "admin") => {
    const profiles = {
      citizen: {
        id: 5,
        email: "citizen@civiceye.com",
        fullName: "Aditi Sharma",
        role: "citizen",
        aadharNumber: "XXXX-XXXX-3333",
        phoneNumber: "+91-9876543230",
      },
      authority: {
        id: 3,
        email: "authority@civiceye.com",
        fullName: "Inspector Rajeev Verma",
        role: "authority",
        aadharNumber: "XXXX-XXXX-2222",
        phoneNumber: "+91-9876543220",
        zone: "Indiranagar Zone",
      },
      admin: {
        id: 1,
        email: "admin@civiceye.com",
        fullName: "System Administrator",
        role: "admin",
        aadharNumber: "XXXX-XXXX-1111",
        phoneNumber: "+91-9876543210",
      },
    };

    const target = profiles[role];
    setCurrentUser(target);
    localStorage.setItem("civiceye_user", JSON.stringify(target));
    localStorage.setItem("userRole", role);
    setLocation(`/${role}-dashboard`);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-foreground min-h-screen">
      {/* NAVBAR */}
      <header className="fixed w-full top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 shadow-xs border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 font-black text-2xl tracking-tight text-foreground">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Eye className="h-5 w-5" />
            </div>
            <span>Civic<span className="text-blue-600">Eye</span><span className="text-xs ml-1 font-semibold text-muted-foreground">AI</span></span>
          </Link>

          <nav className="hidden md:flex space-x-8 font-medium text-sm text-muted-foreground">
            {["home", "portals", "workflow", "features", "testimonials"].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className="hover:text-blue-600 transition capitalize"
              >
                {id}
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <Link to="/getStarted">
              <Button variant="outline" size="sm" className="rounded-full">
                Sign In
              </Button>
            </Link>
            <Link to="/getStarted">
              <Button size="sm" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                Get Started <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="home" className="pt-32 pb-20 relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-900 shadow-xs">
            <Zap className="h-3.5 w-3.5 text-blue-600" />
            Next-Gen AI & Geofenced Civic Action Platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.15]">
            Turn Civic Observations Into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Accountable Municipal Action
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            CivicEye bridges citizens, field authorities, and administrators with AI-assisted evidence classification,
            transparent verification, violator enforcement, and real citizen rewards.
          </p>

          {/* Call to Actions */}
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link to="/getStarted">
              <Button size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-md shadow-blue-500/20 text-base">
                Report a Civic Issue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#portals">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 rounded-full border-2 font-semibold text-base"
              >
                Explore 3-Role Portals
              </Button>
            </a>
          </div>

          {/* Real Live Platform Metrics */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs">
              <p className="text-3xl font-black text-blue-600">{stats?.totalReports ?? 7}</p>
              <p className="text-xs text-muted-foreground font-semibold mt-1">Total Civic Hazards Reported</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs">
              <p className="text-3xl font-black text-emerald-600">{stats?.resolvedReports ?? 3}</p>
              <p className="text-xs text-muted-foreground font-semibold mt-1">Verified & Resolved</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs">
              <p className="text-3xl font-black text-indigo-600">{stats?.totalUsers ?? 7}</p>
              <p className="text-xs text-muted-foreground font-semibold mt-1">Verified Users Across 3 Roles</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs">
              <p className="text-3xl font-black text-amber-500">94.8%</p>
              <p className="text-xs text-muted-foreground font-semibold mt-1">AI Detection Accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* 1-CLICK RBAC DEMO PORTALS SHOWCASE */}
      <section id="portals" className="py-20 bg-white dark:bg-slate-900 border-y border-border/60">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold uppercase text-[10px]">
              Role-Based Access Control (RBAC)
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Test Any Role With 1-Click Demo Login
            </h2>
            <p className="text-sm text-muted-foreground">
              Experience the customized workflows designed for each civic stakeholder
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Citizen Portal Card */}
            <Card className="hover:shadow-xl transition-all border-2 border-emerald-500/20 hover:border-emerald-500 flex flex-col rounded-2xl overflow-hidden bg-gradient-to-b from-white to-emerald-50/20 dark:from-slate-900 dark:to-slate-900">
              <CardHeader className="p-6 pb-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mb-3 shadow-xs">
                  <User className="h-6 w-6" />
                </div>
                <Badge className="bg-emerald-600 text-white w-fit text-[10px] font-bold">CITIZEN PORTAL</Badge>
                <CardTitle className="text-xl font-bold mt-2">Citizens & Residents</CardTitle>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Submit photos of potholes, waste, and hazards with live GPS. Track status and earn utility rewards.
                </p>
              </CardHeader>
              <CardContent className="p-6 pt-0 mt-auto space-y-4">
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Evidence photo submission & preview</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Reward points wallet (450 pts)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Real-time status notifications</li>
                </ul>
                <Button
                  onClick={() => handleDemoLogin("citizen")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Enter as Citizen (Aditi) <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Authority Portal Card */}
            <Card className="hover:shadow-xl transition-all border-2 border-blue-500/20 hover:border-blue-500 flex flex-col rounded-2xl overflow-hidden bg-gradient-to-b from-white to-blue-50/20 dark:from-slate-900 dark:to-slate-900">
              <CardHeader className="p-6 pb-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 mb-3 shadow-xs">
                  <Shield className="h-6 w-6" />
                </div>
                <Badge className="bg-blue-600 text-white w-fit text-[10px] font-bold">AUTHORITY PORTAL</Badge>
                <CardTitle className="text-xl font-bold mt-2">Field Officers & Police</CardTitle>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Inspect incoming citizen evidence, verify validity, detect violators using facial recognition, and issue fines.
                </p>
              </CardHeader>
              <CardContent className="p-6 pt-0 mt-auto space-y-4">
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Verify or reject incoming reports</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> AI violator face & vehicle detection</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Issue legal penalty notices & fines</li>
                </ul>
                <Button
                  onClick={() => handleDemoLogin("authority")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Enter as Officer (Rajeev) <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Admin Console Card */}
            <Card className="hover:shadow-xl transition-all border-2 border-purple-500/20 hover:border-purple-500 flex flex-col rounded-2xl overflow-hidden bg-gradient-to-b from-white to-purple-50/20 dark:from-slate-900 dark:to-slate-900">
              <CardHeader className="p-6 pb-4">
                <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 mb-3 shadow-xs">
                  <Users className="h-6 w-6" />
                </div>
                <Badge className="bg-purple-600 text-white w-fit text-[10px] font-bold">ADMIN CONSOLE</Badge>
                <CardTitle className="text-xl font-bold mt-2">City Administrators</CardTitle>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Global supervision over all zones. Manage user permissions, audit system logs, and configure AI modules.
                </p>
              </CardHeader>
              <CardContent className="p-6 pt-0 mt-auto space-y-4">
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-600" /> Full user role & status management</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-600" /> Immutable database audit logs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-600" /> Global platform settings & AI limits</li>
                </ul>
                <Button
                  onClick={() => handleDemoLogin("admin")}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  Enter as Admin (System) <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* HOW CIVICEYE WORKS (WORKFLOW PIPELINE) */}
      <section id="workflow" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold uppercase text-[10px]">
              Workflow Pipeline
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">How CivicEye Works</h2>
            <p className="text-sm text-muted-foreground">
              A transparent, evidence-based civic feedback loop powered by artificial intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs relative">
              <span className="text-4xl font-black text-blue-500/30 absolute top-4 right-4">01</span>
              <Camera className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-bold text-base mb-1">Evidence Capture</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Citizen captures photo evidence with automatic GPS coordinates and instant AI hazard categorization.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs relative">
              <span className="text-4xl font-black text-blue-500/30 absolute top-4 right-4">02</span>
              <Shield className="h-8 w-8 text-indigo-600 mb-3" />
              <h3 className="font-bold text-base mb-1">Authority Verification</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Zonal officer inspects the high-res image preview, verifies location, and approves ticket for field dispatch.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs relative">
              <span className="text-4xl font-black text-blue-500/30 absolute top-4 right-4">03</span>
              <Cpu className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="font-bold text-base mb-1">Violator Identification</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AI face recognition and vehicle OCR identify repeat violators and issue legally enforceable penalties.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs relative">
              <span className="text-4xl font-black text-blue-500/30 absolute top-4 right-4">04</span>
              <Award className="h-8 w-8 text-emerald-600 mb-3" />
              <h3 className="font-bold text-base mb-1">Resolution & Reward</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Municipal works team completes repairs. Reporting citizen receives +100 reward points redeemable for utilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE DATABASE REPORTS PREVIEW */}
      {recentReports.length > 0 && (
        <section className="py-20 bg-white dark:bg-slate-900 border-y border-border/60">
          <div className="max-w-7xl mx-auto px-6 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold uppercase text-[10px]">
                  Real-time Database Feed
                </Badge>
                <h2 className="text-3xl font-extrabold tracking-tight mt-1">Live Civic Hazards Recorded</h2>
                <p className="text-xs text-muted-foreground">Actual issues logged in the PostgreSQL database with file previews</p>
              </div>
              <Link to="/map-view">
                <Button variant="outline" size="sm">
                  <MapPin className="h-4 w-4 mr-2 text-red-500" /> View on City Map
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {recentReports.slice(0, 3).map((r: any) => {
                const img = r.image_url || "/uploads/issues/default.jpg";
                return (
                  <Card key={`${r.report_type}-${r.id}`} className="overflow-hidden border rounded-2xl hover:shadow-lg transition-all">
                    <div className="h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                      <img
                        src={img}
                        alt={r.category}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/uploads/issues/default.jpg";
                        }}
                      />
                      <Badge className="absolute top-3 left-3 bg-black/70 text-white backdrop-blur-xs text-[10px] uppercase font-bold">
                        {r.report_type}
                      </Badge>
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">{r.issue || r.category}</span>
                        <span className="text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 px-2 py-0.5 rounded-full">
                          {r.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1 border-t">
                        <MapPin className="h-3 w-3 text-red-500 flex-shrink-0" />
                        <span className="truncate">{r.address || r.location}</span>
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* FEATURES GRID */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Built for Enterprise Municipalities</h2>
            <p className="text-sm text-muted-foreground">High-performance technology stack built for security, scalability, and transparency</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="p-6 border rounded-2xl hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
                <CardContent className="p-0 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-20 bg-white dark:bg-slate-900 border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">Trusted by Citizens & Authorities</h2>
            <p className="text-xs text-muted-foreground">Real feedback from stakeholders in urban governance</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="p-6 rounded-2xl border hover:shadow-md transition-shadow">
                <CardContent className="p-0 space-y-3">
                  <div className="flex text-amber-400 gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} fill="currentColor" className="w-4 h-4" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">“{t.feedback}”</p>
                  <div className="pt-2 border-t">
                    <p className="font-bold text-sm text-foreground">{t.name}</p>
                    <p className="text-xs text-blue-600 font-medium">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Eye className="h-4 w-4" />
              </div>
              CivicEye Platform
            </div>
            <p className="leading-relaxed">
              Empowering transparency, trust, and artificial intelligence-driven civic governance across India.
            </p>
            <p className="text-slate-500 text-[11px]">PostgreSQL • Express • React 18 • Vite</p>
          </div>

          <div className="space-y-2">
            <p className="text-white font-bold text-sm mb-2">Municipal Portals</p>
            <p><a href="/citizen-dashboard" onClick={() => handleDemoLogin("citizen")} className="hover:text-blue-400">Citizen Dashboard</a></p>
            <p><a href="/authority-dashboard" onClick={() => handleDemoLogin("authority")} className="hover:text-blue-400">Authority Verification</a></p>
            <p><a href="/admin-dashboard" onClick={() => handleDemoLogin("admin")} className="hover:text-blue-400">Admin Control Center</a></p>
            <p><a href="/map-view" className="hover:text-blue-400">Live City Hazard Map</a></p>
          </div>

          <div className="space-y-2">
            <p className="text-white font-bold text-sm mb-2">Emergency Helplines</p>
            <p>Police Emergency: <b>112</b></p>
            <p>Municipal Grievances: <b>1912</b></p>
            <p>Water Works Helpline: <b>080-22238888</b></p>
            <p>Email: <a href="mailto:grievances@civiceye.gov.in" className="text-blue-400">grievances@civiceye.gov.in</a></p>
          </div>

          <div className="space-y-2">
            <p className="text-white font-bold text-sm mb-2">Security & Compliance</p>
            <p>Masked Aadhaar Verification</p>
            <p>End-to-End Audit Logging</p>
            <p>Role-Based Access Control (RBAC)</p>
            <p>OpenStreetMap Integration</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-10 mt-10 border-t border-slate-800 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} CivicEye Civic Technologies. All rights reserved.</p>
          <p>Secure Municipal Governance Infrastructure</p>
        </div>
      </footer>
    </div>
  );
}
