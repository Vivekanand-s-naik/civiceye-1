import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Shield, Users, User, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LoginFormProps {
  onLogin?: (email: string, password: string) => void;
  onForgotPassword?: () => void;
  onSignup?: () => void;
}

export function LoginForm({ onLogin, onForgotPassword, onSignup }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onLogin?.(email, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    onLogin?.(demoEmail, demoPass);
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <Card className="w-full shadow-xl border-border/60" data-testid="form-login">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Shield className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome to CivicEye</CardTitle>
          <CardDescription>
            Turn civic observations into accountable action. Sign in to your portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Official / Citizen Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@civiceye.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-password"
                  className="h-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 font-medium"
              disabled={isSubmitting}
              data-testid="button-login"
            >
              {isSubmitting ? "Authenticating..." : "Sign In to Portal"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-0">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Button
              variant="ghost"
              className="p-0 h-auto font-semibold text-blue-600 hover:underline hover:bg-transparent"
              onClick={onSignup}
              data-testid="button-signup-link"
            >
              Register as Citizen
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Quick Demo Access Bar */}
      <Card className="bg-slate-50/80 dark:bg-slate-900/60 border-dashed border-2">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              ⚡ 1-Click Demo Evaluation Login
            </span>
            <Badge variant="outline" className="text-[10px]">Test All Roles</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoFill("citizen@civiceye.com", "citizen123")}
              className="flex flex-col h-auto py-2 px-1 text-center bg-white dark:bg-slate-800 hover:border-emerald-500"
            >
              <User className="h-4 w-4 text-emerald-600 mb-1" />
              <span className="text-xs font-semibold">Citizen</span>
              <span className="text-[10px] text-muted-foreground">Aditi</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoFill("authority@civiceye.com", "auth123")}
              className="flex flex-col h-auto py-2 px-1 text-center bg-white dark:bg-slate-800 hover:border-blue-500"
            >
              <Shield className="h-4 w-4 text-blue-600 mb-1" />
              <span className="text-xs font-semibold">Authority</span>
              <span className="text-[10px] text-muted-foreground">Officer</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoFill("admin@civiceye.com", "admin123")}
              className="flex flex-col h-auto py-2 px-1 text-center bg-white dark:bg-slate-800 hover:border-purple-500"
            >
              <Users className="h-4 w-4 text-purple-600 mb-1" />
              <span className="text-xs font-semibold">Admin</span>
              <span className="text-[10px] text-muted-foreground">System</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
