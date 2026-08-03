'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

import { dataStore, Entry, System } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { ArrowRight, Heart, Users, Calendar, CheckSquare, MessageCircle, Clock, AlertCircle, Sparkles, Globe, Kanban, Plus, Play, Eye, Edit, Trash2, ExternalLink, Wallet, Share2 } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function RelationshipsPage() {
    const [system, setSystem] = useState<System | null>(null)
    const [entries, setEntries] = useState<Record<string, Entry[]>>({})
    const [userId, setUserId] = useState<string>('defaultUser')

    useEffect(() => {
        const relSystem = dataStore.getSystem('relationships')
        setSystem(relSystem || null)
    }, [])

    useEffect(() => {
        const loadUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUserId(user?.id || 'defaultUser')
        }
        loadUser()
    }, [])

    const refreshEntries = useCallback(async () => {
        if (!system || !userId) return
        const map: Record<string, Entry[]> = {}

        await Promise.all(system.microapps.map(async (microapp) => {
            const list = await dataStore.getEntries(microapp.id, userId)
            map[microapp.id] = list
        }))

        setEntries(map)
    }, [system, userId])

    useEffect(() => {
        refreshEntries()
    }, [refreshEntries])

    const contacts = entries['contacts'] || []
    const meetings = entries['meetings'] || []
    const actionItems = entries['action-items'] || []
    const interactions = entries['interactions'] || []
    const scheduleRequests = entries['schedule-requests'] || []
    const sharedSpaces = entries['shared-spaces'] || []
    const ledger = entries['ledger'] || []
    const availability = entries['availability'] || []
    const status = entries['status'] || []

    const today = new Date().toISOString().split('T')[0]

    const tierCounts = useMemo(() => {
        const counts: Record<string, number> = {
            'Immediate Family': 0,
            'Extended Family': 0,
            'Friends': 0,
            'Mentors': 0,
            'Colleagues': 0,
            'Acquaintances': 0
        }
        contacts.forEach(c => {
            const tier = c.data['Relationship Tier']
            if (counts[tier] !== undefined) counts[tier]++
        })
        return counts
    }, [contacts])

    const needsAttention = useMemo(() => {
        const overdue: Entry[] = []
        
        contacts.forEach(contact => {
            const lastInteraction = contact.data['Last Interaction']
            const cadence = contact.data['Connection Cadence']
            
            if (!lastInteraction) {
                overdue.push(contact)
                return
            }

            const lastDate = new Date(lastInteraction)
            const todayDate = new Date(today)
            const daysSince = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
            
            let threshold = 30
            switch (cadence) {
                case 'Daily': threshold = 2; break
                case 'Weekly': threshold = 8; break
                case 'Bi-weekly': threshold = 16; break
                case 'Monthly': threshold = 32; break
                case 'Quarterly': threshold = 95; break
                default: threshold = 30
            }

            if (daysSince > threshold) {
                overdue.push(contact)
            }
        })

        return overdue
    }, [contacts, today])

    const pendingActions = useMemo(() => {
        return actionItems.filter(a => a.data['Status'] === 'Pending')
    }, [actionItems])

    const upcomingMeetings = useMemo(() => {
        return meetings.filter(m => {
            const meetingDate = m.data['Date']
            return meetingDate >= today && m.data['Status'] === 'Scheduled'
        }).sort((a, b) => (a.data['Date'] || '').localeCompare(b.data['Date'] || ''))
    }, [meetings, today])

    const pendingRequests = useMemo(() => {
        return scheduleRequests.filter(r => r.data['Status'] === 'New')
    }, [scheduleRequests])

    const currentStatus = status[0]?.data['Status'] || 'Available'

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Available': return 'bg-emerald-500'
            case 'In Deep Work': return 'bg-purple-500'
            case 'In Meeting': return 'bg-amber-500'
            case 'Do Not Disturb': return 'bg-red-500'
            case 'Away': return 'bg-gray-500'
            default: return 'bg-gray-500'
        }
    }

    if (!system) return null

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-black to-black" />
                <div className="absolute -left-24 top-10 w-[700px] h-[700px] bg-[radial-gradient(circle_at_30%_30%,rgba(255,200,200,0.15),transparent_45%)] blur-3xl" />
                <div className="absolute right-[-180px] top-28 w-[620px] h-[620px] bg-[radial-gradient(circle_at_70%_25%,rgba(255,150,150,0.08),transparent_40%)] blur-3xl" />
                <div className="absolute inset-0 opacity-[0.04]">
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-[size:34px_34px]" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-12 pb-14 relative z-10 space-y-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid lg:grid-cols-[1.2fr,0.8fr] gap-8 items-start"
                >
                    <div className="space-y-6">
                        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.07] via-black to-black shadow-[0_25px_80px_rgba(0,0,0,0.55)] p-8">
                            <div className="absolute inset-0 opacity-[0.07]">
                                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[size:36px_36px]" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,200,200,0.12),transparent_45%)]" />
                            </div>
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex flex-wrap items-center gap-3 text-rose-100">
                                    <Heart className="w-5 h-5" />
                                    <span className="text-xs uppercase tracking-[0.32em] text-white/70">Relationship Hub</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full ${getStatusColor(currentStatus)} animate-pulse`} />
                                    <span className="text-xs text-white/60">{currentStatus}</span>
                                </div>
                            </div>
                            <h1 className={`${playfair.className} text-5xl md:text-6xl font-bold mt-4 mb-3 text-white relative z-10`}>
                                Cultivate Connection.
                            </h1>
                            <p className={`${inter.className} text-lg text-white/75 max-w-3xl relative z-10`}>
                                Your human CRM with automated check-ins, smart scheduling, and collaborative spaces. Never let a relationship fade.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3 relative z-10">
                                <Button asChild className="bg-white text-black hover:bg-white/90">
                                    <Link href="/systems/relationships/contacts?new=1">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Contact
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild className="border-white/40 text-white hover:bg-white/10">
                                    <Link href="/systems/relationships/interactions?new=1">
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Log Interaction
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild className="border-white/40 text-white hover:bg-white/10">
                                    <Link href="/systems/relationships/schedule-requests">
                                        <Globe className="w-4 h-4 mr-2" />
                                        Public Portal
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {needsAttention.length > 0 && (
                            <Card className="bg-rose-500/10 border-rose-500/30 backdrop-blur-md">
                                <CardHeader className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-rose-500" />
                                        <CardTitle className="text-white">Needs Attention</CardTitle>
                                        <span className="bg-rose-500/20 text-rose-400 text-xs px-2 py-0.5 rounded-full">
                                            {needsAttention.length}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {needsAttention.slice(0, 5).map(contact => (
                                            <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-rose-500/20">
                                                <div>
                                                    <p className="text-white text-sm font-medium">{contact.data['Name']}</p>
                                                    <p className="text-rose-400 text-xs">
                                                        Last: {contact.data['Last Interaction'] || 'Never'} · {contact.data['Connection Cadence']}
                                                    </p>
                                                </div>
                                                <Button size="sm" variant="ghost" className="text-rose-400 hover:text-rose-300">
                                                    <MessageCircle className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button asChild variant="ghost" size="sm" className="w-full text-rose-400 hover:text-rose-300 mt-3">
                                        <Link href="/systems/relationships/action-items">View All Needs Attention</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="bg-white/[0.05] border-white/10 backdrop-blur-md shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-rose-500" />
                                    Network Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid sm:grid-cols-3 gap-4">
                                <div className="p-5 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.06] to-black">
                                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/60">Total Contacts</p>
                                    <p className="text-3xl font-bold mt-2 text-white">{contacts.length}</p>
                                    <p className="text-xs text-white/50 mt-1">In your network</p>
                                </div>
                                <div className="p-5 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.05] to-black">
                                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/60">This Month</p>
                                    <p className="text-3xl font-bold mt-2 text-white">{interactions.length}</p>
                                    <p className="text-xs text-white/50 mt-1">Interactions logged</p>
                                </div>
                                <div className="p-5 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.05] to-black">
                                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/60">Pending Actions</p>
                                    <p className="text-3xl font-bold mt-2 text-white">{pendingActions.length}</p>
                                    <p className="text-xs text-white/50 mt-1">Follow-ups due</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-white/[0.05] border-white/12 backdrop-blur-md shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
                            <CardHeader className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-white/60" />
                                    <CardTitle className="text-white">Relationship Tiers</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(tierCounts).map(([tier, count]) => (
                                        <div key={tier} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition">
                                            <span className="text-sm text-white/70">{tier}</span>
                                            <span className="text-sm font-medium text-white">{count}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button asChild className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 mt-4">
                                    <Link href="/systems/relationships/contacts">View All Contacts</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {pendingRequests.length > 0 && (
                            <Card className="bg-amber-500/10 border-amber-500/30 backdrop-blur-md">
                                <CardHeader className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-amber-500" />
                                        <CardTitle className="text-white">Pending Requests</CardTitle>
                                        <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">
                                            {pendingRequests.length}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {pendingRequests.slice(0, 3).map(request => (
                                        <div key={request.id} className="p-3 rounded-lg bg-black/30 border border-amber-500/20">
                                            <p className="text-white text-sm">{request.data['Requester Name']}</p>
                                            <p className="text-amber-400 text-xs">{request.data['Request Type']}</p>
                                        </div>
                                    ))}
                                    <Button asChild variant="ghost" size="sm" className="w-full text-amber-400 hover:text-amber-300">
                                        <Link href="/systems/relationships/schedule-requests">Review Requests</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="bg-white/[0.05] border-white/12 backdrop-blur-md shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
                            <CardHeader className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-white/60" />
                                <CardTitle className="text-white">Upcoming Meetings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {upcomingMeetings.length === 0 ? (
                                    <p className="text-white/40 text-sm">No upcoming meetings</p>
                                ) : (
                                    upcomingMeetings.slice(0, 3).map(meeting => (
                                        <div key={meeting.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition">
                                            <div className="text-2xl">📅</div>
                                            <div className="flex-1">
                                                <p className="text-white text-sm">{meeting.data['Title']}</p>
                                                <p className="text-white/40 text-xs">{meeting.data['Date']} · {meeting.data['Type']}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <Button asChild className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 mt-2">
                                    <Link href="/systems/relationships/meetings">View All</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/[0.05] border-white/12 backdrop-blur-md shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
                            <CardHeader className="flex items-center gap-2">
                                <CheckSquare className="w-5 h-5 text-white/60" />
                                <CardTitle className="text-white">All Microapps</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {system.microapps.map((microapp) => (
                                    <Link key={microapp.id} href={`/systems/relationships/${microapp.id}`}>
                                        <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20 transition cursor-pointer group">
                                            <div className="text-xl group-hover:scale-110 transition-transform">{microapp.icon}</div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium text-sm">{microapp.name}</p>
                                                <p className="text-white/40 text-xs truncate">{microapp.description}</p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60" />
                                        </div>
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
