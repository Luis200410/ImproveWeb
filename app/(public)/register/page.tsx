import { Suspense } from "react";
import { AuthUI } from "@/components/auth/auth-ui";

export const metadata = {
  title: "Create Account • IMPROVE Sovereign Life OS",
  description: "Initialize your 7 interconnected pillars in under 60 seconds. Zero cloud surveillance.",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07050A]" />}>
      <AuthUI initialIsSignIn={false} />
    </Suspense>
  );
}
