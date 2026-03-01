'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { ArrowLeft, ArrowRight, Check, Flame, Repeat, Calendar, Clock, Plus, X } from 'lucide-react'

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
        title: 'Context',
        subtitle: 'Where does this belong?',
        field: 'Category',
        type: 'select',
        options: ['General', 'Work', 'Study', 'Health', 'Creative', 'Legacy'],
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
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState<Record<string, any>>(initialData || {
        'frequency': 'specific_days',
        'repeatDays': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // Default to all days
        'schedule': {}, // { 'Mon': '09:00', ... }
        'Time': '', // Fallback/Default time
        'preHabitDuration': 5,
        'duration': 30, // Default duration in minutes
        'rewardDuration': 5,
        'Category': 'General',
        'useVariableTime': false // Flag to indicate if different times are set for specific days
    })

    useEffect(() => {
        if (open) {
            setCurrentStep(0)
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
                    'useVariableTime': true // Default true now that we support per-day full edits
                })
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
        // ... (overlap logic same) ...
        // Simple overlap check logic
        // For each day the new habit is scheduled:
        //   Check if any existing habit on that day overlaps with the proposed time + duration
        // Return true if overlap found
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
                // Skip if it's the habit currently being edited (if initialData is present)
                if (initialData && entry.id === initialData.id) continue;

                // Check if existing runs on this day
                const exDays = entry.data['repeatDays'] || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                if (!exDays.includes(day)) continue;

                const exDaySched = entry.data['schedule']?.[day];
                const exTimeStr = (typeof exDaySched === 'object' && exDaySched !== null ? exDaySched.time : exDaySched) || entry.data['Time'];
                if (!exTimeStr || typeof exTimeStr !== 'string') continue;

                const exDuration = parseInt(entry.data['preHabitDuration'] || 5) + parseInt(entry.data['duration'] || 30) + parseInt(entry.data['rewardDuration'] || 5);
                const exStartMin = timeToMinutes(exTimeStr);
                const exEndMin = exStartMin + exDuration;

                // Check overlap: (StartA < EndB) and (EndA > StartB)
                if (newStartMin < exEndMin && newEndMin > exStartMin) {
                    alert(`Conflict detected on ${day} with habit "${entry.data['Habit Name']}"!`);
                    return true;
                }
            }
        }
        return false;
    }

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            // Helper before moving: Ensure data consistency
            if (steps[currentStep].id === 'schedule') { // Schedule Step
                // Ensure at least one day is selected
                if ((formData['repeatDays']?.length || 0) === 0) {
                    return; // require at least one day
                }
                // Check overlap
                if (checkOverlap()) return;
            }
            setCurrentStep(prev => prev + 1)
        } else {
            // Submit
            onSave({
                ...formData,
                'Status': false,
                'Streak': 0,
                'completedDates': []
            })
        }
    }

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

    const step = steps[currentStep]

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[540px] bg-black border-l border-white/10 p-0 flex flex-col h-full align-top !max-w-none overflow-y-auto overflow-x-hidden custom-scrollbar">
                <SheetTitle className="sr-only">Habit Builder</SheetTitle>
                {/* Background Ambience */}
                <motion.div
                    key={step.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className={`absolute inset-0 z-0 ${step.bgColor} blur-[100px] opacity-20`}
                />
                <div className="relative z-10 w-full px-8 py-12 flex-1 flex flex-col">
                    {/* Progress */}
                    <div className="flex gap-2 mb-12">
                        {steps.map((s, i) => (
                            <div
                                key={s.id}
                                className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= currentStep ? s.color.replace('text-', 'bg-') : 'bg-white/10'}`}
                            />
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                {initialData && (
                                    <div className="text-white/40 uppercase tracking-widest text-xs font-bold mb-4">
                                        Editing Habit: <span className="text-white">{formData['Habit Name'] || 'Untitled'}</span>
                                    </div>
                                )}
                                <h2 className={`${playfair.className} text-5xl md:text-6xl font-bold text-white`}>
                                    {step.title}
                                </h2>
                                <p className={`${inter.className} text-xl md:text-2xl font-light ${step.color}`}>
                                    {step.subtitle}
                                </p>
                                {step.description && (
                                    <p className="text-white/40 text-lg pt-2">{step.description}</p>
                                )}
                            </div>

                            <div className="pt-8 min-h-[300px]">
                                {step.type === 'schedule' ? (
                                    <div className="space-y-8">
                                        <div className="space-y-6">
                                            <div className="flex flex-wrap gap-2 justify-center">
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

                                            {/* Logic to show inputs for selected days */}
                                            <div className="max-h-[350px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                                {(formData['repeatDays'] || []).length > 0 ? (
                                                    <div className="grid grid-cols-1 gap-4 mt-4 border-t border-white/10 pt-4">
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
                                                                        <div className="flex flex-col">
                                                                            <span className="text-cyan-400/60 text-[10px] uppercase tracking-wider font-bold">Pre (m)</span>
                                                                            <input
                                                                                type="number" min="0" max="120"
                                                                                value={preVal}
                                                                                onChange={(e) => updateDaySchedule(day, 'preHabitDuration', parseInt(e.target.value) || 0)}
                                                                                className="bg-transparent text-cyan-400 font-mono font-bold text-lg w-16 outline-none border-b border-white/20 focus:border-cyan-400 transition-colors"
                                                                            />
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-amber-400/60 text-[10px] uppercase tracking-wider font-bold">Post (m)</span>
                                                                            <input
                                                                                type="number" min="0" max="120"
                                                                                value={postVal}
                                                                                onChange={(e) => updateDaySchedule(day, 'rewardDuration', parseInt(e.target.value) || 0)}
                                                                                className="bg-transparent text-amber-400 font-mono font-bold text-lg w-16 outline-none border-b border-white/20 focus:border-amber-400 transition-colors"
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
                                ) : step.type === 'select' ? (
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        {(step as any).options.map((option: string) => (
                                            <button
                                                key={option}
                                                onClick={() => handleChange(step.field, option)}
                                                className={`p-6 rounded-xl border transition-all text-left group ${formData[step.field] === option ? 'bg-white text-black border-white' : 'bg-white/5 text-white border-white/10 hover:border-white/40'}`}
                                            >
                                                <div className="text-xl font-serif font-bold mb-1">{option}</div>
                                                <div className={`text-xs uppercase tracking-widest opacity-60 ${formData[step.field] === option ? 'text-black' : 'text-white'}`}>Select Category</div>
                                            </button>
                                        ))}
                                    </div>
                                ) : step.field === 'Habit Name' ? (
                                    <input
                                        type="text"
                                        autoFocus
                                        placeholder={step.placeholder}
                                        value={formData[step.field] || ''}
                                        onChange={(e) => handleChange(step.field, e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                        className="w-full bg-transparent text-3xl md:text-4xl font-light text-white outline-none border-b-2 border-white/20 focus:border-white pb-4 transition-colors placeholder-white/20"
                                    />
                                ) : (
                                    <textarea
                                        autoFocus
                                        placeholder={step.placeholder}
                                        value={formData[step.field] || ''}
                                        onChange={(e) => handleChange(step.field, e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleNext())}
                                        className="w-full bg-transparent text-2xl md:text-3xl font-light text-white outline-none border-b-2 border-white/20 focus:border-white pb-4 transition-colors placeholder-white/20 custom-scrollbar resize-none"
                                        rows={3}
                                    />
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-8">
                                {currentStep === 0 ? (
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={onCancel}
                                            className="text-white/40 hover:text-white uppercase tracking-widest text-sm transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        {initialData && onDelete && (
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this habit?')) onDelete()
                                                }}
                                                className="text-red-400/60 hover:text-red-400 uppercase tracking-widest text-sm transition-colors"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setCurrentStep(prev => prev - 1)}
                                        className="text-white/40 hover:text-white uppercase tracking-widest text-sm transition-colors flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </button>
                                )}

                                <Button
                                    onClick={handleNext}
                                    size="lg"
                                    className="rounded-full px-8 py-6 text-lg bg-white text-black hover:bg-white/90 group"
                                >
                                    {currentStep === steps.length - 1 ? (
                                        <span className="flex items-center gap-2">Forge Habit <Flame className="w-5 h-5" /></span>
                                    ) : (
                                        <span className="flex items-center gap-2">Next <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </SheetContent>
        </Sheet>
    )
}
