import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, Cpu, Globe, Users, Lock, ChevronDown, Star } from "lucide-react";
import { Link, Route, Switch } from "wouter";

const features = [
  {
    icon: <Shield className="w-8 h-8 text-blue-600" />,
    title: "Secure Aadhaar Login",
    desc: "Authenticate seamlessly with India’s most trusted digital identity system.",
  },
  {
    icon: <Cpu className="w-8 h-8 text-blue-600" />,
    title: "AI-Powered Insights",
    desc: "Real-time anomaly detection, violator tracking, and behavior analytics powered by deep learning.",
  },
  {
    icon: <Users className="w-8 h-8 text-blue-600" />,
    title: "Role-Specific Dashboards",
    desc: "Tailored experiences for Citizens, Authorities, and Admins with granular access control.",
  },
  {
    icon: <Globe className="w-8 h-8 text-blue-600" />,
    title: "Smart City Integration",
    desc: "Seamlessly integrates with government APIs, maps, and city-level IoT networks.",
  },
  {
    icon: <Lock className="w-8 h-8 text-blue-600" />,
    title: "Privacy-First Architecture",
    desc: "End-to-end encryption and role-based security policies ensure maximum data safety.",
  },
];

const testimonials = [
  {
    name: "Aditi Sharma",
    role: "Citizen User",
    feedback:
      "CivicEye makes it effortless to report local issues and track their resolution. Aadhaar login feels quick and secure!",
    rating: 5,
  },
  {
    name: "Inspector Rajeev",
    role: "Authority User",
    feedback:
      "The AI insights and violator detection system help us respond faster and more accurately. A true innovation!",
    rating: 5,
  },
  {
    name: "Anil Kumar",
    role: "System Admin",
    feedback:
      "The admin panel gives total control over platform settings, users, and performance analytics. Excellent tool!",
    rating: 4,
  },
];

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState<string>("home");

  // Scroll spy for navbar highlighting
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section");
      let current = "home";
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 200) {
          current = section.getAttribute("id") || "home";
        }
      });
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-gray-100 min-h-screen">
      {/* NAVBAR */}
      <header className="fixed w-full top-0 z-50 backdrop-blur-md bg-white/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
          <Link to="/" className="font-extrabold text-2xl text-blue-700">
            CivicEye<span className="text-gray-500">AI</span>
          </Link>
          <nav className="hidden md:flex space-x-8 font-medium text-gray-700">
            {["home", "features", "testimonials", "cta", "contact"].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className={`hover:text-blue-600 transition ${
                  activeSection === id ? "text-blue-600 font-semibold" : ""
                }`}
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/getStarted">
              <Button variant="outline" className="rounded-full border-blue-600 text-blue-600 hover:bg-blue-50">
                Login
              </Button>
            </Link>
            <Link to="/getStarted">
              <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="home" className="pt-28 pb-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-extrabold text-gray-900"
          >
            Empowering Smart Governance with{" "}
            <span className="text-blue-700">AI & Aadhaar</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
          >
            CivicEye bridges citizens, authorities, and administrators through
            secure authentication, real-time insights, and transparent digital governance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-8 flex justify-center gap-4"
          >
            <Link to="/getStarted">
              <Button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg flex items-center gap-2">
                Try Demo <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="#features">
              <Button
                variant="outline"
                className="px-6 py-3 text-blue-600 border-blue-600 hover:bg-blue-50 rounded-full text-lg"
              >
                Explore Features
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          >
            <ChevronDown className="w-6 h-6 text-gray-500 animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-14">
            Powerful Features for Every Role
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="hover:shadow-xl transition duration-300 p-6 border-blue-100 rounded-2xl bg-gradient-to-b from-white to-blue-50">
                  <CardContent className="space-y-4 text-center">
                    <div className="flex justify-center">{f.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900">{f.title}</h3>
                    <p className="text-gray-600">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-14 text-gray-900">What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
              >
                <Card className="rounded-2xl p-6 border-gray-200 shadow-md bg-white hover:shadow-xl transition">
                  <CardContent className="space-y-3">
                    <div className="flex justify-center text-yellow-400">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} fill="currentColor" className="w-5 h-5" />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm italic">“{t.feedback}”</p>
                    <h4 className="font-bold text-gray-900">{t.name}</h4>
                    <p className="text-blue-600 text-sm">{t.role}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section id="cta" className="py-28 text-center bg-blue-700 text-white">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-extrabold mb-4">Join the Future of Digital Governance</h2>
          <p className="text-lg mb-8 opacity-90">
            Get started today with Aadhaar-secured access and unlock the full CivicEye ecosystem.
          </p>
          <Link to="/getStarted">
            <Button className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-full hover:bg-gray-200">
              Get Started Now
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-3">CivicEyeAI</h3>
            <p>Empowering transparency, trust, and technology-driven governance across India.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#home" className="hover:text-blue-400">Home</a></li>
              <li><a href="#features" className="hover:text-blue-400">Features</a></li>
              <li><a href="#testimonials" className="hover:text-blue-400">Testimonials</a></li>
              <li><a href="#cta" className="hover:text-blue-400">Get Started</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <p>Email: <a href="mailto:support@civiceye.in" className="text-blue-400">support@civiceye.in</a></p>
            <p>Phone: +91 98765 43210</p>
            <p>Location: Bengaluru, India</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-400">Twitter</a>
              <a href="#" className="hover:text-blue-400">LinkedIn</a>
              <a href="#" className="hover:text-blue-400">YouTube</a>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-10 text-sm">
          © {new Date().getFullYear()} CivicEyeAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
