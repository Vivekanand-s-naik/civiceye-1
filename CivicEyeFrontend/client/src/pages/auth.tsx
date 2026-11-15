import { useState } from "react";
import { LoginForm } from "@/components/login-form";
import { SignupForm } from "@/components/signup-form";
import { UserRole } from "@/App";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

type AuthView = "login" | "signup";

interface AuthPageProps {
  onLogin: (role: UserRole) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [view, setView] = useState<AuthView>("login");
  const { setCurrentUser } = useUser();
  const { toast } = useToast();

  const handleLoginSubmit = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase(), password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed with status ${response.status}`);
      }

      const result = await response.json();

      const userData = {
        id: result.id,
        email: result.email,
        fullName: result.fullName,
        role: result.role,
        aadharNumber: result.aadharNumber,
        phoneNumber: result.phoneNumber,
      };

      setCurrentUser(userData);
      localStorage.setItem("civiceye_user", JSON.stringify(userData));
      localStorage.setItem("userRole", result.role);

      toast({
        title: `Welcome back, ${result.fullName}!`,
        description: `Logged in as ${result.role.toUpperCase()}`,
      });

      onLogin(result.role as UserRole);
    } catch (error: any) {
      console.error("❌ Login failed:", error);
      toast({
        title: "Authentication Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignupSubmit = async (data: any) => {
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.name,
          email: data.email.toLowerCase(),
          password: data.password,
          aadharNumber: data.aadhar,
          role: data.role || "citizen",
          phoneNumber: data.phone_number || null,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Registration failed");
      }

      toast({
        title: "Account Created Successfully!",
        description: "You earned 50 welcome reward points. Please log in.",
      });

      setView("login");
    } catch (error: any) {
      console.error("❌ Signup failed:", error);
      toast({
        title: "Registration Error",
        description: error.message || "Could not complete registration.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" data-testid="page-auth">
      {view === "login" ? (
        <LoginForm
          onLogin={handleLoginSubmit}
          onForgotPassword={() =>
            toast({
              title: "Password Recovery",
              description: "For demo accounts, use password 'citizen123', 'auth123', or 'admin123'.",
            })
          }
          onSignup={() => setView("signup")}
        />
      ) : (
        <SignupForm
          onSignup={handleSignupSubmit}
          onLogin={() => setView("login")}
        />
      )}
    </div>
  );
}
