import type { Metadata } from "next";
import { Playfair_Display, Inter } from "@/lib/font-shim";
import "./globals.css";
import { TimerProvider } from '@/contexts/timer-context'
import { GlobalTimerIndicator } from '@/components/global-timer-indicator'

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IMPROVE | The School of Excellence",
  description: "A heritage-inspired productivity system for the ambitious.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${inter.variable} font-sans antialiased bg-black text-white selection:bg-white selection:text-black`}>
        <TimerProvider>
          {children}
          <GlobalTimerIndicator />
        </TimerProvider>
      </body>
    </html>
  );
}
