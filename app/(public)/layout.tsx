import { Navigation } from '@/components/navigation'
import { CircuitBackground } from '@/components/general/circuit-background'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black text-[var(--label)] flex flex-col justify-between relative selection:bg-white/20">
      {/* Universal Interconnected Smooth Circuit Background */}
      <CircuitBackground />
      <Navigation />
      <main className="pt-25 flex-grow relative z-10">
        {children}
      </main>
      <footer className="border-t border-[var(--separator)] py-8 px-6 text-center text-sm text-[var(--label-2)] relative z-10 bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-bold text-[var(--label)] tracking-widest uppercase">IMPROVE</span> — Complete Integrity Framework
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs uppercase tracking-wider text-[var(--label-2)]">
            <a href="/sales" className="hover:text-[var(--label)] transition-colors">The System</a>
            <a href="/pricing" className="hover:text-[var(--label)] transition-colors">Pricing</a>
            <a href="/privacy" className="hover:text-[var(--label)] transition-colors">Privacy & Consent</a>
            <a href="/terms" className="hover:text-[var(--label)] transition-colors">Terms of Service</a>
            <a href="/refund" className="hover:text-[var(--label)] transition-colors">Refund Policy</a>
            <a href="/blog" className="hover:text-[var(--label)] transition-colors">Blog</a>
            <a href="/login" className="hover:text-[var(--label)] transition-colors">Sign In</a>
          </div>
          <div className="text-xs text-[var(--label-3)]">
            © {new Date().getFullYear()} IMPROVE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
