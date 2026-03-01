'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { Zap, Clock, Check, AlertCircle, TrendingUp } from 'lucide-react'
import { Entry, dataStore } from '@/lib/data-store'
import { sileo } from 'sileo'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

interface UnexpectedEventsSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    todayHabits: Entry[]
    currentDate: Date
    userId: string
    onAdaptationApplied: () => void
}

export function UnexpectedEventsSheet({ open, onOpenChange, todayHabits, currentDate, userId, onAdaptationApplied }: UnexpectedEventsSheetProps) {
    const [eventType, setEventType] = useState<'session' | 'event'>('event')
    const [eventDescription, setEventDescription] = useState('')
    const [currentTimeVal, setCurrentTimeVal] = useState(
        currentDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    )
    const [durationMinutes, setDurationMinutes] = useState('60')
    const [isApplying, setIsApplying] = useState(false)

    const parseTimeToMinutes = (timeStr: string) => {
        const clean = timeStr.replace(/[^0-9:]/g, '')
        const [h, m] = clean.split(':').map(Number)
        let hours = h || 0;
        const mins = m || 0;
        if (timeStr.toLowerCase().includes('pm') && hours < 12) hours += 12;
        if (timeStr.toLowerCase().includes('am') && hours === 12) hours = 0;
        return (hours * 60) + mins;
    }

    const formatMinutesToTime = (totalMinutes: number) => {
        const h = Math.floor(totalMinutes / 60) % 24
        const m = totalMinutes % 60
        // Use 24h format to match existing timeline parsing
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    }

    const handleApply = async () => {
        if (!eventDescription.trim() || !durationMinutes || isNaN(Number(durationMinutes))) {
            sileo.error({ description: 'Please provide a description and a valid duration.' })
            return
        }

        setIsApplying(true)

        try {
            const dateString = currentDate.toISOString().split('T')[0]
            const eventStartMins = parseTimeToMinutes(currentTimeVal)
            const shiftMins = Number(durationMinutes)

            const adaptedSchedule: Record<string, any> = {}

            // Calculate Shifts
            todayHabits.forEach(habit => {
                if (habit.data['Type'] === 'adaptation') return;

                // Get the scheduled time for today or fallback to default Time
                const todayDayKey = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][currentDate.getDay()]
                const rawTime = habit.data['schedule']?.[todayDayKey] || habit.data['Time'] || '00:00'
                const habitStartMins = parseTimeToMinutes(rawTime)

                // If habit is after or exactly at the event start time, shift it down
                if (habitStartMins >= eventStartMins) {
                    const newStartMins = habitStartMins + shiftMins;
                    const newTimeStr = formatMinutesToTime(newStartMins);

                    adaptedSchedule[habit.id] = {
                        time: newTimeStr,
                        // Do not change duration
                        duration: habit.data['Duration (minutes)'] || 60,
                        rationale: `Shifted by ${shiftMins}m due to unexpected ${eventType}`
                    }
                }
            })

            const eventTitle = eventType === 'session' ? `Productive Session: ${eventDescription}` : `Distraction: ${eventDescription}`

            // Save as a specialized adaptation entry linked to this date
            await dataStore.addEntry(userId, 'atomic-habits', {
                'Type': 'adaptation',
                'Date': dateString,
                'Event Description': eventDescription,
                'Event Title': eventTitle,
                'Event Time': currentTimeVal,
                'Event Duration': shiftMins,
                'Event Color': eventType === 'session' ? 'green' : 'red',
                'Adaptation Title': 'Schedule Shift',
                'Adapted Schedule': adaptedSchedule
            })

            sileo.success({ description: 'Schedule updated successfully!' })
            reset()
            onAdaptationApplied()
        } catch (error) {
            console.error(error)
            sileo.error({ description: 'Failed to update schedule.' })
        } finally {
            setIsApplying(false)
        }
    }

    const reset = () => {
        setEventDescription('')
        setDurationMinutes('60')
        setIsApplying(false)
        onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={(isOpen) => {
            if (!isOpen) reset()
            else onOpenChange(isOpen)
        }}>
            <SheetContent className="w-full sm:w-[540px] bg-black border-l border-white/10 p-0 flex flex-col h-full !max-w-none overflow-y-auto">
                <SheetHeader className="p-6 border-b border-white/10 shrink-0 sticky top-0 bg-black/80 backdrop-blur z-10 flex flex-row items-center justify-between">
                    <div>
                        <SheetTitle className={`${playfair.className} text-3xl font-bold text-white flex items-center gap-3`}>
                            <Zap className="w-6 h-6 text-yellow-400" />
                            Unexpected Events
                        </SheetTitle>
                        <SheetDescription className={`${inter.className} text-white/60 mt-2`}>
                            Log sudden changes to shift your remaining habits downwards.
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <div className="p-6 flex-1 flex flex-col gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Event Type Selection */}
                        <div className="space-y-3">
                            <label className={`${inter.className} text-sm font-medium text-white/80 uppercase tracking-wider`}>
                                Event Type
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setEventType('session')}
                                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${eventType === 'session' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/30'}`}
                                >
                                    <TrendingUp className="w-6 h-6" />
                                    <span className="font-bold text-sm">Productive Session</span>
                                </button>
                                <button
                                    onClick={() => setEventType('event')}
                                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${eventType === 'event' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/30'}`}
                                >
                                    <AlertCircle className="w-6 h-6" />
                                    <span className="font-bold text-sm">Distraction</span>
                                </button>
                            </div>
                        </div>

                        {/* Event Description */}
                        <div className="space-y-3">
                            <label className={`${inter.className} text-sm font-medium text-white/80 uppercase tracking-wider`}>
                                What happened?
                            </label>
                            <Textarea
                                placeholder="e.g. Boss called a sudden meeting, or spent an extra hour learning to code"
                                value={eventDescription}
                                onChange={(e) => setEventDescription(e.target.value)}
                                className="bg-white/5 border-white/10 text-white min-h-[100px] resize-none focus-visible:ring-yellow-400/50"
                            />
                        </div>

                        {/* Timing */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className={`${inter.className} text-sm font-medium text-white/80 uppercase tracking-wider flex items-center gap-2`}>
                                    <Clock className="w-4 h-4 text-white/40" /> Start Time
                                </label>
                                <input
                                    type="time"
                                    value={currentTimeVal}
                                    onChange={(e) => setCurrentTimeVal(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-md focus-visible:ring-yellow-400/50"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className={`${inter.className} text-sm font-medium text-white/80 uppercase tracking-wider`}>
                                    Duration (mins)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={durationMinutes}
                                    onChange={(e) => setDurationMinutes(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-md focus-visible:ring-yellow-400/50"
                                />
                            </div>
                        </div>

                        <div className="bg-white/5 border border-yellow-400/20 rounded-lg p-4 flex items-start gap-3 mt-4">
                            <Zap className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-white/70 leading-relaxed">
                                This will shift all habits scheduled at or after <strong className="text-white">{currentTimeVal}</strong> down by exactly <strong className="text-white">{durationMinutes} minutes</strong> to keep you on track. Habits before this time are unaffected.
                            </p>
                        </div>

                        <Button
                            onClick={handleApply}
                            disabled={!eventDescription.trim() || isApplying}
                            className="w-full bg-yellow-400 text-black hover:bg-yellow-500 font-bold py-6 group mt-4"
                        >
                            <Check className="w-5 h-5 mr-2" />
                            {isApplying ? 'Applying Shift...' : 'Shift Schedule'}
                        </Button>
                    </motion.div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
