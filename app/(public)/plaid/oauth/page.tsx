import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Back to Money",
  robots: { index: false, follow: false },
};

// Plaid sends OAuth banks (Chase, Bank of America…) back here. With the Money app installed, iOS opens
// the app through the universal link and this page never shows; it's only the fallback.
export default function PlaidOAuthReturnPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Almost done</h1>
      <p className="text-muted-foreground">
        Your bank finished signing you in. Open the Improve Money app on this iPhone to finish connecting.
      </p>
    </main>
  );
}
