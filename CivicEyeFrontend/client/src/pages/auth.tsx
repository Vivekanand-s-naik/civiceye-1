import { useState } from "react";
import { LoginForm } from "@/components/login-form";
import { SignupForm } from "@/components/signup-form";
import { UserRole } from "@/App";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, KeyRound, ArrowLeft, Loader2, Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react";

type AuthView = "login" | "signup" | "forgot-password" | "reset-password";

interface AuthPageProps {
  onLogin: (role: UserRole) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [view, setView] = useState<AuthView>("login");
  const { setCurrentUser } = useUser();
  const { toast } = useToast();

  // Password Recovery State
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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
        zone: result.zone,
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

  // Step 1: Send OTP to Email
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your registered email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Failed to send reset code (${response.status})`);
      }

      toast({
        title: "Verification Code Sent!",
        description: `We've emailed a 6-digit reset code to ${cleanEmail}. Please check your inbox.`,
      });

      setView("reset-password");
    } catch (err: any) {
      console.error("Forgot password request failed:", err);
      toast({
        title: "Error Sending Code",
        description: err.message || "Could not send verification email. Please check the email address.",
        variant: "destructive",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Validate OTP and Set New Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = resetEmail.trim().toLowerCase();
    const cleanOtp = resetOtp.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      toast({
        title: "Valid Code Required",
        description: "Please enter the 6-digit verification code from your email.",
        variant: "destructive",
      });
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 4 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Do Not Match",
        description: "Please make sure your new passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          otp: cleanOtp,
          newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Failed to reset password (${response.status})`);
      }

      toast({
        title: "Password Reset Successful!",
        description: "Your password has been updated. You can now sign in.",
      });

      // Reset form states
      setResetOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setView("login");
    } catch (err: any) {
      console.error("Reset password failed:", err);
      toast({
        title: "Reset Failed",
        description: err.message || "Invalid or expired verification code.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" data-testid="page-auth">
      {view === "login" && (
        <LoginForm
          onLogin={handleLoginSubmit}
          onForgotPassword={() => {
            setResetEmail("");
            setView("forgot-password");
          }}
          onSignup={() => setView("signup")}
        />
      )}

      {view === "signup" && (
        <SignupForm
          onSignup={handleSignupSubmit}
          onLogin={() => setView("login")}
        />
      )}

      {view === "forgot-password" && (
        <Card className="w-full max-w-md shadow-xl border-border/60">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <Mail className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password?</CardTitle>
            <CardDescription>
              Enter your registered CivicEye email and we'll send a 6-digit verification code to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Account Email Address</Label>
                <div className="relative">
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="name@civiceye.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="h-10 pl-10"
                    autoFocus
                  />
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                disabled={isSendingOtp}
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Verification Code...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setView("login")}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Button>
          </CardFooter>
        </Card>
      )}

      {view === "reset-password" && (
        <Card className="w-full max-w-md shadow-xl border-border/60">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Enter Reset Code</CardTitle>
            <CardDescription>
              We've dispatched a 6-digit verification code to <span className="font-semibold text-foreground">{resetEmail}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-otp">6-Digit Email Verification Code</Label>
                <div className="relative">
                  <Input
                    id="reset-otp"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ""))}
                    required
                    className="h-11 text-center font-mono text-xl tracking-widest pl-10"
                    autoFocus
                  />
                  <KeyRound className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-10 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                disabled={isResetting}
              >
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 border-t pt-4 text-center">
            <button
              type="button"
              onClick={handleForgotPasswordSubmit}
              disabled={isSendingOtp}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              {isSendingOtp ? "Sending new code..." : "Didn't receive code? Resend Code"}
            </button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setView("login")}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
