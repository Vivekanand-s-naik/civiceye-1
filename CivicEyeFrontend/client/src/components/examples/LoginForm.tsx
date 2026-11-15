import { LoginForm } from "../login-form";

export default function LoginFormExample() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <LoginForm
        onLogin={(email, password, role) => console.log("Login:", { email, role })}
        onForgotPassword={() => console.log("Forgot password clicked")}
        onSignup={() => console.log("Signup clicked")}
      />
    </div>
  );
}
