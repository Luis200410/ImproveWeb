import { Subscriptions } from '@/components/money/subscriptions'

export default function SubscriptionsPage() {
    return (
        <div className="w-full bg-[#050505] min-h-screen text-neutral-300 p-8 md:p-12">
            <div className="mb-12 max-w-4xl border-b border-neutral-800 pb-6">
                <h1 className="text-4xl text-neutral-100 mb-3 tracking-wide uppercase font-bebas">Structural Outflows</h1>
                <p className="text-neutral-400 text-lg">
                    Automatically detected recurring charges across your linked accounts. Review and assess the underlying absolute weight of your monthly baseline costs.
                </p>
            </div>
            <Subscriptions />
        </div>
    )
}
