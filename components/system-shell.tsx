'use client'

import { usePathname } from 'next/navigation'
import { SystemSidebar } from './system-sidebar'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from './ui/button'

export function SystemShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Extract systemId from path: /systems/[systemId]/...
    const segments = pathname.split('/')
    const systemsIndex = segments.indexOf('systems')
    const systemId = systemsIndex !== -1 && segments.length > systemsIndex + 1
        ? segments[systemsIndex + 1]
        : null

    // Close sidebar on navigation on mobile
    useEffect(() => {
        setIsSidebarOpen(false)
    }, [pathname])

    if (!systemId) {
        return <>{children}</>
    }

    return (
        <div className="flex min-h-screen bg-black text-white">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block relative z-20">
                <SystemSidebar systemId={systemId} />
            </div>

            {/* Mobile Sidebar Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
                    isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Mobile Sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 transform transition-transform duration-300 ease-in-out lg:hidden border-r border-white/10",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <SystemSidebar systemId={systemId} className="w-full h-full border-none bg-transparent" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Mobile Header Toggle */}
                <div className="lg:hidden absolute top-4 left-4 z-30">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? <X /> : <Menu />}
                    </Button>
                </div>

                <main className="flex-1 w-full">
                    {children}
                </main>
            </div>
        </div>
    )
}
