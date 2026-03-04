'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { ArrowLeft, ArrowRight, Check, Flame, Repeat, Calendar, Clock, Plus, X, Zap } from 'lucide-react'
import { LIFE_AREAS } from '@/lib/life-areas'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })
const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
};

const minutesToTime = (mins: number) => {
    const h = Math.floor(mins / 60) % 24;
    const m = Math.floor(mins % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

interface HabitBuilderProps {
    onSave: (data: Record<string, any>) => void
    onCancel: () => void
    onDelete?: () => void
    initialData?: Record<string, any>
    existingEntries?: any[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

const steps = [
    {
        id: 'identity',
        title: 'Identity',
        subtitle: 'Who do you want to become?',
        field: 'Habit Name',
        placeholder: 'e.g., Become a Runner',
        color: 'text-white',
        bgColor: 'bg-white/10'
    },
    {
        id: 'category',
        title: 'Life Area',
        subtitle: 'Which area of life does this serve?',
        field: 'Life Area',
        type: 'life-area',
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-500/20'
    },
    {
        id: 'schedule',
        title: 'Schedule',
        subtitle: 'When will this happen?',
        field: 'schedule', // Logical field name, actual data is 'frequency', 'repeatDays', 'schedule', 'Time'
        type: 'schedule',
        color: 'text-white',
        bgColor: 'bg-white/10'
    },
    {
        id: 'cue',
        title: 'The Cue',
        subtitle: 'Make it Obvious',
        description: 'What triggers this habit?',
        field: 'Cue',
        placeholder: 'e.g., I put on my running shoes...',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/20'
    },
    {
        id: 'craving',
        title: 'The Craving',
        subtitle: 'Make it Attractive',
        description: 'What is the motivation?',
        field: 'Craving',
        placeholder: 'e.g., I want to feel energized...',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20'
    },
    {
        id: 'response',
        title: 'The Response',
        subtitle: 'Make it Easy',
        description: 'What is the action?',
        field: 'Response',
        placeholder: 'e.g., Run for 10 minutes...',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/20'
    },
    {
        id: 'reward',
        title: 'The Reward',
        subtitle: 'Make it Satisfying',
        description: 'What do you get immediately after?',
        field: 'Reward',
        placeholder: 'e.g., A nice smoothie / endorphins...',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20'
    }
]

export function HabitBuilder({ onSave, onCancel, onDelete, initialData, existingEntries = [], open, onOpenChange }: HabitBuilderProps) {

    const [formData, setFormData] = useState<Record<string, any>>(initialData || {
        'frequency': 'specific_days',
        'repeatDays': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // Default to all days
        'schedule': {}, // { 'Mon': '09:00', ... }
        'Time': '', // Fallback/Default time
        'preHabitDuration': 5,
        'duration': 30, // Default duration in minutes
        'rewardDuration': 5,
        'Category': 'General',
        'Life Area': '4-bigs',
        'useVariableTime': false // Flag to indicate if different times are set for specific days
    })

    const [chainedEntryId, setChainedEntryId] = useState<string | null>(null);
    const [isSnapping, setIsSnapping] = useState(false);
    const [chainSelectedDay, setChainSelectedDay] = useState<string>('Mon');

    useEffect(() => {
        if (open) {
            if (initialData) {
                // Ensure old schedule (strings) is converted to object format for the builder UI
                const newSchedule = { ...initialData.schedule };
                const topPre = Number(initialData.preHabitDuration) || 5;
                const topDur = Number(initialData.duration) || 30;
                const topRew = Number(initialData.rewardDuration) || 5;
                const topTotal = topPre + topDur + topRew;

                for (const day in newSchedule) {
                    if (typeof newSchedule[day] === 'string') {
                        const t = newSchedule[day];
                        newSchedule[day] = {
                            time: t,
                            endTime: minutesToTime(timeToMinutes(t) + topTotal),
                            preHabitDuration: topPre,
                            duration: topDur,
                            rewardDuration: topRew,
                            totalDuration: topTotal
                        };
                    } else if (!newSchedule[day].endTime) {
                        newSchedule[day].endTime = minutesToTime(timeToMinutes(newSchedule[day].time) + (Number(newSchedule[day].totalDuration) || topTotal));
                    }
                }
                setFormData({
                    ...initialData,
                    schedule: newSchedule,
                    // keep top level ones for fallback/simplicity if needed elsewhere
                    totalDuration: topTotal
                })

                const days = initialData.repeatDays || [];
                if (days.length > 0) setChainSelectedDay(days[0]);
            } else {
                setFormData({
                    'frequency': 'specific_days',
                    'repeatDays': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    'schedule': {},
                    'Time': '',
                    'totalDuration': 40,
                    'preHabitDuration': 5,
                    'duration': 30,
                    'rewardDuration': 5,
                    'Category': 'General',
                    'Life Area': '4-bigs',
                    'useVariableTime': true // Default true now that we support per-day full edits
                })
                setChainSelectedDay('Mon');
            }
        }
    }, [open, initialData])

    // Update schedule now handles complex object
    const updateDaySchedule = (day: string, field: string, value: any) => {
        setFormData(prev => {
            const currentDayObj = prev['schedule']?.[day] || {
                time: prev['Time'] || '09:00',
                endTime: '',
                totalDuration: prev['totalDuration'] || 40,
                preHabitDuration: prev['preHabitDuration'] || 5,
                rewardDuration: prev['rewardDuration'] || 5,
                duration: prev['duration'] || 30
            };

            const nextDayObj = { ...currentDayObj, [field]: value };

            if (field === 'time' || field === 'endTime') {
                const startMins = timeToMinutes(nextDayObj.time || '09:00');
                // Calculate implicit end string if not provided
                const endStr = nextDayObj.endTime || minutesToTime(startMins + (Number(nextDayObj.totalDuration) || 40));
                nextDayObj.endTime = endStr;

                let endMins = timeToMinutes(endStr);
                if (endMins < startMins) endMins += 24 * 60; // handle overnight
                nextDayObj.totalDuration = Math.max(1, endMins - startMins);
            }

            // Recalculate duration if time blocks change
            if (field === 'totalDuration' || field === 'preHabitDuration' || field === 'rewardDuration' || field === 'time' || field === 'endTime') {
                const total = Number(nextDayObj.totalDuration) || 0;
                const pre = Number(nextDayObj.preHabitDuration) || 0;
                const rew = Number(nextDayObj.rewardDuration) || 0;
                nextDayObj.duration = Math.max(1, total - pre - rew);
            }

            return {
                ...prev,
                'schedule': { ...prev['schedule'], [day]: nextDayObj }
            }
        });
    }

    const getAmPm = (tStr: string) => {
        if (!tStr) return '';
        const [h] = tStr.split(':').map(Number);
        if (isNaN(h)) return '';
        return h >= 12 ? 'PM' : 'AM';
    };

    // Helper to check if using advanced schedule (diff times per day)
    const isVariableTime = formData['useVariableTime'] || false;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const checkOverlap = () => {
        const newDuration = parseInt(formData['preHabitDuration'] || 5) + parseInt(formData['duration'] || 30) + parseInt(formData['rewardDuration'] || 5);
        const daysToCheck = formData['repeatDays'] || [];

        for (const day of daysToCheck) {
            // Get start time for this day
            const daySched = formData['schedule']?.[day];
            const timeStr = (typeof daySched === 'object' && daySched !== null ? daySched.time : daySched) || formData['Time'];
            if (!timeStr || typeof timeStr !== 'string') continue;

            const newStartMin = timeToMinutes(timeStr);
            const newEndMin = newStartMin + newDuration;

            // Check against existing
            for (const entry of existingEntries) {
                if (initialData && entry.id === initialData.id) continue;

                const exDays = entry.data['repeatDays'] || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                if (!exDays.includes(day)) continue;

                const exDaySched = entry.data['schedule']?.[day];
                const exTimeStr = (typeof exDaySched === 'object' && exDaySched !== null ? exDaySched.time : exDaySched) || entry.data['Time'];
                if (!exTimeStr || typeof exTimeStr !== 'string') continue;

                const exDuration = parseInt(entry.data['preHabitDuration'] || 5) + parseInt(entry.data['duration'] || 30) + parseInt(entry.data['rewardDuration'] || 5);
                const exStartMin = timeToMinutes(exTimeStr);
                const exEndMin = exStartMin + exDuration;

                if (newStartMin < exEndMin && newEndMin > exStartMin) {
                    alert(`Conflict detected on ${day} with habit "${entry.data['Habit Name']}"!`);
                    return true;
                }
            }
        }
        return false;
    }

    const handleSave = () => {
        if ((formData['repeatDays']?.length || 0) === 0) {
            alert("Please select at least one day for the schedule.");
            return;
        }
        if (checkOverlap()) return;

        onSave({
            ...formData,
            'Status': false,
            'Streak': 0,
            'completedDates': []
        })
    }

    // Filter habits for the selected day BEFORE the scheduled time for that day
    const getProximateHabits = () => {
        const daySched = formData['schedule']?.[chainSelectedDay];
        const currentTimeString = (daySched && daySched.time) ? daySched.time : formData['Time'];
        if (!currentTimeString) return [];
        const currentMins = timeToMinutes(currentTimeString);

        return existingEntries.filter(e => {
            if (initialData && e.id === initialData.id) return false;

            const exDays = e.data['repeatDays'] || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            if (!exDays.includes(chainSelectedDay)) return false;

            const entryDaySched = e.data['schedule']?.[chainSelectedDay];
            const entryTimeStr = (entryDaySched && entryDaySched.time) ? entryDaySched.time : e.data['Time'];
            if (!entryTimeStr) return false;

            const entryMins = timeToMinutes(entryTimeStr);
            // Must be before the current habit's time
            return entryMins < currentMins;
        }).sort((a, b) => {
            // Sort to show closest items first
            const timeA = timeToMinutes((a.data['schedule']?.[chainSelectedDay]?.time) || a.data['Time']);
            const timeB = timeToMinutes((b.data['schedule']?.[chainSelectedDay]?.time) || b.data['Time']);
            return timeB - timeA; // Descending, so closest (largest time < currentMins) is first
        });
    };

    const handleChainHabit = (entry: any) => {
        if (!entry) return;

        // Note: Chaining updates the time specifically for the chainSelectedDay
        const day = chainSelectedDay;

        setFormData((prev: Record<string, any>) => {
            // Ensure the day is added to repeatDays if not already present
            let newRepeatDays = prev['repeatDays'] || [];
            if (!newRepeatDays.includes(day)) {
                newRepeatDays = [...newRepeatDays, day];
            }

            const nextForm: Record<string, any> = { ...prev, repeatDays: newRepeatDays, Category: entry.data['Category'] || prev.Category };

            const exDaySched = entry.data['schedule']?.[day];
            const exTimeStr = (typeof exDaySched === 'object' && exDaySched !== null ? exDaySched.time : exDaySched) || entry.data['Time'];
            if (exTimeStr && typeof exTimeStr === 'string') {
                const exDuration = parseInt(entry.data['preHabitDuration'] || 5) + parseInt(entry.data['duration'] || 30) + parseInt(entry.data['rewardDuration'] || 5);

                // Snap our start time directly to their end time
                const startMins = timeToMinutes(exTimeStr) + exDuration;
                const newTimeStr = minutesToTime(startMins);

                const currentDayObj = nextForm['schedule']?.[day] || {
                    time: nextForm['Time'] || '09:00',
                    endTime: '',
                    totalDuration: nextForm['totalDuration'] || 40,
                    preHabitDuration: nextForm['preHabitDuration'] || 5,
                    rewardDuration: nextForm['rewardDuration'] || 5,
                    duration: nextForm['duration'] || 30
                };

                const total = Number(currentDayObj.totalDuration) || 40;

                nextForm['schedule'] = {
                    ...nextForm['schedule'],
                    [day]: {
                        ...currentDayObj,
                        time: newTimeStr,
                        endTime: minutesToTime(startMins + total)
                    }
                };
            }
            return nextForm;
        });

        // Trigger snap animation
        setChainedEntryId(entry.id);
        setIsSnapping(true);
        setTimeout(() => setIsSnapping(false), 800);
        setTimeout(() => setChainedEntryId(null), 2000);
    };


    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const updateSchedule = (day: string, time: string) => {
        updateDaySchedule(day, 'time', time);
    }

    const toggleDay = (day: string) => {
        setFormData(prev => {
            const currentDays = prev['repeatDays'] || []
            let newDays;
            if (currentDays.includes(day)) {
                newDays = currentDays.filter((d: string) => d !== day)
            } else {
                newDays = [...currentDays, day]
            }
            return { ...prev, 'repeatDays': newDays }
        })
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[540px] md:w-[600px] bg-black border-l border-white/10 p-0 flex flex-col h-full align-top !max-w-none">
                <SheetTitle className="sr-only">Habit Builder</SheetTitle>

                <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-8 py-4 flex items-center justify-between">
                    <div className="text-white/40 uppercase tracking-widest text-xs font-bold">
                        {initialData ? 'Editing Habit' : 'Forging New Habit'}
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={onCancel} className="text-white/40 hover:text-white uppercase tracking-widest text-xs transition-colors">
                            Cancel
                        </button>
                        {initialData && onDelete && (
                            <button onClick={() => confirm('Delete this habit?') && onDelete()} className="text-red-400/60 hover:text-red-400 uppercase tracking-widest text-xs transition-colors">
                                Delete
                            </button>
                        )}
                        <Button onClick={handleSave} size="sm" className="rounded-full px-6 bg-white text-black hover:bg-white/90">
                            <span className="flex items-center gap-2">Forge <Flame className="w-4 h-4" /></span>
                        </Button>
                    </div>
                </div>

                <div className="relative z-10 w-full px-8 py-8 flex-1 flex flex-col overflow-y-auto overflow-x-hidden custom-scrollbar space-y-16">

                    {/* Auto-Chain Segment */}
                    {existingEntries.length > 0 && (
                        <div className="space-y-4 pt-4">
                            <h3 className={`${playfair.className} text-2xl text-white flex items-center gap-2`}>
                                <Zap className="w-5 h-5 text-amber-400" />
                                Chain to Routine
                            </h3>
                            <p className="text-white/40 text-sm">Select an existing habit to automatically link this new habit right after it completes. This connects the Cue and Reward of both habits.</p>

                            <div className="flex flex-wrap gap-2 justify-start mb-4">
                                {days.map(day => (
                                    <button
                                        key={day}
                                        onClick={() => setChainSelectedDay(day)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${chainSelectedDay === day ? 'bg-amber-400 text-black border-amber-400' : 'bg-transparent text-white/40 border-white/10 hover:border-white/60 hover:text-white'}`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>

                            <div className="relative min-h-[300px] flex items-center justify-center bg-black border border-white/10 rounded-2xl p-6 overflow-hidden group/chain-zone">
                                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover/chain-zone:opacity-100 transition-opacity" />

                                <div className="relative z-10 w-full flex flex-col items-center gap-12">
                                    {/* Proximate Habits Row */}
                                    <div className="flex flex-wrap gap-4 justify-center items-center w-full min-h-[120px]">
                                        <AnimatePresence mode="popLayout">
                                            {getProximateHabits().map((entry) => (
                                                <motion.div
                                                    key={entry.id}
                                                    layout
                                                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                                    exit={{ scale: 0.8, opacity: 0, y: -20 }}
                                                    whileHover={{ scale: 1.05, y: -5 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    drag
                                                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                                    dragElastic={0.4}
                                                    onDragEnd={(_, info) => {
                                                        // "Gather" behavior: if dragged down towards the current habit target
                                                        if (info.offset.y > 60) {
                                                            handleChainHabit(entry);
                                                        }
                                                    }}
                                                    className="cursor-grab active:cursor-grabbing relative z-20"
                                                >
                                                    {/* Top Card (Previous Habit) matches mock image */}
                                                    <div className={`relative w-[260px] h-[90px] rounded-2xl flex flex-col items-center justify-center shadow-lg font-sans transition-all duration-300
                                                        ${chainedEntryId === entry.id ? 'bg-[#D9D9D9] scale-90 opacity-70 border-4 border-amber-400' : 'bg-[#D9D9D9]'}
                                                    `}>
                                                        <div className="absolute top-3 right-4 text-xs font-medium text-[#525252]">
                                                            {(entry.data['schedule']?.[chainSelectedDay]?.time) || entry.data['Time']}
                                                        </div>
                                                        <div className="text-[#171717] text-2xl font-bold truncate px-4 w-full text-center leading-tight">{entry.data['Habit Name']}</div>

                                                        {/* Bottom Tab "post habit" */}
                                                        <div className="absolute -bottom-[22px] left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                                                            <div className="bg-[#FFFF00] text-black text-[11px] font-bold px-4 pt-1 pb-4 rounded-full shadow-sm relative">
                                                                post habit
                                                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#008000] rounded-full border-2 border-[#FFFF00]"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {getProximateHabits().length === 0 && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-white/20 text-xs italic text-center py-4 w-full"
                                            >
                                                No habits scheduled before {formData['schedule']?.[chainSelectedDay]?.time || formData['Time'] || '00:00'} on {chainSelectedDay}
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Current Habit Connection Zone (Drop Target) */}
                                    <div className="relative flex flex-col items-center gap-2 mt-8">
                                        <motion.div
                                            animate={isSnapping ? { scale: [1, 1.1, 1], filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] } : {}}
                                            className="relative w-[260px] h-[90px] bg-[#D9D9D9] text-[#171717] rounded-2xl flex items-center justify-center font-sans shadow-lg"
                                        >
                                            <div className="absolute top-3 right-4 text-xs font-medium text-[#525252]">
                                                {formData['schedule']?.[chainSelectedDay]?.time || formData['Time'] || 'Set Time'}
                                            </div>
                                            <div className="text-2xl font-bold truncate px-4 text-center">
                                                {formData['Habit Name'] || 'Your New Habit'}
                                            </div>

                                            {/* Top Tab "pre Habit" */}
                                            <div className="absolute -top-[22px] left-1/2 -translate-x-1/2 flex flex-col items-center z-10 transition-transform">
                                                <div className="bg-[#FFFF00] text-black text-[11px] font-bold px-4 pt-4 pb-1 rounded-full shadow-sm relative">
                                                    pre Habit
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#008000] rounded-full border-2 border-[#FFFF00]"></div>
                                                </div>
                                            </div>

                                            {/* Gathering Glow */}
                                            <AnimatePresence>
                                                {isSnapping && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.5 }}
                                                        animate={{ opacity: 1, scale: 1.5 }}
                                                        exit={{ opacity: 0 }}
                                                        className="absolute inset-0 bg-amber-400/40 blur-xl rounded-full pointer-events-none"
                                                    />
                                                )}
                                            </AnimatePresence>
                                        </motion.div>

                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] text-white/40 whitespace-nowrap uppercase tracking-widest opacity-0 group-hover/chain-zone:opacity-100 transition-opacity">
                                            Pull habit down to connect <Zap className="inline w-2.5 h-2.5 ml-1 text-amber-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                                {steps.map(step => (
                                    <div key={step.id} className="space-y-6 relative">
                                        <div className="space-y-2">
                                            <h2 className={`${playfair.className} text-4xl font-bold text-white`}>
                                                {step.title}
                                            </h2>
                                            <p className={`${inter.className} text-lg font-light ${step.color}`}>
                                                {step.subtitle}
                                            </p>
                                            {step.description && (
                                                <p className="text-white/40 text-sm pt-1">{step.description}</p>
                                            )}
                                        </div>

                                        <div className="pt-2">
                                            {step.type === 'schedule' ? (
                                                <div className="space-y-8">
                                                    <div className="space-y-6">
                                                        <div className="flex flex-wrap gap-2 justify-start">
                                                            {days.map(day => (
                                                                <button
                                                                    key={day}
                                                                    onClick={() => toggleDay(day)}
                                                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${formData['repeatDays']?.includes(day) ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10 hover:border-white/60 hover:text-white'}`}
                                                                >
                                                                    {day[0]}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        <div className="space-y-3">
                                                            {(formData['repeatDays'] || []).length > 0 ? (
                                                                <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-4">
                                                                    {days.filter(d => (formData['repeatDays'] || []).includes(d)).map(day => {
                                                                        const daySched = formData['schedule']?.[day] || {};
                                                                        const timeVal = daySched.time || formData['Time'] || '';
                                                                        const totalVal = daySched.totalDuration ?? formData['totalDuration'] ?? 40;
                                                                        const preVal = daySched.preHabitDuration ?? formData['preHabitDuration'] ?? 5;
                                                                        const postVal = daySched.rewardDuration ?? formData['rewardDuration'] ?? 5;
                                                                        const coreVal = daySched.duration ?? formData['duration'] ?? 30;

                                                                        return (
                                                                            <div key={day} className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                                                                                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                                                                    <span className="font-bold text-white uppercase tracking-widest text-sm">{day}</span>
                                                                                    <div className="flex items-center gap-1">
                                                                                        <div className="flex items-center bg-transparent border-b border-white/20 focus-within:border-yellow-400 transition-colors pb-1">
                                                                                            <input
                                                                                                type="time"
                                                                                                value={timeVal}
                                                                                                onChange={(e) => {
                                                                                                    updateDaySchedule(day, 'time', e.target.value);
                                                                                                    if (!formData['Time']) handleChange('Time', e.target.value);
                                                                                                }}
                                                                                                className="bg-transparent text-xl font-mono text-white outline-none w-[110px] text-center"
                                                                                            />
                                                                                        </div>
                                                                                        <span className="text-white/40 font-mono mx-1">-</span>
                                                                                        <div className="flex items-center bg-transparent border-b border-white/20 focus-within:border-yellow-400 transition-colors pb-1">
                                                                                            <input
                                                                                                type="time"
                                                                                                value={daySched.endTime || minutesToTime(timeToMinutes(timeVal) + totalVal)}
                                                                                                onChange={(e) => updateDaySchedule(day, 'endTime', e.target.value)}
                                                                                                className="bg-transparent text-xl font-mono text-white outline-none w-[110px] text-center"
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="flex items-center justify-between gap-4">
                                                                                    <div className="flex flex-col">
                                                                                        <span className="text-white/60 text-[10px] uppercase tracking-wider font-bold">Total (m)</span>
                                                                                        <span className="text-white/60 font-mono font-bold text-lg leading-[28px]">{totalVal}</span>
                                                                                    </div>
                                                                                    <div className="flex flex-col items-center">
                                                                                        <span className="text-cyan-400/60 text-[10px] uppercase tracking-wider font-bold">Pre (m)</span>
                                                                                        <input
                                                                                            type="number" min="0" max="120"
                                                                                            value={preVal}
                                                                                            onChange={(e) => updateDaySchedule(day, 'preHabitDuration', parseInt(e.target.value) || 0)}
                                                                                            className="bg-transparent text-cyan-400 font-mono font-bold text-lg w-12 outline-none border-b border-white/20 focus:border-cyan-400 transition-colors text-center p-0 m-0"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="flex flex-col items-center">
                                                                                        <span className="text-amber-400/60 text-[10px] uppercase tracking-wider font-bold">Post (m)</span>
                                                                                        <input
                                                                                            type="number" min="0" max="120"
                                                                                            value={postVal}
                                                                                            onChange={(e) => updateDaySchedule(day, 'rewardDuration', parseInt(e.target.value) || 0)}
                                                                                            className="bg-transparent text-amber-400 font-mono font-bold text-lg w-12 outline-none border-b border-white/20 focus:border-amber-400 transition-colors text-center p-0 m-0"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="flex flex-col items-end">
                                                                                        <span className="text-emerald-400/60 text-[10px] uppercase tracking-wider font-bold">Core (m)</span>
                                                                                        <span className="text-emerald-400 font-mono font-bold text-lg leading-[28px]">{coreVal}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <div className="text-center text-white/30 text-sm italic">Select days above to set times</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : step.type === 'life-area' ? (
                                                <div className="grid grid-cols-2 gap-3">
                                                    {LIFE_AREAS.map((area) => (
                                                        <button
                                                            key={area.id}
                                                            onClick={() => handleChange('Life Area', area.id)}
                                                            className={`px-4 py-4 rounded-xl border transition-all text-left group relative overflow-hidden ${formData['Life Area'] === area.id
                                                                ? 'border-white/60 bg-white/10'
                                                                : 'bg-white/5 border-white/10 hover:border-white/30'
                                                                }`}
                                                            style={formData['Life Area'] === area.id ? { borderColor: area.color + '80', backgroundColor: area.color + '15' } : {}}
                                                        >
                                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle at 30% 50%, ${area.color}10, transparent 70%)` }} />
                                                            <div className="text-2xl mb-1">{area.emoji}</div>
                                                            <div className="text-sm font-bold text-white">{area.label}</div>
                                                            {formData['Life Area'] === area.id && (
                                                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: area.color }} />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : step.type === 'select' ? (
                                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {(step as any).options.map((option: string) => (
                                                        <button
                                                            key={option}
                                                            onClick={() => handleChange(step.field, option)}
                                                            className={`px-4 py-4 rounded-xl border transition-all text-left group ${formData[step.field] === option ? 'bg-white text-black border-white' : 'bg-white/5 text-white border-white/10 hover:border-white/40'}`}
                                                        >
                                                            <div className="text-lg font-serif font-bold mb-1">{option}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : step.field === 'Habit Name' ? (
                                                <input
                                                    type="text"
                                                    placeholder={step.placeholder}
                                                    value={formData[step.field] || ''}
                                                    onChange={(e) => handleChange(step.field, e.target.value)}
                                                    className="w-full bg-transparent text-3xl font-light text-white outline-none border-b-2 border-white/20 focus:border-white pb-2 transition-colors placeholder-white/20"
                                                />
                                            ) : (
                                                <textarea
                                                    placeholder={step.placeholder}
                                                    value={formData[step.field] || ''}
                                                    onChange={(e) => handleChange(step.field, e.target.value)}
                                                    className="w-full bg-transparent text-xl font-light text-white outline-none border-b-2 border-white/20 focus:border-white pb-2 transition-colors placeholder-white/20 custom-scrollbar resize-none"
                                                    rows={2}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div className="h-12 w-full"></div>
                            </div>
                        </SheetContent>
                    </Sheet>
                    )
}
