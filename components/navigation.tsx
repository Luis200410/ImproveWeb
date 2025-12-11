'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Playfair_Display } from '@/lib/font-shim'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const playfair = Playfair_Display({ subsets: ['latin'] })

interface NavLink {
    href: string
    label: string
}

const publicLinks: NavLink[] = [
    { href: '/about', label: 'Manifesto' },
    { href: '/pricing', label: 'Membership' },
    { href: '/sales', label: 'The System' },
]

const authenticatedLinks: NavLink[] = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/profile', label: 'Profile' },
]

export function Navigation({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isMemberMenuOpen, setIsMemberMenuOpen] = useState(false)
    const [sessionUser, setSessionUser] = useState<any>(null)
    const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
    const [checkedAuth, setCheckedAuth] = useState(false)

    useEffect(() => {
        let active = true

        async function loadUserAndStatus(userId?: string) {
            if (!userId) {
                setSubscriptionStatus(null)
                return
            }
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

        supabase.auth.getSession().then(({ data }) => {
            if (!active) return
            const user = data.session?.user || null
            setSessionUser(user)
            setCheckedAuth(true)
            loadUserAndStatus(user?.id)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            const user = session?.user || null
            setSessionUser(user)
            setCheckedAuth(true)
            loadUserAndStatus(user?.id)
        })

        return () => {
            active = false
            listener?.subscription.unsubscribe()
        }
    }, [])

    const effectiveAuthenticated = Boolean(sessionUser) || isAuthenticated
    const links = effectiveAuthenticated ? authenticatedLinks : publicLinks
    const membershipActive = subscriptionStatus === 'active' || subscriptionStatus === 'trialing' || sessionUser?.user_metadata?.subscribed || sessionUser?.user_metadata?.is_subscribed || sessionUser?.user_metadata?.couponUnlocked

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10"
        >
            <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
                {/* Logo */}
                <Link href={isAuthenticated ? '/dashboard' : '/'} className={`${playfair.className} text-2xl font-bold tracking-tight text-white hover:text-white/80 transition-colors`}>
                    IMPROVE
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-xs font-medium uppercase tracking-[0.2em] transition-colors ${pathname === link.href
                                    ? 'text-white border-b border-white pb-1'
                                    : 'text-white/60 hover:text-white'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {!effectiveAuthenticated && (
                        <Link href="/login">
                            <Button variant="outline" className="font-serif border-white text-white hover:bg-white hover:text-black transition-all bg-transparent">
                                Member Login
                            </Button>
                        </Link>
                    )}

                    {effectiveAuthenticated && (
                        <div className="relative">
                            <Button
                                variant="outline"
                                className="font-serif border-white text-white hover:bg-white hover:text-black transition-all bg-transparent"
                                onClick={() => setIsMemberMenuOpen(prev => !prev)}
                            >
                                Member
                            </Button>
                            {isMemberMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-black border border-white/10 shadow-xl z-50">
                                    <div className="flex flex-col divide-y divide-white/10">
                                        <Link
                                            href={membershipActive ? '/dashboard' : '/pricing?reason=subscribe'}
                                            className="px-4 py-3 text-sm uppercase tracking-[0.15em] text-white hover:bg-white/10"
                                            onClick={() => setIsMemberMenuOpen(false)}
                                        >
                                            {membershipActive ? 'Go to Dashboard' : 'View Membership'}
                                        </Link>
                                        <Link
                                            href="/profile"
                                            className="px-4 py-3 text-sm uppercase tracking-[0.15em] text-white hover:bg-white/10"
                                            onClick={() => setIsMemberMenuOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden text-white"
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
                    className="md:hidden border-t border-white/10 bg-black"
                >
                    <div className="px-8 py-6 space-y-4">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block text-sm font-medium uppercase tracking-[0.2em] transition-colors ${pathname === link.href ? 'text-white' : 'text-white/60 hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {!effectiveAuthenticated && (
                            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                <Button variant="outline" className="w-full font-serif border-white text-white hover:bg-white hover:text-black transition-all bg-transparent">
                                    Member Login
                                </Button>
                            </Link>
                        )}
                        {effectiveAuthenticated && (
                            <div className="space-y-3">
                                <Link
                                    href={membershipActive ? '/dashboard' : '/pricing?reason=subscribe'}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block text-sm font-medium uppercase tracking-[0.2em] text-white/80 hover:text-white"
                                >
                                    {membershipActive ? 'Go to Dashboard' : 'View Membership'}
                                </Link>
                                <Link
                                    href="/profile"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block text-sm font-medium uppercase tracking-[0.2em] text-white/80 hover:text-white"
                                >
                                    Profile
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.nav>
    )
}
