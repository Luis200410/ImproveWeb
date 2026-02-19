'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { ActivityStream } from '@/components/profile/activity-stream'
import { ExpertModules } from '@/components/profile/expert-modules'
import { ProfileMap } from '@/components/profile/profile-map'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { updateProfile } from '@/app/profile/actions'
import { User, Shield, Zap, Globe, Cpu, Radio } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

interface ProfileDashboardProps {
    user: any
    fullName: string
    email: string
}

export function ProfileDashboard({ user, fullName, email }: ProfileDashboardProps) {
    const [isEditing, setIsEditing] = useState(false)

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-amber-500/30">
            {/* Background Grid */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <Navigation />

            <main className="relative z-10 pt-24 px-6 pb-12 max-w-[1800px] mx-auto min-h-[calc(100vh-80px)]">
                {/* Header / Top Bar */}
                <header className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-6 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/50 rounded flex items-center justify-center">
                            <span className="text-2xl">⚡️</span>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold mb-1">
                                Operational Unit
                            </div>
                            <h1 className={`${playfair.className} text-3xl font-bold tracking-tight text-white`}>
                                SECOND BRAIN OS
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 text-right">
                        <div>
                            <div className="text-[9px] uppercase tracking-widest text-amber-500 mb-1 font-bold">System_Time</div>
                            <div className="font-mono text-xl text-white">
                                {new Date().toLocaleTimeString('en-US', { hour12: false })}
                            </div>
                        </div>
                        <div className="hidden md:block w-px h-10 bg-white/10" />
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <div className="text-[10px] text-white font-bold uppercase tracking-widest">{fullName || 'User'}</div>
                                <div className="text-[9px] text-white/40 font-mono">{email}</div>
                            </div>
                            <div className="w-10 h-10 rounded bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                                {user.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-white/50" />
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-stretch">

                    {/* Left Column: Identity & Specs (3 cols) */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        {/* Identity Card */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-lg p-1"
                        >
                            <div className="relative aspect-square mb-4 bg-black rounded overflow-hidden group border border-white/5">
                                <div className="absolute inset-0 bg-[url('/placeholder-avatar-scifi.jpg')] bg-cover bg-center opacity-50 mix-blend-overlay" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Shield className="w-24 h-24 text-white/10 stroke-[0.5]" />
                                </div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h2 className={`${playfair.className} text-2xl font-bold text-white mb-1`}>
                                        ARCHITECT-01
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] uppercase tracking-widest text-emerald-500 font-bold">
                                            STATUS: CORE_ACTIVE
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 space-y-6">
                                <div>
                                    <h3 className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-2 font-bold">Primary Directive</h3>
                                    <p className={`${inter.className} text-sm text-white/70 leading-relaxed`}>
                                        Lead Architect overseeing Phase 4 deployment of the Global Synchronous Mesh.
                                    </p>
                                </div>

                                <ExpertModules />
                            </div>
                        </motion.div>

                        {/* Actions */}
                        <div className="grid gap-3">
                            {/* Edit Profile Logic wrapped in Sheet */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] uppercase tracking-[0.2em] py-6 rounded border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                                        <Zap className="w-4 h-4 mr-2" />
                                        Initialize Connection
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="bg-black border-l border-white/10 text-white w-full sm:w-[400px]">
                                    <SheetHeader className="mb-8">
                                        <SheetTitle className={`${playfair.className} text-3xl text-white`}>Edit Protocol</SheetTitle>
                                        <div className="text-white/40 text-sm">Update your Neural Identification parameters.</div>
                                    </SheetHeader>

                                    <form action={updateProfile} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">Identity String (Name)</label>
                                            <input
                                                name="fullName"
                                                defaultValue={fullName}
                                                className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:border-amber-500/50 outline-none transition-colors"
                                                placeholder="Enter identifier..."
                                            />
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/10 rounded text-xs text-white/50 leading-relaxed">
                                            <Shield className="w-4 h-4 text-white/20 mb-2" />
                                            Changes to your identity string will propagate across the mesh immediately. Ensure protocol compliance.
                                        </div>
                                        <Button type="submit" className="w-full bg-white text-black hover:bg-white/90 uppercase tracking-widest text-xs py-6 font-bold">
                                            Confirm Update
                                        </Button>
                                    </form>
                                </SheetContent>
                            </Sheet>

                            <Button variant="outline" className="w-full border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-[10px] uppercase tracking-[0.2em] py-6 font-bold">
                                <Radio className="w-4 h-4 mr-2" />
                                Sync Protocol
                            </Button>
                        </div>
                    </div>

                    {/* Center Column: Visualization (6 cols) */}
                    <div className="lg:col-span-6 flex flex-col h-full min-h-[500px] lg:min-h-0 relative">
                        {/* Map Container */}
                        <div className="flex-1 relative bg-[#0A0A0A] border-y border-x border-white/10 lg:border-x-0 lg:border-y-0 rounded-lg lg:rounded-none overflow-hidden group">
                            <ProfileMap />

                            {/* Floating Stats Overlay */}
                            <div className="absolute bottom-6 left-6 flex gap-8">
                                <div>
                                    <div className="text-[9px] uppercase tracking-widest text-white/30 mb-1">System_Latency</div>
                                    <div className="font-mono text-xl text-white">0.0024 ms</div>
                                </div>
                                <div>
                                    <div className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Uptime</div>
                                    <div className="font-mono text-xl text-white">99.98%</div>
                                </div>
                            </div>
                            <div className="absolute bottom-6 right-6 flex items-center gap-3 bg-black/50 backdrop-blur border border-white/10 px-4 py-2 rounded-full">
                                <div className="text-right">
                                    <div className="text-[8px] uppercase tracking-widest text-amber-500 font-bold">Active_Nodes</div>
                                    <div className="font-mono text-lg text-white leading-none">14,209</div>
                                </div>
                                <Globe className="w-5 h-5 text-amber-500" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Activity Stream (3 cols) */}
                    <div className="lg:col-span-3 bg-[#0A0A0A] border border-white/10 rounded-lg p-6 h-full min-h-[400px]">
                        <ActivityStream />
                    </div>

                </div>
            </main>
        </div>
    )
}
