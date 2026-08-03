import { GoalsSimulator } from '@/components/money/goals'

export default function SimulatorPage() {
    return (
        <div className="w-full bg-[#050505] min-h-screen text-neutral-300 p-8 md:p-12">
            <div className="mb-12 max-w-4xl border-b border-neutral-800 pb-6">
                <h1 className="text-4xl text-neutral-100 mb-3 tracking-wide uppercase font-bebas">Trade-Off Simulator</h1>
                <p className="text-neutral-400 text-lg">
                    Analyze the mathematical impact of adopting new savings goals. Review parallel trajectory tracks and assess required spending squeeze adjustments before committing.
                </p>
            </div>
            <GoalsSimulator />
        </div>
    )
}
