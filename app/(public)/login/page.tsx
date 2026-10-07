import { Suspense } from "react";
import { AuthUI } from "@/components/auth/auth-ui";

export const metadata = {
  title: "Sign In • IMPROVE Sovereign Life OS",
  description: "Access your unified 7-pillar workspace and on-device neural engine.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07050A]" />}>
      <AuthUI initialIsSignIn={true} />
    </Suspense>
  );
}
