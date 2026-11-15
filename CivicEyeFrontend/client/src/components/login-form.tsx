// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Eye, EyeOff, Eye as Logo } from "lucide-react";

// type UserRole = "citizen" | "authority" | "admin";

// interface LoginFormProps {
//   onLogin?: (email: string, password: string, role: UserRole) => void;
//   onForgotPassword?: () => void;
//   onSignup?: () => void;
// }

// export function LoginForm({ onLogin, onForgotPassword, onSignup }: LoginFormProps) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState<UserRole>("citizen");
//   const [showPassword, setShowPassword] = useState(false);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log("Login attempt:", { email, role });
//     onLogin?.(email, password, role);
//   };

//   return (
//     <Card className="w-full max-w-md" data-testid="form-login">
//       <CardHeader className="space-y-1 text-center">
//         <div className="flex justify-center mb-4">
//           <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
//             <Logo className="h-6 w-6" />
//           </div>
//         </div>
//         <CardTitle className="text-2xl">Welcome to CivicEye</CardTitle>
//         <CardDescription>
//           Sign in to report and track civic issues in your community
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="email">Email</Label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="john@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               data-testid="input-email"
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="password">Password</Label>
//             <div className="relative">
//               <Input
//                 id="password"
//                 type={showPassword ? "text" : "password"}
//                 placeholder="••••••••"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 data-testid="input-password"
//               />
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="icon"
//                 className="absolute right-0 top-0 h-full"
//                 onClick={() => setShowPassword(!showPassword)}
//                 data-testid="button-toggle-password"
//               >
//                 {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//               </Button>
//             </div>
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="role">Role</Label>
//             <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
//               <SelectTrigger id="role" data-testid="select-role">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="citizen">Citizen</SelectItem>
//                 <SelectItem value="authority">Authority</SelectItem>
//                 <SelectItem value="admin">Admin</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           <Button type="submit" className="w-full" data-testid="button-login">
//             Sign In
//           </Button>
//         </form>
//       </CardContent>
//       <CardFooter className="flex flex-col space-y-2">
//         <Button
//           variant="ghost"
//           className="text-sm"
//           onClick={onForgotPassword}
//           data-testid="button-forgot-password"
//         >
//           Forgot password?
//         </Button>
//         <div className="text-sm text-center text-muted-foreground">
//           Don't have an account?{" "}
//           <Button variant="ghost" className="p-0 h-auto" onClick={onSignup} data-testid="button-signup-link">
//             Sign up
//           </Button>
//         </div>
//       </CardFooter>
//     </Card>
//   );
// }

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Eye as Logo } from "lucide-react";

// The UserRole type is no longer needed here

interface LoginFormProps {
  // 1. Updated onLogin prop to only expect email and password
  onLogin?: (email: string, password: string) => void;
  onForgotPassword?: () => void;
  onSignup?: () => void;
}

export function LoginForm({ onLogin, onForgotPassword, onSignup }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // 2. Removed the 'role' state

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 3. Pass only email and password to the onLogin function
    onLogin?.(email, password);
  };

  return (
    <Card className="w-full max-w-md" data-testid="form-login">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Logo className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-2xl">Welcome to CivicEye</CardTitle>
        <CardDescription>
          Sign in to report and track civic issues in your community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* 4. The entire 'Role' selection div has been removed */}
          
          <Button type="submit" className="w-full" data-testid="button-login">
            Sign In
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button
          variant="ghost"
          className="text-sm"
          onClick={onForgotPassword}
          data-testid="button-forgot-password"
        >
          Forgot password?
        </Button>
        <div className="text-sm text-center text-muted-foreground">
          Don't have an account?{" "}
          <Button variant="ghost" className="p-0 h-auto" onClick={onSignup} data-testid="button-signup-link">
            Sign up
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
