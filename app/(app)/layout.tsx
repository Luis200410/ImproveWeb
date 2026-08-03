import { TimerProvider } from '@/contexts/timer-context'
import { GlobalTimerIndicator } from '@/components/global-timer-indicator'
import { PomodoroProvider } from '@/components/productivity/pomodoro/pomodoro-context'
import { ActiveSessionSidebar, MinimizedSessionWidget } from '@/components/productivity/pomodoro/active-session-sidebar'
import { HabitReminderProvider } from '@/components/habit-reminder-provider'
import { Navigation } from '@/components/navigation'

export default function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PomodoroProvider>
      <TimerProvider>
        <Navigation />
        <main className="pt-25 min-h-screen bg-black text-white">
          {children}
        </main>
        <GlobalTimerIndicator />
        <ActiveSessionSidebar />
        <MinimizedSessionWidget />
        <HabitReminderProvider />
      </TimerProvider>
    </PomodoroProvider>
  )
}
