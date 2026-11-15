import { LoginForm } from "../login-form";

export default function LoginFormExample() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <LoginForm
        onLogin={(email: string, password: string) => console.log("Login:", { email })}
        onForgotPassword={() => console.log("Forgot password clicked")}
        onSignup={() => console.log("Signup clicked")}
      />
    </div>
  );
}
