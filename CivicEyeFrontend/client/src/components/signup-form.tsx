import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Eye as Logo } from "lucide-react";

type UserRole = "citizen" | "authority" | "admin";

// interface SignupFormProps {
//   onSignup?: (data: { name: string; email: string; password: string; aadhar: string; role: UserRole }) => void;
//   onLogin?: () => void;
// }
interface SignupFormProps {
  onSignup?: (data: {
    name: string;
    email: string;
    password: string;
    aadhar: string;
    role: UserRole;
    phone_number?: string; // <-- make it optional
  }) => void;
  onLogin?: () => void;
}
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export function SignupForm({ onSignup, onLogin }: SignupFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    aadhar: "",
    role: "citizen" as UserRole,
    password: "",
    confirmPassword: "",
  });
  
  const [displayAadhaar, setDisplayAadhaar] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // 1. Add a new state for Aadhaar visibility
  const [showAadhaar, setShowAadhaar] = useState(false);

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentInput = e.target.value;
    const isDeleting = currentInput.length < (showAadhaar ? formData.aadhar.replace(/(\d{4})(?=\d)/g, '$1 ').length : displayAadhaar.length);
    let newAadhaar = formData.aadhar;

    if (isDeleting) {
      const digitsOnly = currentInput.replace(/\D/g, "");
      newAadhaar = digitsOnly;
    } else {
      const lastChar = currentInput.slice(-1);
      if (/\d/.test(lastChar) && formData.aadhar.length < 12) {
        newAadhaar = formData.aadhar + lastChar;
      }
    }
    
    setFormData({ ...formData, aadhar: newAadhaar });
      
    if (newAadhaar.length > 0) {
      let masked = 'x'.repeat(newAadhaar.length);
      if (newAadhaar.length > 8) {
        masked = 'x'.repeat(8) + newAadhaar.substring(8);
      }
      const formattedMask = masked.replace(/(.{4})(?=.)/g, '$1 ');
      setDisplayAadhaar(formattedMask);
    } else {
      setDisplayAadhaar("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    onSignup?.({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      aadhar: formData.aadhar, 
      role: formData.role, 
    });
  };
  
  // Create a formatted version of the real Aadhaar for when it's visible
  const formattedRealAadhaar = formData.aadhar.replace(/(.{4})(?=.)/g, '$1 ');

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md">
      <Card data-testid="form-signup">
        {/* ... CardHeader and other fields ... */}
        <CardHeader className="space-y-1 text-center px-4 pt-6 sm:px-6 sm:pt-8">
          <motion.div variants={itemVariants} className="flex justify-center mb-4"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground md:h-14 md:w-14"><Logo className="h-6 w-6 md:h-7 md:w-7" /></div></motion.div>
          <motion.div variants={itemVariants}><CardTitle className="text-2xl md:text-3xl">Create an Account</CardTitle></motion.div>
          <motion.div variants={itemVariants}><CardDescription className="text-sm md:text-base px-2">Join CivicEye and start making a difference in your community</CardDescription></motion.div>
        </CardHeader>

        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div variants={itemVariants} className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" type="text" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required data-testid="input-name" /></motion.div>
            <motion.div variants={itemVariants} className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required data-testid="input-email" /></motion.div>
            
            {/* 2. Update the Aadhaar input field to include the button */}
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="aadhar">Aadhaar Number</Label>
              <div className="relative">
                <Input 
                  id="aadhar" 
                  type="text"
                  placeholder="xxxx xxxx 1234"
                  // 3. Conditionally show real or masked value
                  value={showAadhaar ? formattedRealAadhaar : displayAadhaar} 
                  onChange={handleAadhaarChange} 
                  required 
                  data-testid="input-aadhar"
                  maxLength={14}
                  inputMode="numeric"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full" 
                  onClick={() => setShowAadhaar(!showAadhaar)}
                  data-testid="button-toggle-aadhar"
                >
                  {showAadhaar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-2"><Label htmlFor="role">I am a</Label><Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })} ><SelectTrigger id="role" data-testid="select-role"><SelectValue placeholder="Select your role" /></SelectTrigger><SelectContent><SelectItem value="citizen">Citizen</SelectItem><SelectItem value="authority">Authority</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select></motion.div>
            <motion.div variants={itemVariants} className="space-y-2"><Label htmlFor="password">Password</Label><div className="relative"><Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required data-testid="input-password" className={showPassword ? "" : "password-mask"}/><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={() => setShowPassword(!showPassword)} data-testid="button-toggle-password">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></motion.div>
            <motion.div variants={itemVariants} className="space-y-2"><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required data-testid="input-confirm-password" className="password-mask"/></motion.div>
            
            <motion.div variants={itemVariants}><motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}><Button type="submit" className="w-full" data-testid="button-signup">Create Account</Button></motion.div></motion.div>
          </form>
        </CardContent>

        <CardFooter className="text-xs sm:text-sm text-center text-muted-foreground flex justify-center px-4 pb-6 sm:px-6 sm:pb-8"><motion.div variants={itemVariants}>Already have an account?{" "}<Button variant="ghost" className="p-1 h-auto" onClick={onLogin} data-testid="button-login-link">Sign in</Button></motion.div></CardFooter>
      </Card>
    </motion.div>
  );
}
