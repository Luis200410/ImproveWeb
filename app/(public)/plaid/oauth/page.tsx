import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Back to IMPROVE Money",
  robots: { index: false, follow: false },
  icons: { icon: "/plaid/money-logo-1024.png", apple: "/plaid/money-logo-1024.png" },
};

// Plaid sends OAuth banks (Chase, Bank of America…) back here. With the Money app installed, iOS opens
// the app through the universal link and this page never shows; it's only the fallback.
export default function PlaidOAuthReturnPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-5 px-4 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/plaid/money-logo-1024.png"
        alt="IMPROVE Money"
        width={88}
        height={88}
        className="rounded-[20px] shadow-lg"
      />
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-wide text-[#EFB219]">IMPROVE Money</p>
        <h1 className="text-2xl font-semibold">Almost done</h1>
        <p className="text-muted-foreground">
          Your bank finished signing you in. Open the IMPROVE Money app on this iPhone to finish connecting.
        </p>
      </div>
      <a href="improve-money://" className="rounded-[10px] bg-[#EFB219] px-5 py-3 text-sm font-semibold text-black">
        Open IMPROVE Money
      </a>
    </main>
  );
}
