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
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Users, Video, Coffee, Utensils, PartyPopper, X, Check, GripVertical } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

const MEETING_TYPES: Record<string, { icon: string; color: string; bg: string }> = {
    'Coffee': { icon: '☕', color: 'text-amber-400', bg: 'bg-amber-500/20' },
    'Meal': { icon: '🍽️', color: 'text-orange-400', bg: 'bg-orange-500/20' },
    'Call': { icon: '📞', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    'Video': { icon: '🎥', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    'Networking Event': { icon: '🤝', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
    'Date': { icon: '💕', color: 'text-rose-400', bg: 'bg-rose-500/20' },
    'Other': { icon: '📅', color: 'text-gray-400', bg: 'bg-gray-500/20' }
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function MeetingsContent() {
    const params = useParams()
    const searchParams = useSearchParams()
    const [userId, setUserId] = useState<string>('defaultUser')
    const [entries, setEntries] = useState<Entry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null)

    useEffect(() => {
        const loadUser = async () => {
            const supabase = (await import('@/utils/supabase/client')).createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUserId(user?.id || 'defaultUser')
        }
        loadUser()

        if (searchParams.get('new') === '1') {
            setShowAddModal(true)
        }
    }, [searchParams])

    const fetchEntries = useCallback(async () => {
        const meetings = await dataStore.getEntries('meetings', userId)
        setEntries(meetings)
        setIsLoading(false)
    }, [userId])

    useEffect(() => {
        if (userId) fetchEntries()
    }, [userId, fetchEntries])

    const meetingsByDate = useMemo(() => {
        const map: Record<string, Entry[]> = {}
        entries.forEach(entry => {
            const date = entry.data['Date']
            if (date) {
                if (!map[date]) map[date] = []
                map[date].push(entry)
            }
        })
        return map
    }, [entries])

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startDayOfWeek = firstDay.getDay()
        
        const days: { date: Date; isCurrentMonth: boolean }[] = []
        
        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate()
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            days.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false })
        }
        
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true })
        }
        
        // Next month days
        const remainingDays = 42 - days.length
        for (let i = 1; i <= remainingDays; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
        }
        
        return days
    }, [currentDate])

    const selectedDateMeetings = useMemo(() => {
        if (!selectedDate) return []
        return meetingsByDate[selectedDate] || []
    }, [selectedDate, meetingsByDate])

    const upcomingMeetings = useMemo(() => {
        const today = new Date().toISOString().split('T')[0]
        return entries
            .filter(m => m.data['Date'] >= today && m.data['Status'] === 'Scheduled')
            .sort((a, b) => (a.data['Date'] || '').localeCompare(b.data['Date'] || ''))
    }, [entries])

    const handleSave = async (formData: Record<string, any>) => {
        if (editingEntry) {
            await dataStore.updateEntry(editingEntry.id, formData)
        } else {
            await dataStore.addEntry(userId, 'meetings', formData)
        }
        setShowAddModal(false)
        setEditingEntry(null)
        fetchEntries()
    }

    const handleDelete = async (id: string) => {
        await dataStore.deleteEntry(id)
        fetchEntries()
    }

    const navigateMonth = (direction: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
    }

    const formatDateKey = (date: Date) => {
        return date.toISOString().split('T')[0]
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-black to-black" />
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -top-1/2 -left-1/2 w-[100%] h-[100%] bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.2),transparent_50%)] blur-3xl" 
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
                                    <h1 className={`${playfair.className} text-2xl font-bold text-white`}>Meetings</h1>
                                    <p className="text-white/40 text-sm">{upcomingMeetings.length} upcoming</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex border border-white/10 rounded-lg overflow-hidden">
                                    <Button 
                                        variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('calendar')}
                                        className={viewMode === 'calendar' ? 'bg-white text-black' : 'text-white'}
                                    >
                                        <CalendarIcon className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className={viewMode === 'list' ? 'bg-white text-black' : 'text-white'}
                                    >
                                        <GripVertical className="w-4 h-4" />
                                    </Button>
                                </div>
                                <Button 
                                    onClick={() => { setEditingEntry(null); setShowAddModal(true) }}
                                    className="bg-white text-black hover:bg-white/90"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Schedule Meeting
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Calendar */}
                        <div className="lg:col-span-2">
                            <Card className="bg-white/[0.03] border-white/10">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
                                        <ChevronLeft className="w-5 h-5" />
                                    </Button>
                                    <h2 className={`${playfair.className} text-xl font-bold text-white`}>
                                        {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                                    </h2>
                                    <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
                                        <ChevronRight className="w-5 h-5" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {DAYS.map(day => (
                                            <div key={day} className="text-center text-xs text-white/40 font-medium py-2">
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {calendarDays.map((day, idx) => {
                                            const dateKey = formatDateKey(day.date)
                                            const hasMeetings = meetingsByDate[dateKey]?.length > 0
                                            const isSelected = selectedDate === dateKey
                                            const today = isToday(day.date)
                                            
                                            return (
                                                <motion.button
                                                    key={idx}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setSelectedDate(dateKey)}
                                                    className={`
                                                        relative aspect-square p-1 rounded-xl transition-all duration-200
                                                        ${!day.isCurrentMonth ? 'opacity-30' : ''}
                                                        ${isSelected ? 'bg-white text-black' : 'hover:bg-white/10'}
                                                        ${today && !isSelected ? 'ring-2 ring-white/30' : ''}
                                                    `}
                                                >
                                                    <span className={`text-sm ${isSelected ? 'font-bold' : ''}`}>
                                                        {day.date.getDate()}
                                                    </span>
                                                    {hasMeetings && (
                                                        <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-blue-400'}`} />
                                                            {meetingsByDate[dateKey]?.length > 1 && (
                                                                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-blue-400'}`} />
                                                            )}
                                                        </div>
                                                    )}
                                                </motion.button>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Selected Date Meetings */}
                            <Card className="bg-white/[0.03] border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white text-lg">
                                        {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {selectedDateMeetings.length === 0 ? (
                                        <p className="text-white/40 text-sm text-center py-4">No meetings scheduled</p>
                                    ) : (
                                        selectedDateMeetings.map(meeting => {
                                            const type = MEETING_TYPES[meeting.data['Type']] || MEETING_TYPES['Other']
                                            return (
                                                <motion.div
                                                    key={meeting.id}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-10 h-10 rounded-lg ${type.bg} flex items-center justify-center text-lg`}>
                                                            {type.icon}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-white truncate">{meeting.data['Title']}</h4>
                                                            <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                                                                <Clock className="w-3 h-3" />
                                                                <span>{meeting.data['Time'] || 'TBD'}</span>
                                                                <span>·</span>
                                                                <span>{meeting.data['Duration'] || '30 min'}</span>
                                                            </div>
                                                            {meeting.data['Contact'] && (
                                                                <div className="flex items-center gap-1 text-xs text-white/40 mt-1">
                                                                    <Users className="w-3 h-3" />
                                                                    <span>{meeting.data['Contact']}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )
                                        })
                                    )}
                                    {selectedDate && (
                                        <Button 
                                            variant="outline" 
                                            className="w-full border-white/20 text-white hover:bg-white/10"
                                            onClick={() => {
                                                setEditingEntry(null)
                                                setShowAddModal(true)
                                            }}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add to this date
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Upcoming */}
                            <Card className="bg-white/[0.03] border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white text-lg">Upcoming</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {upcomingMeetings.slice(0, 5).map(meeting => {
                                        const type = MEETING_TYPES[meeting.data['Type']] || MEETING_TYPES['Other']
                                        return (
                                            <div 
                                                key={meeting.id}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition cursor-pointer"
                                                onClick={() => { setSelectedDate(meeting.data['Date']); setEditingEntry(meeting); setShowAddModal(true) }}
                                            >
                                                <div className={`w-8 h-8 rounded-lg ${type.bg} flex items-center justify-center text-sm`}>
                                                    {type.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-sm truncate">{meeting.data['Title']}</p>
                                                    <p className="text-white/40 text-xs">{meeting.data['Date']}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddModal(false)}
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
                                    <CardTitle className="text-white">
                                        {editingEntry ? 'Edit Meeting' : 'Schedule Meeting'}
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <MeetingForm 
                                        entry={editingEntry} 
                                        selectedDate={selectedDate}
                                        onSave={handleSave} 
                                        onCancel={() => setShowAddModal(false)} 
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function MeetingsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white/20 uppercase tracking-[0.5em] text-xs">Loading Meetings...</div>}>
            <MeetingsContent />
        </Suspense>
    )
}

function MeetingForm({ entry, selectedDate, onSave, onCancel }: { entry: Entry | null; selectedDate?: string | null; onSave: (data: Record<string, any>) => void; onCancel: () => void }) {
    const today = new Date().toISOString().split('T')[0]
    const [formData, setFormData] = useState({
        'Title': entry?.data['Title'] || '',
        'Contact': entry?.data['Contact'] || '',
        'Date': entry?.data['Date'] || selectedDate || today,
        'Time': entry?.data['Time'] || '10:00',
        'Duration': entry?.data['Duration'] || '30 min',
        'Type': entry?.data['Type'] || 'Coffee',
        'Location': entry?.data['Location'] || '',
        'Notes': entry?.data['Notes'] || '',
        'Status': entry?.data['Status'] || 'Scheduled'
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label className="text-white/70">Title *</Label>
                <Input 
                    value={formData['Title']}
                    onChange={(e) => setFormData({...formData, 'Title': e.target.value})}
                    required
                    placeholder="Coffee with Sarah"
                    className="bg-white/5 border-white/10 text-white mt-1"
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-white/70">Date *</Label>
                    <Input 
                        type="date"
                        value={formData['Date']}
                        onChange={(e) => setFormData({...formData, 'Date': e.target.value})}
                        required
                        className="bg-white/5 border-white/10 text-white mt-1"
                    />
                </div>
                <div>
                    <Label className="text-white/70">Time</Label>
                    <Input 
                        type="time"
                        value={formData['Time']}
                        onChange={(e) => setFormData({...formData, 'Time': e.target.value})}
                        className="bg-white/5 border-white/10 text-white mt-1"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-white/70">Type *</Label>
                    <select 
                        value={formData['Type']}
                        onChange={(e) => setFormData({...formData, 'Type': e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white mt-1 p-2 rounded-md"
                    >
                        {Object.keys(MEETING_TYPES).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <Label className="text-white/70">Duration</Label>
                    <select 
                        value={formData['Duration']}
                        onChange={(e) => setFormData({...formData, 'Duration': e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white mt-1 p-2 rounded-md"
                    >
                        <option value="15 min">15 min</option>
                        <option value="30 min">30 min</option>
                        <option value="45 min">45 min</option>
                        <option value="1 hour">1 hour</option>
                        <option value="2 hours">2 hours</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-white/70">Contact</Label>
                    <Input 
                        value={formData['Contact']}
                        onChange={(e) => setFormData({...formData, 'Contact': e.target.value})}
                        placeholder="John Doe"
                        className="bg-white/5 border-white/10 text-white mt-1"
                    />
                </div>
                <div>
                    <Label className="text-white/70">Location</Label>
                    <Input 
                        value={formData['Location']}
                        onChange={(e) => setFormData({...formData, 'Location': e.target.value})}
                        placeholder="Starbucks"
                        className="bg-white/5 border-white/10 text-white mt-1"
                    />
                </div>
            </div>

            <div>
                <Label className="text-white/70">Notes</Label>
                <Textarea 
                    value={formData['Notes']}
                    onChange={(e) => setFormData({...formData, 'Notes': e.target.value})}
                    className="bg-white/5 border-white/10 text-white mt-1"
                    rows={2}
                />
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-white/20 text-white hover:bg-white/10">
                    Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-white text-black hover:bg-white/90">
                    {entry ? 'Save Changes' : 'Schedule'}
                </Button>
            </div>
        </form>
    )
}
