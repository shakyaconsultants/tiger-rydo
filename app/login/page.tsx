import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-secondary px-4">
      <div className="w-full max-w-md bg-white p-8 border border-brand-lightGrey">
        <h1 className="brand-heading text-2xl mb-2">Portal Login</h1>
        <p className="text-brand-muted mb-6">Admin & Dealer access</p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
