import { Navigation } from '@/components/navigation'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--label)] flex flex-col justify-between">
      <Navigation />
      <main className="pt-25 flex-grow">
        {children}
      </main>
      <footer className="border-t border-[var(--separator)] py-8 px-6 text-center text-sm text-[var(--label-2)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-bold text-[var(--label)] tracking-widest uppercase">IMPROVE</span> — Complete Integrity Framework
          </div>
          <div className="flex gap-6 text-xs uppercase tracking-wider text-[var(--label-2)]">
            <a href="/blog" className="hover:text-[var(--label)] transition-colors">Blog</a>
            <a href="/pricing" className="hover:text-[var(--label)] transition-colors">Pricing</a>
            <a href="/sales" className="hover:text-[var(--label)] transition-colors">The System</a>
            <a href="/login" className="hover:text-[var(--label)] transition-colors">Sign In</a>
            <a href="/register" className="hover:text-[var(--label)] transition-colors">Register</a>
          </div>
          <div className="text-xs text-[var(--label-3)]">
            © {new Date().getFullYear()} IMPROVE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
