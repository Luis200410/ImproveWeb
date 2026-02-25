'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Entry } from '@/lib/data-store'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { Check, Edit2, Trash2, ArrowLeft, ArrowRight } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

interface HabitTimelineProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entries: Entry[]
    onToggleStatus: (entry: Entry) => void
    onEdit: (entry: Entry) => void
    onSelect?: (entry: Entry) => void
    onDelete?: (id: string, skipConfirm?: boolean) => void
    onFocusComplete?: (durationMinutes: number, entry: Entry) => void
    viewMode: 'day' | 'week' | 'list'
    onChangeViewMode: (mode: 'day' | 'week' | 'list') => void
}

export function HabitTimeline({ entries, onToggleStatus, onEdit, onSelect, onDelete, onFocusComplete, viewMode, onChangeViewMode }: HabitTimelineProps) {
    const [visibleDate, setVisibleDate] = useState(new Date())

    // Derived date values
    const todayKey = visibleDate.toISOString().split('T')[0]
    const todayDayKey = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][visibleDate.getDay()]
    const isActualToday = new Date().toDateString() === visibleDate.toDateString()

    // Delete Modal State
    const [deleteCandidate, setDeleteCandidate] = useState<Entry | null>(null);

    // Timer for current time line + notifications
    const [currentTime, setCurrentTime] = useState(new Date())
    const [currentTimePercent, setCurrentTimePercent] = useState(0)
    const [expandedLaw, setExpandedLaw] = useState<string | null>(null)

    const hours = Array.from({ length: 19 }, (_, i) => i + 5) // 5 AM to 12 AM

    // Navigation Helpers
    const nextDay = () => {
        const next = new Date(visibleDate)
        next.setDate(visibleDate.getDate() + 1)
        setVisibleDate(next)
    }
    const prevDay = () => {
        const prev = new Date(visibleDate)
        prev.setDate(visibleDate.getDate() - 1)
        setVisibleDate(prev)
    }
    const goToToday = () => setVisibleDate(new Date())

    useEffect(() => {
        // Request notification permission
        if (typeof window !== 'undefined' && 'Notification' in window) {
            Notification.requestPermission();
        }

        const interval = setInterval(() => {
            const currentNow = new Date();
            setCurrentTime(currentNow);

            // Calculate current time position %
            const currentHour = currentNow.getHours();
            const currentMinute = currentNow.getMinutes();
            const currentHourIndex = currentHour - 5;
            const newTimePercent = ((currentHourIndex + (currentMinute / 60)) / hours.length) * 100;
            setCurrentTimePercent(newTimePercent);

            // Check for notifications (always based on actual current time, not visibleDate)
            const timeString = currentNow.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
            const actualTodayKey = currentNow.toISOString().split('T')[0];
            const actualTodayDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][currentNow.getDay()];

            entries.forEach(entry => {
                // Check if habit is for today (actual today)
                const freq = entry.data['frequency'] || 'daily';
                const repeatDays = entry.data['repeatDays'] || [];
                if (freq === 'specific_days' && !repeatDays.includes(actualTodayDay)) return;

                // Check if excluded for today (actual today)
                const excludedDates = entry.data['excludedDates'] || [];
                if (excludedDates.includes(actualTodayKey)) return;

                // Check if already done today (optional: suppress notification if done)
                const completedDates = entry.data['completedDates'] || [];
                if (completedDates.includes(actualTodayKey)) return;

                const habitTime = entry.data['schedule']?.[actualTodayDay] || entry.data['Time'];
                if (habitTime === timeString && currentNow.getSeconds() === 0) {
                    // Trigger Notification
                    if (Notification.permission === 'granted') {
                        new Notification(`Time for ${entry.data['Habit Name']}`, {
                            body: entry.data['Cue'] || 'Time to build your habit!',
                        });
                    }
                }
            });

        }, 1000);
        return () => clearInterval(interval);
    }, [entries, hours.length]);


    // Filter entries based on Frequency/Day
    const activeEntries = entries.filter(entry => {
        // 1. Check Frequency
        const freq = entry.data['frequency'] || 'daily'
        let isToday = true;
        if (freq === 'specific_days') {
            const repeatDays = entry.data['repeatDays'] || []
            isToday = repeatDays.includes(todayDayKey)
        }

        // 2. Check Excluded Dates
        const excludedDates = entry.data['excludedDates'] || [];
        if (excludedDates.includes(todayKey)) isToday = false;

        // 3. Check Archived
        if (entry.data['archived']) isToday = false;

        return isToday;
    })

    // Sort entries by time and duration
    // We need to calculate start/end for layout
    const positionedEntries = activeEntries.map(entry => {
        const timeStr = entry.data['schedule']?.[todayDayKey] || entry.data['Time'] || '00:00';
        const [h, m] = timeStr.split(':').map(Number);
        const start = h + m / 60;
        const duration = Number(entry.data['duration'] || 60);
        const end = start + (duration / 60);
        return { ...entry, start, end, timeStr, duration };
    }).sort((a, b) => a.start - b.start);

    // Calculate Columns (Lanes) for Overlap
    const columns: { end: number }[] = [];
    const entriesWithLayout = positionedEntries.map(entry => {
        // Find first column that is free
        let colIndex = columns.findIndex(col => col.end <= entry.start);

        if (colIndex === -1) {
            // No free column, add new one
            colIndex = columns.length;
            columns.push({ end: entry.end });
        } else {
            // Update column end time
            columns[colIndex].end = entry.end;
        }

        return { ...entry, colIndex, totalCols: 0 }; // totalCols update later if needed, but simple left offset is enough
    });

    const getWeekDays = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        return days
    }

    const [focusEntry, setFocusEntry] = useState<Entry | null>(null);

    return (
        <div className="space-y-8 relative">
            {/* View Toggle & Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-center sticky top-24 z-30 gap-4">
                {/* Date Nav */}
                <div className="flex items-center gap-4 bg-black/50 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
                    <button onClick={prevDay} className="p-2 text-white/60 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="text-center min-w-[120px]">
                        <div className="text-xs text-white/40 uppercase tracking-widest">{visibleDate.getFullYear()}</div>
                        <div className={`${playfair.className} text-xl text-white`}>
                            {visibleDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                    <button onClick={nextDay} className="p-2 text-white/60 hover:text-white transition-colors">
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    {!isActualToday && (
                        <button onClick={goToToday} className="text-xs text-blue-400 hover:text-blue-300 ml-2 uppercase tracking-widest">
                            Today
                        </button>
                    )}
                </div>

                {/* View Mode */}
                <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-full p-1 flex">
                    <button
                        onClick={() => onChangeViewMode('day')}
                        className={`px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-colors ${viewMode === 'day' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
                    >
                        Daily Timeline
                    </button>
                    <button
                        onClick={() => onChangeViewMode('week')}
                        className={`px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-colors ${viewMode === 'week' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
                    >
                        Weekly Grid
                    </button>
                    <button
                        onClick={() => onChangeViewMode('list')}
                        className={`px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-colors ${viewMode === 'list' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
                    >
                        All Habits
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'day' ? (
                    <motion.div
                        key="day"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="relative min-h-[2000px] border-l border-white/10 ml-8 md:ml-16 py-8"
                    >
                        {/* Current Time Line */}
                        {currentTimePercent >= 0 && currentTimePercent <= 100 && (
                            <div
                                className="absolute left-[-20px] md:left-[-40px] right-0 h-px bg-red-500/50 z-0 flex items-center pointer-events-none"
                                style={{ top: `${currentTimePercent}%` }}
                            >
                                <div className="absolute -left-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                            </div>
                        )}

                        {entriesWithLayout.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <p className={`${playfair.className} text-2xl text-white/20 mb-2`}>No habits for today</p>
                                    <p className={`${inter.className} text-white/10`}>Enjoy your free time or add a new one.</p>
                                </div>
                            </div>
                        )}

                        {/* Time Markers */}
                        {hours.map(h => (
                            <div key={h} className="absolute left-[-40px] md:left-[-60px]" style={{ top: `${((h - 5) / hours.length) * 100}%` }}>
                                <span className="text-xs font-mono text-white/20">{h === 12 ? '12PM' : h > 12 ? `${h - 12}PM` : `${h}AM`}</span>
                            </div>
                        ))}

                        {/* Habits */}
                        {entriesWithLayout.map((entry, index) => {
                            // Positioning logic
                            const startHourIndex = entry.start - 5;
                            const topPercent = Math.max(0, Math.min(100, (startHourIndex / hours.length) * 100));

                            // Height based on duration
                            // total hours = 19. duration is in minutes.
                            // height % = (duration / 60) / 19 * 100
                            const heightPercent = ((entry.duration / 60) / hours.length) * 100;

                            // Horizontal offset based on column
                            // We can use fixed widths or percentages. Let's use % to keep it responsive.
                            // 90% available width, split by columns?
                            // Or just simple indentation.
                            const leftOffset = entry.colIndex * 20; // 20% shift per column
                            const widthPercent = Math.max(40, 90 - leftOffset); // Shrink width slightly

                            // Check Status Logic (Array based)
                            const completedDates = entry.data['completedDates'] || [];
                            const isCompletedToday = completedDates.includes(todayKey);

                            // Check Category
                            const category = entry.data['Category'] || 'General';
                            const isProductivity = ['Work', 'Study'].includes(category);

                            // Color mapping based on Law/Category? Or just clean dark/light
                            // User mention "each color or area of each habit".
                            // Let's use the category or a generated color for the border/accent

                            return (
                                <motion.div
                                    key={entry.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="absolute z-10"
                                    style={{
                                        top: `${topPercent}%`,
                                        height: `${heightPercent}%`,
                                        left: `${leftOffset + 2}%`, // base offset + column shift
                                        right: '2%', // or width
                                        width: `${96 - leftOffset}%` // dynamic width
                                    }}
                                >
                                    <div className="relative group/card h-full flex flex-col">
                                        {/* Activity Line to Axis - adjust to point to timeline */}
                                        <div className="absolute left-[-20px] md:left-[-40px] top-0 w-[20px] md:w-[40px] h-px bg-white/10" style={{ left: `-${leftOffset + 4}%`, width: `${leftOffset + 4}%` }} />
                                        {/* Ideally the line should reach the axis. calculated roughly above */}

                                        {/* Card content - full height */}
                                        <div className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors h-full flex flex-col ${isCompletedToday ? 'border-l-4 border-l-white' : ''}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="cursor-pointer flex-1" onClick={() => onEdit(entry)}>
                                                    <div className="text-xs font-mono text-white/40 mb-1 group-hover/card:text-white/60 transition-colors flex items-center gap-2">
                                                        {entry.timeStr}
                                                        <span className="text-white/20">({entry.duration}m)</span>
                                                        <span className="px-1.5 py-0.5 rounded border border-white/10 text-[10px] uppercase tracking-wider text-white/40">{category}</span>
                                                        <Edit2 className="w-3 h-3 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                                    </div>
                                                    <h3 className={`${playfair.className} text-xl text-white truncate`}>{entry.data['Habit Name']}</h3>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {/* Focus Button */}
                                                    {isProductivity && !isCompletedToday && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFocusEntry(entry);
                                                            }}
                                                            className="px-3 py-1.5 bg-white/10 border border-white/20 text-xs text-white uppercase tracking-widest rounded hover:bg-white hover:text-black transition-colors mr-2 hidden md:block"
                                                        >
                                                            Start Focus
                                                        </button>
                                                    )}

                                                    {/* Trash Button */}
                                                    {onDelete && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Open Custom Modal
                                                                setDeleteCandidate(entry);
                                                            }}
                                                            className="p-2 text-white/20 hover:text-red-400 opacity-0 group-hover/card:opacity-100 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {/* Toggle Button - IMPROVED SMOOTHNESS */}
                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onToggleStatus({
                                                                ...entry,
                                                                data: {
                                                                    ...entry.data,
                                                                    completedDates: isCompletedToday
                                                                        ? completedDates.filter((d: string) => d !== todayKey)
                                                                        : [...completedDates, todayKey]
                                                                }
                                                            });
                                                        }}
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 ${isCompletedToday ? 'bg-white border-white text-black hover:bg-white/90' : 'border-white/20 text-transparent hover:border-white/50 hover:bg-white/5'}`}
                                                    >
                                                        <Check className="w-6 h-6" />
                                                    </motion.button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-4 gap-1 h-3 group-hover/card:h-auto transition-all duration-300">
                                                {[
                                                    { label: 'Cue', color: 'bg-cyan-500', text: entry.data['Cue'] },
                                                    { label: 'Craving', color: 'bg-purple-500', text: entry.data['Craving'] },
                                                    { label: 'Response', color: 'bg-emerald-500', text: entry.data['Response'] },
                                                    { label: 'Reward', color: 'bg-amber-500', text: entry.data['Reward'] }
                                                ].map(law => {
                                                    const isExpanded = expandedLaw === `${entry.id}-${law.label}`;
                                                    return (
                                                        <div
                                                            key={law.label}
                                                            onClick={() => setExpandedLaw(isExpanded ? null : `${entry.id}-${law.label}`)}
                                                            className="relative group/law h-full min-h-[12px] rounded-sm overflow-visible cursor-pointer"
                                                        >
                                                            <div className={`absolute inset-0 ${law.color} ${isCompletedToday ? 'opacity-100' : 'opacity-40 group-hover/card:opacity-60 group-hover/law:opacity-100'} transition-opacity rounded-sm`} />
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/law:opacity-100 transition-opacity">
                                                                <span className="text-[10px] font-bold text-black uppercase tracking-wider truncate px-1">{law.label}</span>
                                                            </div>
                                                            {(isExpanded) && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="absolute top-full left-0 mt-2 w-48 p-3 bg-black border border-white/20 rounded-lg shadow-2xl text-xs text-white z-50"
                                                                >
                                                                    <span className="font-bold block mb-1 uppercase tracking-wider text-white/40">{law.label}</span>
                                                                    {law.text}
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                ) : viewMode === 'week' ? (
                    <motion.div
                        key="week"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="overflow-x-auto"
                    >
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="text-left py-4 px-4 text-xs font-mono text-white/40 uppercase tracking-widest">Habit</th>
                                    {getWeekDays().map(day => (
                                        <th key={day} className="py-4 px-2 text-center text-xs font-mono text-white/40 uppercase tracking-widest">{day}</th>
                                    ))}
                                    <th className="py-4 px-4 text-center text-xs font-mono text-white/40 uppercase tracking-widest">Streak</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entriesWithLayout.map((entry, index) => (
                                    <motion.tr
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-4 px-4 cursor-pointer" onClick={() => onSelect ? onSelect(entry) : onEdit(entry)}>
                                            <div className="font-serif text-lg text-white flex items-center gap-2">
                                                {entry.data['Habit Name']}
                                                <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-white/40" />
                                            </div>
                                            <div className="text-xs text-white/40 font-mono">{entry.data['Time']}</div>
                                        </td>
                                        {Array.from({ length: 7 }).map((_, i) => (
                                            <td key={i} className="py-4 px-2 text-center">
                                                <div className="w-3 h-3 rounded-full mx-auto bg-white/10" />
                                            </td>
                                        ))}
                                        <td className="py-4 px-4 text-center font-mono text-white/60">
                                            {entry.data['Streak'] || 0}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="py-8"
                    >
                        {entries.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-20">
                                <div className="text-center">
                                    <p className={`${playfair.className} text-2xl text-white/20 mb-2`}>No habits built yet</p>
                                    <p className={`${inter.className} text-white/10`}>Start forging your new identity.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {entries.map((entry, index) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => onSelect?.(entry)}
                                        className="bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 p-6 rounded-xl transition-all group flex flex-col cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="text-xs uppercase tracking-widest text-white/40 mb-1">{entry.data['Category'] || 'General'}</div>
                                                <h3 className={`${playfair.className} text-2xl text-white`}>{String(entry.data['Habit Name'] || 'Untitled')}</h3>
                                            </div>
                                            <div className="flex bg-black/50 rounded-lg overflow-hidden border border-white/10">
                                                <button onClick={(e) => { e.stopPropagation(); onEdit(entry); }} className="p-2 text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); if (onDelete) setDeleteCandidate(entry); }} className="p-2 text-white/40 hover:text-red-400 hover:bg-white/10 transition-colors border-l border-white/10">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-3 flex-1">
                                            <div className="flex justify-between text-sm text-white/60">
                                                <span>Frequency:</span>
                                                <span className="text-white capitalize whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] text-right">
                                                    {entry.data['frequency'] === 'daily' ? 'Every Day' : (entry.data['repeatDays']?.join(', ') || 'Not Set')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm text-white/60">
                                                <span>Schedule:</span>
                                                <span className="text-white font-mono">{entry.data['Time'] || 'Variable'} ({entry.data['duration'] || 30}m)</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-white/60 border-t border-white/10 pt-3">
                                                <span>Current Streak:</span>
                                                <span className="font-mono text-emerald-400 font-bold">{entry.data['Streak'] || 0} 🔥</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Focus Session Modal */}
            <AnimatePresence>
                {focusEntry && (
                    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-8">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="text-center max-w-2xl w-full"
                        >
                            <div className="text-white/40 uppercase tracking-[0.3em] mb-4 text-sm">Focus Mode</div>
                            <h2 className={`${playfair.className} text-6xl text-white mb-2`}>{focusEntry.data['Habit Name']}</h2>
                            <p className={`${inter.className} text-xl text-white/60 mb-12`}>No distractions. Just you and your goal.</p>

                            {/* Timer (Visual Only for now) */}
                            <div className="w-64 h-64 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-12 relative">
                                <div className="absolute inset-0 rounded-full border-t-2 border-white animate-spin duration-[3000ms]" />
                                <div className="text-6xl font-mono text-white">25:00</div>
                            </div>

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => {
                                        if (onFocusComplete && focusEntry) onFocusComplete(25, focusEntry);
                                        setFocusEntry(null)
                                    }}
                                    className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full uppercase tracking-widest text-sm transition-colors border border-white/10"
                                >
                                    End Session
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Delete Modal */}
            <AnimatePresence>
                {deleteCandidate && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-black border border-white/10 p-6 rounded-xl shadow-2xl max-w-sm w-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-900" />
                            <h3 className={`${playfair.className} text-2xl text-white mb-2`}>Delete Habit?</h3>
                            <p className={`${inter.className} text-white/60 mb-6 text-sm`}>
                                You can remove {deleteCandidate.data['Habit Name']} for just today, or delete the habit entirely.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        // Update excludedDates
                                        const excludedDates = deleteCandidate.data['excludedDates'] || [];
                                        onToggleStatus({ // Reusing generic update handler
                                            ...deleteCandidate,
                                            data: {
                                                ...deleteCandidate.data,
                                                excludedDates: [...excludedDates, todayKey]
                                            }
                                        });
                                        setDeleteCandidate(null);
                                    }}
                                    className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg transition-colors text-sm uppercase tracking-widest"
                                >
                                    Remove for Today Only
                                </button>
                                <button
                                    onClick={() => {
                                        if (onDelete) onDelete(deleteCandidate.id, true);
                                        setDeleteCandidate(null);
                                    }}
                                    className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors text-sm uppercase tracking-widest"
                                >
                                    Delete Habit Entirely
                                </button>
                                <button
                                    onClick={() => setDeleteCandidate(null)}
                                    className="w-full py-2 text-white/40 hover:text-white transition-colors text-xs uppercase tracking-widest mt-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
