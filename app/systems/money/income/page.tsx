import { IncomeManager } from '@/components/money/income'

export default function IncomePage() {
    return (
        <div className="w-full bg-[#050505] min-h-screen text-neutral-300 p-8 md:p-12">
            <div className="mb-12 max-w-4xl border-b border-neutral-800 pb-6">
                <h1 className="text-4xl text-neutral-100 mb-3 tracking-wide uppercase font-bebas">Income Classification</h1>
                <p className="text-neutral-400 text-lg">
                    Tag irregular deposits directly from Plaid to build accurate predictive models. Differentiate between expected structural bonuses and unpredictable freelance windfalls.
                </p>
            </div>
            <IncomeManager />
        </div>
    )
}
