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
            try {
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
            } catch {
                // Ignore failure
            }
        }

        async function hydrateFromServer() {
            const controller = new AbortController()
            const timer = setTimeout(() => controller.abort(), 1200)

            try {
                const res = await fetch('/api/auth/me', { 
                    credentials: 'include',
                    signal: controller.signal
                })
                clearTimeout(timer)
                if (!res.ok) throw new Error('auth fetch failed')
                const payload = await res.json()
                if (!active) return
                const authedUser = payload.user || null
                setSessionUser(authedUser)
                setSubscriptionStatus(payload.subscriptionStatus || null)
                setCheckedAuth(true)
                if (authedUser?.id && !payload.subscriptionStatus) {
                    loadUserAndStatus(authedUser.id)
                }
            } catch {
                clearTimeout(timer)
                if (!active) return
                setCheckedAuth(true)
            }
        }

        hydrateFromServer()

        try {
            const supabase = createClient()
            const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
                if (!active) return
                const user = session?.user?.id ? session.user : null
                setSessionUser(user)
                setCheckedAuth(true)
                if (user?.id) {
                    loadUserAndStatus(user.id)
                }
            })

            return () => {
                active = false
                listener?.subscription?.unsubscribe()
            }
        } catch {
            setCheckedAuth(true)
            return () => {
                active = false
            }
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
            className="fixed top-0 left-0 right-0 z-[200] bg-[var(--card)]/85 backdrop-blur-md border-b border-[var(--separator)] text-[var(--label)]"
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
                            className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors py-2 ${
                                pathname.startsWith('/apps') ? 'text-[var(--indigo)] border-b-2 border-[var(--indigo)]' : 'text-[var(--label-2)] hover:text-[var(--label)]'
                            }`}
                        >
                            <span>The 8 Apps</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAppsMenuOpen ? 'rotate-180 text-[var(--indigo)]' : 'text-[var(--label-3)]'}`} />
                        </button>

                        <AnimatePresence>
                            {isAppsMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-[680px] bg-[var(--card)] backdrop-blur-2xl border border-[var(--separator)] shadow-2xl rounded-[20px] p-4 z-50 grid grid-cols-2 gap-2"
                                >
                                    <div className="col-span-2 px-3 py-2 border-b border-[var(--separator)] flex items-center justify-between mb-1">
                                        <span className="type-kicker flex items-center gap-1.5 text-[var(--indigo)]">
                                            <Sparkles className="w-3 h-3 text-[var(--indigo)]" /> The 8 Core Integrity Systems
                                        </span>
                                        <span className="type-subcaption text-[var(--label-3)]">Dedicated App Suites</span>
                                    </div>

                                    {APPS_DATA.map((app) => {
                                        const IconComponent = iconMap[app.iconName] || Sparkles
                                        const isActive = pathname === `/apps/${app.slug}`

                                        return (
                                            <Link
                                                key={app.id}
                                                href={`/apps/${app.slug}`}
                                                onClick={() => setIsAppsMenuOpen(false)}
                                                className={`group relative p-3 rounded-[14px] transition-all duration-200 flex items-start gap-3 border ${
                                                    isActive
                                                        ? 'bg-[var(--card-inset)] border-[var(--indigo)]'
                                                        : 'bg-[var(--card-inset)]/40 border-[var(--separator)] hover:bg-[var(--card-inset)]'
                                                }`}
                                            >
                                                <div className="icon-box-tint group-hover:scale-105 transition-transform">
                                                    <IconComponent className="w-4 h-4 text-[var(--indigo)]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="type-headline text-xs font-bold text-[var(--label)] uppercase tracking-wider truncate group-hover:text-[var(--indigo)] transition-colors">
                                                            {app.name}
                                                        </span>
                                                        <span className="font-rounded text-[10px] text-[var(--label-3)] ml-1">
                                                            {app.number}
                                                        </span>
                                                    </div>
                                                    <p className="type-caption text-[11px] text-[var(--label-2)] line-clamp-1 mt-0.5">
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
                            className={`text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                                pathname === link.href
                                    ? 'text-[var(--label)] border-b-2 border-[var(--indigo)] pb-1'
                                    : 'text-[var(--label-2)] hover:text-[var(--label)]'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {showMemberMenu && (
                        <a
                            href={process.env.NEXT_PUBLIC_APP_URL || '#'}
                            className="text-xs font-semibold uppercase tracking-[0.14em] transition-colors text-[var(--label-2)] hover:text-[var(--label)]"
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
                                className="btn-secondary rounded-full text-xs px-4 py-2"
                                onClick={() => setIsMemberMenuOpen((prev) => !prev)}
                            >
                                Member
                            </Button>
                            {isMemberMenuOpen && (
                                <div className="absolute right-0 mt-1 w-64 bg-[var(--card)] border border-[var(--separator)] shadow-2xl z-50 rounded-[20px] overflow-hidden p-1">
                                    <div className="flex flex-col divide-y divide-[var(--separator)]">
                                        {!checkedAuth && (
                                            <div className="px-4 py-3 text-xs uppercase tracking-wider text-[var(--label-2)]">Loading...</div>
                                        )}
                                        {showMemberMenu && (
                                            <>
                                                <a
                                                    href={membershipActive ? (process.env.NEXT_PUBLIC_APP_URL || '/pricing') : '/pricing?reason=subscribe'}
                                                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--label)] hover:bg-[var(--fill)] flex items-center justify-between rounded-[14px]"
                                                    onClick={() => setIsMemberMenuOpen(false)}
                                                >
                                                    {membershipActive ? 'Open App' : 'View Membership'}
                                                    <span className="tag-chip text-[10px]">
                                                        {membershipActive ? 'Active' : 'Upgrade'}
                                                    </span>
                                                </a>
                                                <Link
                                                    href="/profile"
                                                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--label)] hover:bg-[var(--fill)] rounded-[14px]"
                                                    onClick={() => setIsMemberMenuOpen(false)}
                                                >
                                                    Profile
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={handleLogout}
                                                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--label)] hover:bg-[var(--fill)] rounded-[14px] disabled:opacity-60"
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
                            <Button className="btn-primary rounded-full text-xs px-4 py-2">
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
