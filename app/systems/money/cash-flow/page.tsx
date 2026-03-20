import { CashFlowChart } from '@/components/money/cash-flow'

export default function CashFlowPage() {
    return (
        <div className="w-full bg-[#050505] min-h-screen text-neutral-300 p-8 md:p-12">
            <div className="mb-12 max-w-4xl border-b border-neutral-800 pb-6">
                <h1 className="text-4xl text-neutral-100 mb-3 tracking-wide uppercase font-bebas">Cash Flow Horizon</h1>
                <p className="text-neutral-400 text-lg">
                    Projected forward line over 30, 60, and 90-day intervals. Anticipate balance drops before they hit your buffer threshold based on recognized income and detected structural charges.
                </p>
            </div>
            <CashFlowChart />
        </div>
    )
}
