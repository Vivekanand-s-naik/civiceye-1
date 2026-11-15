import { useState, useEffect } from "react";
import { LoginForm } from "@/components/login-form";
import { SignupForm } from "@/components/signup-form";
import { UserRole } from "@/App";
import { useUser } from "@/contexts/UserContext";

type AuthView = "login" | "signup";

interface AuthPageProps {
  onLogin: (role: UserRole) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [view, setView] = useState<AuthView>("login");
  const [backendValue, setBackendValue] = useState<string | null>(null);

  // ✅ Use hook at top-level
  const { setCurrentUser } = useUser();

  // Fetch sample value from FastAPI backend
  useEffect(() => {
    const fetchBackendValue = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/value");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setBackendValue(data.value);
      } catch (error) {
        console.error("Failed to fetch backend value:", error);
      }
    };
    fetchBackendValue();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-4" data-testid="page-auth">
      {backendValue && <p className="absolute top-4 text-gray-500">{backendValue}</p>}

      {view === "login" ? (
        <LoginForm
          onLogin={async (email, password) => {
            try {
              // 🔐 Login handled by Express backend
              const response = await fetch("http://127.0.0.1:3000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.toLowerCase(), password }),
              });

              if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

              const result = await response.json();
              console.log("✅ Login successful:", result);

              // ✅ Create user object
              const userData = {
                id: result.id,
                email: result.email,
                fullName: result.fullName,
                role: result.role,
                aadharNumber: result.aadharNumber,
                phoneNumber: result.phoneNumber,
              };

              // ✅ Save to context and localStorage
              setCurrentUser(userData);
              localStorage.setItem("civiceye_user", JSON.stringify(userData));

              // 🔁 Notify parent (for role-based routing)
              onLogin((result.role as string).toLowerCase() as UserRole);

              // 📤 Optional: notify FastAPI about login (for ML or activity tracking)
              try {
                await fetch("http://127.0.0.1:5000/api/ml/user-login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...userData,
                    loginTime: new Date().toISOString(),
                  }),
                });
              } catch (e) {
                console.warn("⚠️ Failed to sync login to FastAPI backend");
              }
            } catch (error) {
              console.error("❌ Login failed:", error);
              alert("Login failed. Please try again.");
            }
          }}
          onForgotPassword={() => alert("Password recovery not implemented yet.")}
          onSignup={() => setView("signup")}
        />
      ) : (
        <SignupForm
          onSignup={async (data) => {
            try {
              // 🧾 Signup handled by FastAPI backend
              const response = await fetch("http://127.0.0.1:5000/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  full_name: data.name,
                  email: data.email.toLowerCase(),
                  password: data.password,
                  aadhar_number: data.aadhar,
                  role: data.role.toUpperCase(),
                  phone_number: data.phone_number || null,
                }),
              });

              if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
              const result = await response.json();
              console.log("🟢 Signup complete:", result);

              alert("Signup successful! Please log in.");
              setView("login");
            } catch (error) {
              console.error("❌ Signup failed:", error);
              alert("Signup failed. Please try again.");
            }
          }}
          onLogin={() => setView("login")}
        />
      )}
    </div>
  );
}
