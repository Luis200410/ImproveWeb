import type { Metadata } from "next";
import { Playfair_Display, Inter } from "@/lib/font-shim";
import "./globals.css";
import { TimerProvider } from '@/contexts/timer-context'
import { GlobalTimerIndicator } from '@/components/global-timer-indicator'
import { PomodoroProvider } from '@/components/productivity/pomodoro/pomodoro-context'
import { ActiveSessionSidebar, MinimizedSessionWidget } from '@/components/productivity/pomodoro/active-session-sidebar'
import { Toaster } from 'sileo'
import 'sileo/styles.css'

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
        <PomodoroProvider>
          <TimerProvider>
            {children}
            <GlobalTimerIndicator />
            <ActiveSessionSidebar />
            <MinimizedSessionWidget />
            <Toaster />
          </TimerProvider>
        </PomodoroProvider>
      </body>
    </html>
  );
}
