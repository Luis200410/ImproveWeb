import { Envelopes } from '@/components/money/envelopes'

export default function EnvelopesPage() {
    return (
        <div className="w-full bg-[#050505] min-h-screen text-neutral-300 p-8 md:p-12">
            <div className="mb-12 max-w-4xl border-b border-neutral-800 pb-6">
                <h1 className="text-4xl text-neutral-100 mb-3 tracking-wide uppercase font-bebas">Behavioral Zones</h1>
                <p className="text-neutral-400 text-lg">
                    Smart spending rhythms determined dynamically by your transaction history. Monitor category velocity with the pace gauge indicator instead of rigid, manual monthly limits.
                </p>
            </div>
            <Envelopes />
        </div>
    )
}
