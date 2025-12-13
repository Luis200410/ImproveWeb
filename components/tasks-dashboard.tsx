'use client'

import { useState, useMemo } from 'react'
import { Entry } from '@/lib/data-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Clock, CheckCircle2, AlertCircle, Circle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

interface TasksDashboardProps {
    entries: Entry[]
    onUpdateEntry: (entry: Entry, updates: Partial<any>) => void
    onEditEntry: (entry: Entry) => void
    onScheduleEntry: (entry: Entry, date: Date) => void
}

export function TasksDashboard({ entries, onUpdateEntry, onEditEntry, onScheduleEntry }: TasksDashboardProps) {
    const [calendarView, setCalendarView] = useState<'month' | 'week'>('month')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [draggedEntry, setDraggedEntry] = useState<Entry | null>(null)

    // Kanban Columns
    const columns = [
        { id: 'Pending', label: 'Pending', icon: Circle, color: 'text-white/60', count: 0 },
        { id: 'Due', label: 'Due', icon: AlertCircle, color: 'text-rose-400', count: 0 },
        { id: 'Working on', label: 'Working on', icon: Clock, color: 'text-amber-400', count: 0 },
        { id: 'Done', label: 'Done', icon: CheckCircle2, color: 'text-emerald-400', count: 0 }
    ]

    const entriesByStatus = useMemo(() => {
        const acc: Record<string, Entry[]> = { 'Pending': [], 'Due': [], 'Working on': [], 'Done': [] }
        entries.forEach(e => {
            const status = e.data['Status'] || 'Pending'
            if (acc[status]) acc[status].push(e)
            else acc['Pending'].push(e) // Fallback
        })
        return acc
    }, [entries])

    // Update counts
    columns.forEach(c => c.count = entriesByStatus[c.id]?.length || 0)

    // Calendar Logic
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)

        const days = []

        // Pad start
        const startPadding = firstDay.getDay()
        for (let i = 0; i < startPadding; i++) {
            days.push({ date: null, type: 'padding' })
        }

        // Days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ date: new Date(year, month, i), type: 'day' })
        }

        return days
    }, [currentDate])

    const weekDays = useMemo(() => {
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
        const days = []
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek)
            d.setDate(startOfWeek.getDate() + i)
            days.push({ date: d, type: 'day' })
        }
        return days
    }, [currentDate])

    const displayedDays = calendarView === 'month' ? calendarDays : weekDays

    // Drag Handlers
    const handleDragStart = (e: React.DragEvent, entry: Entry) => {
        setDraggedEntry(entry)
        e.dataTransfer.setData('entryId', entry.id)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDropOnDate = (e: React.DragEvent, date: Date) => {
        e.preventDefault()
        const entryId = e.dataTransfer.getData('entryId')
        const entry = entries.find(en => en.id === entryId)
        if (entry) {
            onScheduleEntry(entry, date)
        }
        setDraggedEntry(null)
    }

    const handleDropOnColumn = (e: React.DragEvent, status: string) => {
        e.preventDefault()
        const entryId = e.dataTransfer.getData('entryId')
        const entry = entries.find(en => en.id === entryId)
        if (entry && entry.data['Status'] !== status) {
            onUpdateEntry(entry, { 'Status': status })
        }
        setDraggedEntry(null)
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const changePeriod = (delta: number) => {
        const newDate = new Date(currentDate)
        if (calendarView === 'month') {
            newDate.setMonth(newDate.getMonth() + delta)
        } else {
            newDate.setDate(newDate.getDate() + (delta * 7))
        }
        setCurrentDate(newDate)
    }

    return (
        <div className="space-y-12">

            {/* Kanban Board */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <List className="w-5 h-5 text-amber-200" />
                    <h2 className={`${playfair.className} text-2xl text-white`}>Motion Board</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
                    {columns.map(col => (
                        <div
                            key={col.id}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDropOnColumn(e, col.id)}
                            className="min-w-[280px] bg-white/5 rounded-2xl border border-white/10 flex flex-col h-[500px]"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div className="flex items-center gap-2">
                                    <span className={`font-semibold ${col.color}`}>{col.label}</span>
                                </div>
                                <span className="text-xs text-white/40 font-mono">{col.count}</span>
                            </div>

                            {/* Cards */}
                            <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                {entriesByStatus[col.id]?.length === 0 && (
                                    <div className="h-full flex items-center justify-center text-white/20 text-xs italic">
                                        Drop here
                                    </div>
                                )}
                                {entriesByStatus[col.id]?.map(entry => (
                                    <motion.div
                                        key={entry.id}
                                        layoutId={entry.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e as any, entry)}
                                        onClick={() => onEditEntry(entry)}
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 cursor-grab active:cursor-grabbing hover:border-white/20 group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-white/10 to-transparent" />
                                        <p className={`${inter.className} text-sm font-medium text-white mb-2 line-clamp-2`}>
                                            {String(entry.data['Task'] || 'Untitled')}
                                        </p>
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="text-[10px] uppercase tracking-wider text-white/40">
                                                {entry.data['Project'] ? 'Project' : 'Programming'}
                                            </span>
                                            {entry.data['Start Date'] && (
                                                <span className="text-[10px] font-mono text-white/60 bg-white/5 px-1.5 py-0.5 rounded">
                                                    {new Date(entry.data['Start Date']).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Calendar */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-white/10 pb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <CalendarIcon className="w-5 h-5 text-emerald-200" />
                            <h2 className={`${playfair.className} text-2xl text-white`}>Schedule</h2>
                        </div>
                        <p className="text-white/40 text-sm">Drag tasks here to assign dates and details</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                            <button
                                onClick={() => setCalendarView('month')}
                                className={`px-4 py-1.5 rounded-md text-xs uppercase tracking-wider transition-colors ${calendarView === 'month' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setCalendarView('week')}
                                className={`px-4 py-1.5 rounded-md text-xs uppercase tracking-wider transition-colors ${calendarView === 'week' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                            >
                                Weekly
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={() => changePeriod(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className={`${playfair.className} text-xl min-w-[140px] text-center`}>
                                {calendarView === 'month'
                                    ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                                    : `Week of ${currentDate.toLocaleDateString()}`
                                }
                            </span>
                            <button onClick={() => changePeriod(1)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`grid gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden ${calendarView === 'month' ? 'grid-cols-7' : 'grid-cols-7'}`}>
                    {/* Day Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="bg-[#0A0A0A] p-4 text-center">
                            <span className="text-[10px] uppercase tracking-widest text-white/40">{day}</span>
                        </div>
                    ))}

                    {displayedDays.map((d, i) => (
                        <div
                            key={i}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => d.date && handleDropOnDate(e, d.date)}
                            className={`bg-black/90 min-h-[140px] p-2 hover:bg-white/5 transition-colors relative group ${!d.date ? 'bg-black/40' : ''}`}
                        >
                            {d.date && (
                                <>
                                    <div className={`text-right mb-2 ${d.date.toDateString() === new Date().toDateString()
                                        ? 'text-emerald-400 font-bold'
                                        : 'text-white/40'
                                        }`}>
                                        <span className="text-sm font-mono">{d.date.getDate()}</span>
                                    </div>

                                    {/* Entries for this day */}
                                    <div className="space-y-1">
                                        {entries.filter(e => {
                                            if (!e.data['Start Date']) return false
                                            const entryDate = new Date(e.data['Start Date'])
                                            return entryDate.toDateString() === d.date!.toDateString()
                                        }).map(entry => (
                                            <button
                                                key={entry.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, entry)}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onEditEntry(entry)
                                                }}
                                                className="w-full text-left bg-white/10 hover:bg-white/20 p-1.5 rounded text-xs text-white/80 truncate border-l-2 border-emerald-500 cursor-grab active:cursor-grabbing"
                                            >
                                                {String(entry.data['Task'] || 'Untitled')}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Drop Indicator Logic could go here (isOver) */}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
