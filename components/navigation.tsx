'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Playfair_Display } from 'next/font/google'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useState } from 'react'

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
]

export function Navigation({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const links = isAuthenticated ? authenticatedLinks : publicLinks

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

                    {!isAuthenticated && (
                        <Link href="/login">
                            <Button variant="outline" className="font-serif border-white text-white hover:bg-white hover:text-black transition-all bg-transparent">
                                Member Login
                            </Button>
                        </Link>
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
                        {!isAuthenticated && (
                            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                <Button variant="outline" className="w-full font-serif border-white text-white hover:bg-white hover:text-black transition-all bg-transparent">
                                    Member Login
                                </Button>
                            </Link>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.nav>
    )
}
