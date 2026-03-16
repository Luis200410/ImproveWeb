'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { dataStore, Entry } from '@/lib/data-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { ArrowRight, Heart, Clock, Calendar, CheckCircle, XCircle, Loader2, Send, Sparkles } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function SchedulePortalPage() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    
    const [userId, setUserId] = useState<string>('defaultUser')
    const [contact, setContact] = useState<Entry | null>(null)
    const [availability, setAvailability] = useState<Entry[]>([])
    const [status, setStatus] = useState<Entry | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        requestType: 'Meeting',
        description: '',
        preferredTimes: ''
    })

    useEffect(() => {
        const loadData = async () => {
            if (!token) return
            
            const supabaseModule = await import('@/utils/supabase/client')
            const supabase = supabaseModule.createClient()
            const { data: { user } } = await supabase.auth.getUser()
            const uid = user?.id || 'defaultUser'
            setUserId(uid)

            const contacts = await dataStore.getEntries('contacts', uid)
            const foundContact = contacts.find(c => c.data['Access Token'] === token)
            setContact(foundContact || null)

            const avail = await dataStore.getEntries('availability', uid)
            setAvailability(avail)

            const statusEntries = await dataStore.getEntries('status', uid)
            setStatus(statusEntries[0] || null)
        }
        loadData()
    }, [token])

    const tier = contact?.data['Relationship Tier'] || 'Acquaintances'

    const tierAvailability = useMemo(() => {
        return availability.find(a => {
            const availTier = a.data['Relationship Tier']
            return availTier === tier && a.data['Status'] === 'Active'
        })
    }, [availability, tier])

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

    const getTierBadge = (tier: string) => {
        const colors: Record<string, string> = {
            'Immediate Family': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
            'Extended Family': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
            'Friends': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'Mentors': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            'Colleagues': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            'Acquaintances': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }
        return colors[tier] || colors['Acquaintances']
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token || !userId) return

        setIsSubmitting(true)
        
        await dataStore.addEntry(userId, 'schedule-requests', {
            'Requester Name': formData.name,
            'Requester Email': formData.email,
            'Relationship Tier': tier,
            'Access Token': token,
            'Request Type': formData.requestType,
            'Description': formData.description,
            'Preferred Times': formData.preferredTimes,
            'Status': 'New'
        })

        setIsSubmitting(false)
        setSubmitted(true)
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Card className="bg-white/[0.05] border-white/10 max-w-md">
                    <CardHeader>
                        <CardTitle className="text-white">Invalid Access</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-white/60">Please use your unique scheduling link to access this page.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md text-center"
                >
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h1 className={`${playfair.className} text-3xl font-bold text-white mb-4`}>
                        Request Submitted!
                    </h1>
                    <p className="text-white/60 mb-6">
                        Your request has been sent. You'll receive a confirmation email shortly with updates.
                    </p>
                    <p className="text-white/40 text-sm">
                        Redirecting you back...
                    </p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-black to-black" />
                <div className="absolute -left-24 top-10 w-[700px] h-[700px] bg-[radial-gradient(circle_at_30%_30%,rgba(255,200,200,0.15),transparent_45%)] blur-3xl" />
            </div>

            <div className="max-w-2xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className={`px-3 py-1 rounded-full border text-xs ${getTierBadge(tier)}`}>
                                {tier} Access
                            </span>
                        </div>
                        <h1 className={`${playfair.className} text-4xl font-bold text-white mb-2`}>
                            Schedule Time Together
                        </h1>
                        <p className="text-white/60">
                            Select a time that works for you based on my availability
                        </p>
                    </div>

                    <Card className="bg-white/[0.05] border-white/10">
                        <CardHeader className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${getStatusColor(status?.data['Status'] || 'Available')} animate-pulse`} />
                                <CardTitle className="text-white">
                                    {status?.data['Status'] || 'Available'}
                                </CardTitle>
                            </div>
                            {status?.data['Message'] && (
                                <p className="text-white/60 text-sm">{status.data['Message']}</p>
                            )}
                        </CardHeader>
                        {tierAvailability && (
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-white/40">Available Days</p>
                                        <p className="text-white">{tierAvailability.data['Available Days'] || 'Mon-Fri'}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/40">Time Window</p>
                                        <p className="text-white">
                                            {tierAvailability.data['Time Window Start'] || '9:00'} - {tierAvailability.data['Time Window End'] || '17:00'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-white/40">Max Duration</p>
                                        <p className="text-white">{tierAvailability.data['Max Duration'] || '30 min'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card className="bg-white/[0.05] border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white">Your Request</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-white/70 text-sm">Your Name</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Doe"
                                            required
                                            className="bg-white/5 border-white/10 text-white mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-white/70 text-sm">Email</Label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john@example.com"
                                            required
                                            className="bg-white/5 border-white/10 text-white mt-1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-white/70 text-sm">Request Type</Label>
                                    <select
                                        value={formData.requestType}
                                        onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 text-white mt-1 p-2 rounded-md"
                                        required
                                    >
                                        <option value="Meeting">Meeting</option>
                                        <option value="Code Review">Code Review</option>
                                        <option value="Advice">Advice</option>
                                        <option value="Collaboration">Collaboration</option>
                                        <option value="Borrow Item">Borrow Item</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <Label className="text-white/70 text-sm">Description</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="What would you like to discuss?"
                                        required
                                        className="bg-white/5 border-white/10 text-white mt-1"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label className="text-white/70 text-sm">Preferred Times</Label>
                                    <Textarea
                                        value={formData.preferredTimes}
                                        onChange={(e) => setFormData({ ...formData, preferredTimes: e.target.value })}
                                        placeholder="e.g., Tuesday afternoon, Friday morning"
                                        className="bg-white/5 border-white/10 text-white mt-1"
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-white text-black hover:bg-white/90"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Request
                                </>
                            )}
                        </Button>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}
