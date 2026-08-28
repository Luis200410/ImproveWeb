'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bebas_Neue } from '@/lib/font-shim'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ImproveLogo } from '@/components/ui/improve-logo'
import { APPS_DATA } from '@/lib/apps-data'
import { ChevronDown, Sparkles, Activity, Brain, Wallet, Briefcase, CheckCircle2, Users, Compass, Crown } from 'lucide-react'

const bebas = Bebas_Neue({ subsets: ['latin'] })

interface NavLink {
    href: string
    label: string
}

const publicLinks: NavLink[] = [
    { href: '/blog', label: 'The Blog' },
    { href: '/pricing', label: 'Membership' },
    { href: '/sales', label: 'The System' },
]

const iconMap: Record<string, any> = {
    Activity,
    Brain,
    Wallet,
    Briefcase,
    CheckCircle2,
    Users,
    Compass,
    Crown
}

export function Navigation() {
    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isMemberMenuOpen, setIsMemberMenuOpen] = useState(false)
    const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false)
    const [sessionUser, setSessionUser] = useState<any>(null)
    const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
    const [checkedAuth, setCheckedAuth] = useState(false)
    const [signingOut, setSigningOut] = useState(false)

    useEffect(() => {
        let active = true

        async function loadUserAndStatus(userId?: string) {
            if (!userId) {
                setSubscriptionStatus(null)
                return
            }
            const supabase = createClient()
            const { data: entry } = await supabase
                .from('entries')
                .select('data')
                .eq('microapp_id', 'subscription-status')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            const raw = entry?.data
            const parsed = typeof raw === 'string' ? (() => {
                try { return JSON.parse(raw) } catch { return null }
            })() : raw
            const status = (parsed?.status as string | undefined)?.toLowerCase() || null
            if (active) {
                setSubscriptionStatus(status)
            }
        }

        async function hydrateFromServer() {
            try {
                const res = await fetch('/api/auth/me', { credentials: 'include' })
                if (!res.ok) throw new Error('auth fetch failed')
                const payload = await res.json()
                if (!active) return
                const authedUser = payload.user || null
                setSessionUser(authedUser)
                setSubscriptionStatus(payload.subscriptionStatus || null)
                setCheckedAuth(true)
                if (authedUser?.id && !payload.subscriptionStatus) {
                    loadUserAndStatus(payload.user.id)
                }
            } catch (err) {
                console.warn('Navigation /api/auth/me failed, falling back to client session', err)
                const supabase = createClient()
                const { data, error } = await supabase.auth.getSession()
                if (error) console.warn('Navigation getSession error', error)
                if (!active) return
                const user = data.session?.user?.id ? data.session.user : null
                setSessionUser(user)
                setCheckedAuth(true)
                loadUserAndStatus(user?.id)
            }
        }

        hydrateFromServer()

        const supabase = createClient()
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            const user = session?.user?.id ? session.user : null
            setSessionUser(user)
            setCheckedAuth(true)
            loadUserAndStatus(user?.id)
        })

        return () => {
            active = false
            listener?.subscription.unsubscribe()
        }
    }, [])

    const showMemberMenu = checkedAuth && Boolean(sessionUser?.id)
    const links = publicLinks
    const membershipActive = subscriptionStatus === 'active' || subscriptionStatus === 'trialing' || sessionUser?.user_metadata?.subscribed || sessionUser?.user_metadata?.is_subscribed || sessionUser?.user_metadata?.couponUnlocked

    async function handleLogout() {
        setSigningOut(true)
        setIsMemberMenuOpen(false)
        window.location.href = '/api/auth/signout'
    }

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-[100] bg-black/85 backdrop-blur-md border-b border-white/10"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-5 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                    <ImproveLogo small />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    {/* The 8 Apps Dropdown Menu */}
                    <div
                        className="relative"
                        onMouseEnter={() => setIsAppsMenuOpen(true)}
                        onMouseLeave={() => setIsAppsMenuOpen(false)}
                    >
                        <button
                            type="button"
                            onClick={() => setIsAppsMenuOpen((prev) => !prev)}
                            className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] transition-colors py-2 ${
                                pathname.startsWith('/apps') ? 'text-amber-400 border-b border-amber-400' : 'text-white/80 hover:text-white'
                            }`}
                        >
                            <span>The 8 Apps</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAppsMenuOpen ? 'rotate-180 text-amber-400' : 'text-white/50'}`} />
                        </button>

                        <AnimatePresence>
                            {isAppsMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-[680px] bg-neutral-950/95 backdrop-blur-2xl border border-white/15 shadow-2xl rounded-2xl p-4 z-50 grid grid-cols-2 gap-2"
                                >
                                    <div className="col-span-2 px-3 py-2 border-b border-white/10 flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                                            <Sparkles className="w-3 h-3" /> The 8 Core Integrity Systems
                                        </span>
                                        <span className="text-[10px] font-mono text-neutral-500">Dedicated App Suites</span>
                                    </div>

                                    {APPS_DATA.map((app) => {
                                        const IconComponent = iconMap[app.iconName] || Sparkles
                                        const isActive = pathname === `/apps/${app.slug}`

                                        return (
                                            <Link
                                                key={app.id}
                                                href={`/apps/${app.slug}`}
                                                onClick={() => setIsAppsMenuOpen(false)}
                                                className={`group relative p-3 rounded-xl transition-all duration-200 flex items-start gap-3 border ${
                                                    isActive
                                                        ? 'bg-white/10 border-amber-500/50'
                                                        : 'bg-white/[0.02] border-white/5 hover:bg-white/10 hover:border-white/20'
                                                }`}
                                            >
                                                <div className={`p-2 rounded-lg bg-black/60 border ${app.borderColor} text-white group-hover:scale-105 transition-transform`}>
                                                    <IconComponent className="w-4 h-4 text-amber-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-white uppercase tracking-wider truncate group-hover:text-amber-300 transition-colors">
                                                            {app.name}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-neutral-500 ml-1">
                                                            {app.number}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5 font-light">
                                                        {app.tagline}
                                                    </p>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-xs font-medium uppercase tracking-[0.2em] transition-colors ${
                                pathname === link.href
                                    ? 'text-white border-b border-white pb-1'
                                    : 'text-white/60 hover:text-white'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {showMemberMenu && (
                        <a
                            href={process.env.NEXT_PUBLIC_APP_URL || '#'}
                            className="text-xs font-medium uppercase tracking-[0.2em] transition-colors text-white/60 hover:text-white"
                        >
                            Open App
                        </a>
                    )}

                    {showMemberMenu ? (
                        <div
                            className="relative"
                            onMouseEnter={() => setIsMemberMenuOpen(true)}
                            onMouseLeave={() => setIsMemberMenuOpen(false)}
                        >
                            <Button
                                variant="outline"
                                className="font-bebas border-white text-white hover:bg-white hover:text-black transition-all bg-transparent"
                                onClick={() => setIsMemberMenuOpen((prev) => !prev)}
                            >
                                Member
                            </Button>
                            {isMemberMenuOpen && (
                                <div className="absolute right-0 mt-1 w-64 bg-black border border-white/15 shadow-2xl z-50 rounded-xl overflow-hidden">
                                    <div className="flex flex-col divide-y divide-white/10">
                                        {!checkedAuth && (
                                            <div className="px-4 py-3 text-sm uppercase tracking-[0.15em] text-white/70">Loading...</div>
                                        )}
                                        {showMemberMenu && (
                                            <>
                                                <a
                                                    href={membershipActive ? (process.env.NEXT_PUBLIC_APP_URL || '/pricing') : '/pricing?reason=subscribe'}
                                                    className="px-4 py-3 text-sm uppercase tracking-[0.15em] text-white hover:bg-white/10 flex items-center justify-between"
                                                    onClick={() => setIsMemberMenuOpen(false)}
                                                >
                                                    {membershipActive ? 'Open App' : 'View Membership'}
                                                    <span className="text-[11px] border border-white/40 px-2 py-1 ml-2">
                                                        {membershipActive ? 'Active' : 'Upgrade'}
                                                    </span>
                                                </a>
                                                <Link
                                                    href="/profile"
                                                    className="px-4 py-3 text-sm uppercase tracking-[0.15em] text-white hover:bg-white/10"
                                                    onClick={() => setIsMemberMenuOpen(false)}
                                                >
                                                    Profile
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={handleLogout}
                                                    className="text-left px-4 py-3 text-sm uppercase tracking-[0.15em] text-white hover:bg-white/10 disabled:opacity-60"
                                                    disabled={signingOut}
                                                >
                                                    {signingOut ? 'Logging out...' : 'Log Out'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button variant="outline" className="font-bebas border-white text-white hover:bg-white hover:text-black transition-all bg-transparent">
                                Member Login
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden text-white p-2"
                    aria-label="Toggle menu"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        {isMenuOpen ? (
                            <path d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="md:hidden absolute top-full left-0 right-0 border-t border-white/10 bg-black/95 backdrop-blur-xl z-40 overflow-y-auto max-h-[85vh]"
                >
                    <div className="px-6 py-6 space-y-6">
                        {/* Mobile Apps Section */}
                        <div className="space-y-3">
                            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block border-b border-white/10 pb-2">
                                The 8 App Suites
                            </span>
                            <div className="grid grid-cols-1 gap-2 pt-1">
                                {APPS_DATA.map((app) => (
                                    <Link
                                        key={app.id}
                                        href={`/apps/${app.slug}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10"
                                    >
                                        <span className="text-sm font-semibold uppercase">{app.name}</span>
                                        <span className="text-xs font-mono text-amber-400">{app.number}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-4 space-y-4">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block text-lg font-medium uppercase tracking-[0.2em] transition-colors ${
                                        pathname === link.href ? 'text-white' : 'text-white/60 hover:text-white'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {!showMemberMenu && (
                            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                <Button className="w-full bg-white text-black hover:bg-white/90 font-bebas text-base uppercase tracking-widest py-6">
                                    Member Login
                                </Button>
                            </Link>
                        )}
                        {showMemberMenu && (
                            <div className="pt-4 border-t border-white/10 space-y-4">
                                <a
                                    href={membershipActive ? (process.env.NEXT_PUBLIC_APP_URL || '/pricing') : '/pricing?reason=subscribe'}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block text-sm font-medium uppercase tracking-[0.2em] text-white/80 hover:text-white"
                                >
                                    {membershipActive ? 'Open App' : 'View Membership'}
                                </a>
                                <Link
                                    href="/profile"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block text-sm font-medium uppercase tracking-[0.2em] text-white/80 hover:text-white"
                                >
                                    Profile
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="block w-full text-left text-sm font-medium uppercase tracking-[0.2em] text-white/80 hover:text-white"
                                >
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.nav>
    )
}
