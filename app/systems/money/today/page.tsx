import { TodayScreen } from '@/components/money/today-screen'

export default function TodayPage() {
    return (
        <div className="w-full bg-[#050505] min-h-screen text-neutral-300 p-8 md:p-12">
            <div className="mb-12 max-w-4xl border-b border-neutral-800 pb-6">
                <h1 className="text-4xl text-neutral-100 mb-3 tracking-wide uppercase font-bebas">Daily Decisions</h1>
                <p className="text-neutral-400 text-lg font-light leading-relaxed">
                    Action incoming financial items. Plaid automatically scans your latest transactions and alerts you to idle cash, new structural costs, or spending deviations. Act on them immediately or skip them to log friction.
                </p>
            </div>
            <TodayScreen />
        </div>
    )
}
