'use client'

import { motion } from 'framer-motion'
import { Activity, Zap, Triangle } from 'lucide-react'
import { Inter } from '@/lib/font-shim'

const inter = Inter({ subsets: ['latin'] })

interface ActivityItem {
    id: string
    timestamp: string
    action: string
    target: string
    type: 'system' | 'security' | 'data' | 'collab'
}

export function ActivityStream() {
    return (
        <div className="h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <h3 className="text-amber-500 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                    ACTIVITY_STREAM
                </h3>
                <Zap className="w-3 h-3 text-amber-500 animate-pulse" />
            </div>

            <div className="space-y-8 flex-1">
                <ActivityItem timestamp="22:38:12" type="COLLAB_SYNC"
                    content={<>Architect-04 pushed update to <span className="text-amber-500">CORE_LOGIC_V4</span>. Review required.</>}
                />

                <ActivityItem timestamp="22:35:04" type="SYSTEM_ALERT"
                    content={<>Node <span className="text-red-500">0x99B</span> reporting packet loss in sector G-7.</>}
                />

                <ActivityItem timestamp="22:30:59" type="DATA_FLOW"
                    content={<>Cross-continental relay established. Protocol <span className="text-amber-500">TLS_OS_1.4</span> active.</>}
                />

                <ActivityItem timestamp="22:28:44" type="USER_AUTH"
                    content={<>Terminal-ID <span className="text-amber-500">0x882A</span> validated. Biometric override confirmed.</>}
                />

                <ActivityItem timestamp="22:15:22" type="AUTO_LOG"
                    content={<span className="opacity-50">System health check completed. All subsystems nominal.</span>}
                />
            </div>

            {/* Priority Override Section at bottom */}
            <div className="mt-8 pt-6 border-t border-white/10">
                <div className="bg-[#1a0f0f] border border-red-500/20 p-4 rounded flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <Triangle className="w-3 h-3 text-red-500 fill-current" />
                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Priority Override</span>
                    </div>
                    <p className={`${inter.className} text-[10px] text-white/40`}>
                        Secure link required for manual node override.
                    </p>
                    <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/60 text-[10px] uppercase tracking-[0.2em] border border-white/10 hover:border-white/20 transition-all font-bold">
                        OVERRIDE SYSTEM
                    </button>
                </div>
            </div>
        </div>
    )
}

function ActivityItem({ timestamp, type, content }: { timestamp: string, type: string, content: React.ReactNode }) {
    return (
        <div className="relative pl-4 border-l border-white/5 group hover:border-amber-500/50 transition-colors">

            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-amber-500 font-mono tracking-widest opacity-80">
                    {timestamp}
                </span>
                <span className="text-[8px] uppercase tracking-widest text-white/20 text-right">
                    {type}
                </span>
            </div>

            <p className={`${inter.className} text-xs text-white/60 leading-relaxed font-light mt-1`}>
                {content}
            </p>
        </div>
    )
}
