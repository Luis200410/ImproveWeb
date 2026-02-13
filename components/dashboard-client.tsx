'use client'

import { useEffect, useState, useCallback } from 'react'
import { dataStore, System, Entry } from '@/lib/data-store'
import { Navigation } from '@/components/navigation'
import { useRealtimeSubscription } from '@/hooks/use-realtime-data'
import { CentralHub } from '@/components/central-hub'
import { SystemStatus } from '@/components/hub-node'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Playfair_Display, Inter } from '@/lib/font-shim'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function DashboardClient() {
    const [systems, setSystems] = useState<System[]>([])
    const [systemStatuses, setSystemStatuses] = useState<Record<string, SystemStatus>>({})
    const [userId, setUserId] = useState<string>('defaultUser')

    // Basic data loading
    useEffect(() => {
        import('@/utils/supabase/client').then(({ createClient }) => {
            const supabase = createClient()
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user) setUserId(user.id)
            })
        })
        const loadedSystems = dataStore.getSystems()
        setSystems(loadedSystems)

        // Mock status logic for visual demo - in real app, check for overdue tasks etc.
        const statuses: Record<string, SystemStatus> = {}
        loadedSystems.forEach((sys, i) => {
            // Check 'productivity' for overdue tasks if we wanted real logic
            if (sys.id === 'productivity') statuses[sys.id] = 'operational'
            else if (sys.id === 'money') statuses[sys.id] = 'warning'
            else if (sys.id === 'work') statuses[sys.id] = 'error'
            else statuses[sys.id] = 'operational'
        })
        setSystemStatuses(statuses)
    }, [])

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden flex flex-col">
            <Navigation />

            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[#0a0a0a]" />
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]" />
            </div>

            <main className="flex-1 relative z-10 flex flex-col overflow-y-auto pt-24">
                <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[600px] md:min-h-[900px]">
                    <CentralHub systems={systems} systemStatuses={systemStatuses} />
                </div>
            </main>
        </div>
    )
}
