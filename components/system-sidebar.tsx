'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { dataStore } from '@/lib/data-store'
import { cn } from '@/lib/utils'
import { ArrowLeft, LayoutGrid } from 'lucide-react'
import { Playfair_Display } from '@/lib/font-shim'
import { useEffect, useState } from 'react'
import { System } from '@/lib/data-store'

const playfair = Playfair_Display({ subsets: ['latin'] })

interface SystemSidebarProps {
    systemId: string
    className?: string
}

export function SystemSidebar({ systemId, className }: SystemSidebarProps) {
    const pathname = usePathname()
    const [system, setSystem] = useState<System | null>(null)

    useEffect(() => {
        const s = dataStore.getSystem(systemId)
        setSystem(s || null)
    }, [systemId])

    if (!system) return null

    return (
        <div className={cn("w-64 flex-shrink-0 border-r border-white/10 bg-black/40 backdrop-blur-xl h-screen sticky top-0 flex flex-col", className)}>
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-3 h-3" />
                    Back
                </Link>

                <div className="flex items-center gap-3">
                    <span className="text-2xl">{system.icon}</span>
                    <h2 className={cn(playfair.className, "text-xl font-bold text-white")}>
                        {system.name}
                    </h2>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                <Link
                    href={`/systems/${systemId}`}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group",
                        pathname === `/systems/${systemId}`
                            ? "bg-white/10 text-white font-medium"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                >
                    <LayoutGrid className="w-4 h-4 opacity-70" />
                    <span>Overview</span>
                    {pathname === `/systems/${systemId}` && (
                        <motion.div
                            layoutId="active-nav"
                            className="ml-auto w-1 h-1 rounded-full bg-white"
                        />
                    )}
                </Link>

                <div className="my-4 pt-4 border-t border-white/5 px-3">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-2">
                        Micro-Apps
                    </p>
                </div>

                {system.microapps.map((app) => {
                    const isActive = pathname.includes(app.id) || pathname === app.customPath
                    const href = app.customPath || `/systems/${systemId}/${app.id}`

                    return (
                        <Link
                            key={app.id}
                            href={href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group relative",
                                isActive
                                    ? "bg-white/10 text-white font-medium shadow-sm"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <span className="text-base leading-none opacity-80">{app.icon}</span>
                            <span>{app.name}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav-item"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-1/2 bg-white rounded-r-full"
                                />
                            )}
                        </Link>
                    )
                })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="text-[10px] text-white/30 text-center uppercase tracking-widest">
                    {system.name} System
                </div>
            </div>
        </div>
    )
}
