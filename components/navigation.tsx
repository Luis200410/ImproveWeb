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
    { href: '/apps', label: 'Improve' },
    { href: '/blog', label: 'The Blog' },
    { href: '/pricing', label: 'Membership' },
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
            className="fixed top-0 left-0 right-0 z-[200] liquid-glass-nav text-[var(--label)] transition-all duration-300"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                    <ImproveLogo small />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
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
                                className="liquid-glass-pill rounded-full text-xs px-4 py-2 text-white hover:bg-white/15 transition-all"
                                onClick={() => setIsMemberMenuOpen((prev) => !prev)}
                            >
                                Member
                            </Button>
                            {isMemberMenuOpen && (
                                <div className="absolute right-0 mt-2 w-64 liquid-glass-dropdown z-50 rounded-[20px] overflow-hidden p-1.5 shadow-2xl">
                                    <div className="flex flex-col divide-y divide-white/10">
                                        {!checkedAuth && (
                                            <div className="px-4 py-3 text-xs uppercase tracking-wider text-[var(--label-2)]">Loading...</div>
                                        )}
                                        {showMemberMenu && (
                                            <>
                                                <a
                                                    href={membershipActive ? (process.env.NEXT_PUBLIC_APP_URL || '/pricing') : '/pricing?reason=subscribe'}
                                                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--label)] hover:bg-white/10 flex items-center justify-between rounded-[14px] transition-colors"
                                                    onClick={() => setIsMemberMenuOpen(false)}
                                                >
                                                    {membershipActive ? 'Open App' : 'View Membership'}
                                                    <span className="tag-chip text-[10px]">
                                                        {membershipActive ? 'Active' : 'Upgrade'}
                                                    </span>
                                                </a>
                                                <Link
                                                    href="/profile"
                                                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--label)] hover:bg-white/10 rounded-[14px] transition-colors"
                                                    onClick={() => setIsMemberMenuOpen(false)}
                                                >
                                                    Profile
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={handleLogout}
                                                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--label)] hover:bg-white/10 rounded-[14px] disabled:opacity-60 transition-colors"
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
                            <Button className="btn-primary rounded-full text-xs px-5 py-2.5 shadow-[0_0_20px_rgba(94,92,230,0.4)] hover:shadow-[0_0_30px_rgba(94,92,230,0.6)] transition-all">
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
                    className="md:hidden absolute top-full left-0 right-0 border-t border-white/15 liquid-glass-dropdown rounded-none border-x-0 border-b-0 backdrop-blur-3xl z-40 overflow-y-auto max-h-[85vh]"
                >
                    <div className="px-6 py-6 space-y-6">
                        <div className="space-y-4">
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
