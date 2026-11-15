import { SignupForm } from "../signup-form";

export default function SignupFormExample() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SignupForm
        onSignup={(data) => console.log("Signup:", data)}
        onLogin={() => console.log("Login clicked")}
      />
    </div>
  );
}
