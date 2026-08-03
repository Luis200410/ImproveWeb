import { Navigation } from '@/components/navigation'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navigation />
      <main className="pt-25 flex-grow">
        {children}
      </main>
      <footer className="border-t border-white/10 py-8 px-6 text-center text-sm text-neutral-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-bold text-white tracking-widest uppercase">IMPROVE</span> — Complete Integrity Framework
          </div>
          <div className="flex gap-6 text-xs uppercase tracking-wider text-neutral-400">
            <a href="/blog" className="hover:text-white transition-colors">Blog</a>
            <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="/sales" className="hover:text-white transition-colors">The System</a>
            <a href="/login" className="hover:text-white transition-colors">Sign In</a>
            <a href="/register" className="hover:text-white transition-colors">Register</a>
          </div>
          <div className="text-xs text-neutral-500">
            © {new Date().getFullYear()} IMPROVE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
