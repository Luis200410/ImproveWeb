'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { dataStore, Entry } from '@/lib/data-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { ArrowLeft, CheckCircle, XCircle, Clock, ChevronRight, Plus, Mail, FileText, X, Calendar, Sparkles, Inbox, ArrowRight, User } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

const REQUEST_STATUS: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
    'New': { icon: <Inbox className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
    'Accepted': { icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
    'Proposed New Time': { icon: <Clock className="w-4 h-4" />, color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
    'Declined': { icon: <XCircle className="w-4 h-4" />, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
    'Completed': { icon: <CheckCircle className="w-4 h-4" />, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' }
}

const REQUEST_TYPES: Record<string, { icon: string; color: string }> = {
    'Code Review': { icon: '💻', color: 'text-blue-400' },
    'Advice': { icon: '💡', color: 'text-amber-400' },
    'Meeting': { icon: '📅', color: 'text-green-400' },
    'Borrow Item': { icon: '🔧', color: 'text-orange-400' },
    'Collaboration': { icon: '🤝', color: 'text-purple-400' },
    'Other': { icon: '📝', color: 'text-gray-400' }
}

function ScheduleRequestsContent() {
    const params = useParams()
    const searchParams = useSearchParams()
    const [userId, setUserId] = useState<string>('defaultUser')
    const [entries, setEntries] = useState<Entry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedRequest, setSelectedRequest] = useState<Entry | null>(null)

    useEffect(() => {
        const loadUser = async () => {
            const supabase = (await import('@/utils/supabase/client')).createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUserId(user?.id || 'defaultUser')
        }
        loadUser()
    }, [])

    const fetchEntries = useCallback(async () => {
        const requests = await dataStore.getEntries('schedule-requests', userId)
        setEntries(requests)
        setIsLoading(false)
    }, [userId])

    useEffect(() => {
        if (userId) fetchEntries()
    }, [userId, fetchEntries])

    const requestsByStatus = useMemo(() => {
        const grouped: Record<string, Entry[]> = {
            'New': [],
            'Accepted': [],
            'Proposed New Time': [],
            'Declined': [],
            'Completed': []
        }
        entries.forEach(entry => {
            const status = entry.data['Status'] || 'New'
            if (grouped[status]) grouped[status].push(entry)
        })
        return grouped
    }, [entries])

    const stats = useMemo(() => ({
        new: requestsByStatus['New'].length,
        accepted: requestsByStatus['Accepted'].length,
        pending: requestsByStatus['Proposed New Time'].length,
        total: entries.length
    }), [requestsByStatus, entries])

    const handleUpdateStatus = async (entry: Entry, newStatus: string) => {
        await dataStore.updateEntry(entry.id, { 'Status': newStatus })
        fetchEntries()
    }

    const handleSaveNotes = async (entry: Entry, notes: string) => {
        await dataStore.updateEntry(entry.id, { 'Internal Notes': notes })
        fetchEntries()
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 via-black to-black" />
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -top-1/2 -left-1/2 w-[100%] h-[100%] bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.2),transparent_50%)] blur-3xl" 
                />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-[100px] z-20">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link href="/systems/relationships">
                                    <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className={`${playfair.className} text-2xl font-bold text-white`}>Schedule Requests</h1>
                                    <p className="text-white/40 text-sm">Triage incoming scheduling requests</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm">
                                    <span className="text-blue-400 font-medium">{stats.new}</span>
                                    <span className="text-white/40"> new · </span>
                                    <span className="text-amber-400 font-medium">{stats.pending}</span>
                                    <span className="text-white/40"> pending</span>
                                </div>
                                <Button 
                                    variant="outline"
                                    className="border-white/20 text-white hover:bg-white/10"
                                    onClick={() => window.open('/schedule', '_blank')}
                                >
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Public Portal
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Kanban Board */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-5 gap-4">
                        {Object.entries(REQUEST_STATUS).map(([status, config]) => (
                            <div key={status} className="space-y-4">
                                {/* Column Header */}
                                <div className={`p-3 rounded-xl ${config.bg} border ${config.border}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={config.color}>{config.icon}</span>
                                            <span className="font-medium text-white text-sm">{status}</span>
                                        </div>
                                        <span className="text-xs text-white/40">{requestsByStatus[status].length}</span>
                                    </div>
                                </div>

                                {/* Cards */}
                                <div className="space-y-3 min-h-[200px]">
                                    <AnimatePresence>
                                        {requestsByStatus[status].map((request, idx) => {
                                            const type = REQUEST_TYPES[request.data['Request Type']] || REQUEST_TYPES['Other']
                                            
                                            return (
                                                <motion.div
                                                    key={request.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{ delay: idx * 0.03 }}
                                                    onClick={() => setSelectedRequest(request)}
                                                    className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 cursor-pointer transition-all hover:scale-[1.02]"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">{type.icon}</span>
                                                            <span className="text-xs text-white/40">{request.data['Request Type']}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <h4 className="text-white font-medium text-sm mb-1">
                                                        {request.data['Requester Name']}
                                                    </h4>
                                                    <p className="text-white/40 text-xs line-clamp-2 mb-2">
                                                        {request.data['Description']}
                                                    </p>
                                                    
                                                    <div className="flex items-center gap-1 text-xs text-white/40">
                                                        <Mail className="w-3 h-3" />
                                                        <span className="truncate">{request.data['Requester Email']}</span>
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedRequest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedRequest(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg"
                        >
                            <Card className="bg-zinc-950 border-white/10">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-white">Request Details</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedRequest(null)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 rounded-xl bg-white/5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                                <User className="w-5 h-5 text-white/60" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-white">{selectedRequest.data['Requester Name']}</h4>
                                                <p className="text-xs text-white/40">{selectedRequest.data['Relationship Tier']}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-white/60">
                                            <Mail className="w-4 h-4" />
                                            {selectedRequest.data['Requester Email']}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-white/70 text-sm">Request Type</Label>
                                        <p className="text-white mt-1">{selectedRequest.data['Request Type']}</p>
                                    </div>

                                    <div>
                                        <Label className="text-white/70 text-sm">Description</Label>
                                        <p className="text-white/80 mt-1 text-sm leading-relaxed">{selectedRequest.data['Description']}</p>
                                    </div>

                                    {selectedRequest.data['Preferred Times'] && (
                                        <div>
                                            <Label className="text-white/70 text-sm">Preferred Times</Label>
                                            <p className="text-white mt-1">{selectedRequest.data['Preferred Times']}</p>
                                        </div>
                                    )}

                                    <div>
                                        <Label className="text-white/70 text-sm">Internal Notes</Label>
                                        <Textarea 
                                            defaultValue={selectedRequest.data['Internal Notes'] || ''}
                                            placeholder="Add internal notes..."
                                            className="bg-white/5 border-white/10 text-white mt-1"
                                            rows={3}
                                            onBlur={(e) => handleSaveNotes(selectedRequest, e.target.value)}
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        {selectedRequest.data['Status'] === 'New' && (
                                            <>
                                                <Button 
                                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                                                    onClick={() => handleUpdateStatus(selectedRequest, 'Accepted')}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Accept
                                                </Button>
                                                <Button 
                                                    variant="outline"
                                                    className="flex-1 border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
                                                    onClick={() => handleUpdateStatus(selectedRequest, 'Proposed New Time')}
                                                >
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    Propose Time
                                                </Button>
                                                <Button 
                                                    variant="outline"
                                                    className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/20"
                                                    onClick={() => handleUpdateStatus(selectedRequest, 'Declined')}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Decline
                                                </Button>
                                            </>
                                        )}
                                        {selectedRequest.data['Status'] === 'Accepted' && (
                                            <Button 
                                                className="flex-1 bg-purple-500 hover:bg-purple-600"
                                                onClick={() => handleUpdateStatus(selectedRequest, 'Completed')}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Mark Completed
                                            </Button>
                                        )}
                                        {selectedRequest.data['Status'] === 'Proposed New Time' && (
                                            <>
                                                <Button 
                                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                                                    onClick={() => handleUpdateStatus(selectedRequest, 'Accepted')}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Accept New Time
                                                </Button>
                                                <Button 
                                                    variant="outline"
                                                    className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/20"
                                                    onClick={() => handleUpdateStatus(selectedRequest, 'Declined')}
                                                >
                                                    Decline
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function ScheduleRequestsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white/20 uppercase tracking-[0.5em] text-xs">Loading Requests...</div>}>
            <ScheduleRequestsContent />
        </Suspense>
    )
}
