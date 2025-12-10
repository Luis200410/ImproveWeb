'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { ArrowLeft, ArrowRight, Check, Flame, Repeat, Calendar, Clock, Plus, X } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

interface HabitBuilderProps {
    onSave: (data: Record<string, any>) => void
    onCancel: () => void
    onDelete?: () => void
    initialData?: Record<string, any>
    existingEntries?: any[]
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

export function HabitBuilder({ onSave, onCancel, onDelete, initialData, existingEntries = [] }: HabitBuilderProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState<Record<string, any>>(initialData || {
        'frequency': 'daily',
        'repeatDays': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // Default to all days
        'schedule': {}, // { 'Mon': '09:00', ... }
        'Time': '', // Fallback/Default time
        'duration': 30, // Default duration in minutes
        'Category': 'General',
        'useVariableTime': false // Flag to indicate if different times are set for specific days
    })

    // ... (rest of helper functions same as before) ...
    // Helper to check if using advanced schedule (diff times per day)
    const isVariableTime = formData['useVariableTime'] || false;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const timeToMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    }

    const checkOverlap = () => {
        // ... (overlap logic same) ...
        // Simple overlap check logic
        // For each day the new habit is scheduled:
        //   Check if any existing habit on that day overlaps with the proposed time + duration
        // Return true if overlap found
        const newDuration = parseInt(formData['duration'] || 30);
        const daysToCheck = formData['frequency'] === 'daily'
            ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            : (formData['repeatDays'] || []);

        for (const day of daysToCheck) {
            // Get start time for this day
            const timeStr = formData['schedule']?.[day] || formData['Time'];
            if (!timeStr) continue;

            const newStartMin = timeToMinutes(timeStr);
            const newEndMin = newStartMin + newDuration;

            // Check against existing
            for (const entry of existingEntries) {
                // Skip if it's the habit currently being edited (if initialData is present)
                if (initialData && entry.id === initialData.id) continue;

                // Check if existing runs on this day
                const exFreq = entry.data['frequency'] || 'daily';
                const exDays = entry.data['repeatDays'] || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                if (exFreq === 'specific_days' && !exDays.includes(day)) continue;

                const exTimeStr = entry.data['schedule']?.[day] || entry.data['Time'];
                if (!exTimeStr) continue;

                const exDuration = parseInt(entry.data['duration'] || 30);
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
                // If daily, ensure 'repeatDays' has all days
                // If specific_days, ensure 'repeatDays' has selection
                // Ensure 'Time' is set (use a default if variable)
                if (formData['frequency'] === 'daily' && !formData['Time'] && !formData['useVariableTime']) {
                    return;
                }
                if (formData['frequency'] === 'specific_days' && (formData['repeatDays']?.length || 0) === 0) {
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
        setFormData(prev => ({
            ...prev,
            'schedule': { ...prev['schedule'], [day]: time }
        }))
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl">
            {/* Background Ambience */}
            <motion.div
                key={step.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className={`absolute inset-0 z-0 ${step.bgColor} blur-[100px] opacity-20`}
            />

            <div className="relative z-10 w-full max-w-2xl px-8">
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
                                    {/* Frequency Toggles */}
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleChange('frequency', 'daily')}
                                            className={`flex-1 p-6 rounded-xl border transition-all ${formData['frequency'] === 'daily' ? 'bg-white text-black border-white' : 'bg-transparent text-white/60 border-white/10 hover:border-white/40'}`}
                                        >
                                            <Repeat className="w-8 h-8 mb-4 mx-auto" />
                                            <div className="text-xl font-serif font-bold mb-1">Repetitive</div>
                                            <div className="text-xs opacity-60">Every Day</div>
                                        </button>
                                        <button
                                            onClick={() => handleChange('frequency', 'specific_days')}
                                            className={`flex-1 p-6 rounded-xl border transition-all ${formData['frequency'] === 'specific_days' ? 'bg-white text-black border-white' : 'bg-transparent text-white/60 border-white/10 hover:border-white/40'}`}
                                        >
                                            <Calendar className="w-8 h-8 mb-4 mx-auto" />
                                            <div className="text-xl font-serif font-bold mb-1">Specific Days</div>
                                            <div className="text-xs opacity-60">Select Days</div>
                                        </button>
                                    </div>

                                    {/* Specific Days Selector & Time Config */}
                                    {formData['frequency'] === 'specific_days' && (
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
                                            <div className="max-h-[200px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                                {(formData['repeatDays'] || []).length > 0 ? (
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {days.filter(d => (formData['repeatDays'] || []).includes(d)).map(day => (
                                                            <div key={day} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                                                                <span className="font-bold text-white w-12">{day}</span>
                                                                <div className="relative group/time">
                                                                    <input
                                                                        type="time"
                                                                        value={formData['schedule']?.[day] || formData['Time'] || ''}
                                                                        onChange={(e) => {
                                                                            updateSchedule(day, e.target.value);
                                                                            // Also update main time if it's the first one, for sorting fallback
                                                                            if (!formData['Time']) handleChange('Time', e.target.value);
                                                                        }}
                                                                        className="bg-transparent text-xl font-mono text-white outline-none border-b border-white/20 focus:border-white w-32 text-center transition-colors"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-white/30 text-sm italic">Select days above to set times</div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Link Everyday Time */}
                                    {formData['frequency'] === 'daily' && (
                                        <div className="flex flex-col items-center pt-8 space-y-4">
                                            <div className="relative group w-full max-w-xs">
                                                <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/0 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                                <input
                                                    type="time"
                                                    value={formData['Time'] || ''}
                                                    onChange={(e) => handleChange('Time', e.target.value)}
                                                    className="relative w-full bg-black/50 text-5xl md:text-7xl font-mono text-white outline-none border border-white/20 rounded-xl p-6 focus:border-white transition-all text-center placeholder-white/20 appearance-none time-picker-icon-hidden"
                                                    style={{ colorScheme: 'dark' }}
                                                />
                                            </div>

                                            {/* Duration Input */}
                                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                                                <span className="text-white/40 text-sm uppercase tracking-wider">Duration</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={formData['duration'] || 30}
                                                    onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                                                    className="bg-transparent text-white font-mono font-bold text-center w-12 outline-none border-b border-white/20 focus:border-white transition-colors"
                                                />
                                                <span className="text-white/40 text-sm">min</span>
                                            </div>
                                        </div>
                                    )}

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
                            ) : (
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder={step.placeholder}
                                    value={formData[step.field] || ''}
                                    onChange={(e) => handleChange(step.field, e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                    className="w-full bg-transparent text-3xl md:text-4xl font-light text-white outline-none border-b-2 border-white/20 focus:border-white pb-4 transition-colors placeholder-white/20"
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
        </div>
    )
}
