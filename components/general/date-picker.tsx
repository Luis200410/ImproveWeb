'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar } from 'lucide-react'

interface DatePickerProps {
    value: string
    onChange: (value: string) => void
    required?: boolean
    label?: string
}

export function DatePicker({ value, onChange, required, label }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        value ? new Date(value) : null
    )
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const pickerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const daysInMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
    ).getDate()

    const firstDayOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
    ).getDay()

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const handleDateSelect = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        setSelectedDate(date)
        onChange(date.toISOString().split('T')[0])
        setIsOpen(false)
    }

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    }

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    }

    const handleToday = () => {
        const today = new Date()
        setCurrentMonth(today)
        setSelectedDate(today)
        onChange(today.toISOString().split('T')[0])
        setIsOpen(false)
    }

    const isToday = (day: number) => {
        const today = new Date()
        return (
            day === today.getDate() &&
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear()
        )
    }

    const isSelected = (day: number) => {
        if (!selectedDate) return false
        return (
            day === selectedDate.getDate() &&
            currentMonth.getMonth() === selectedDate.getMonth() &&
            currentMonth.getFullYear() === selectedDate.getFullYear()
        )
    }

    return (
        <div className="relative" ref={pickerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 flex items-center justify-between group"
            >
                <span className={selectedDate ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}>
                    {selectedDate
                        ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                        : 'Select date...'}
                </span>
                <Calendar className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-80 bg-black rounded-xl shadow-2xl border border-white/10 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header Title */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xl font-black text-white uppercase tracking-wider">Calendar</span>
                        <div className="flex items-center gap-1 bg-[#1a1a1a] px-3 py-1 rounded border border-white/5">
                            <button onClick={handlePrevMonth} className="text-orange-500/60 hover:text-orange-500 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <span className="text-[10px] font-black text-orange-500 uppercase flex items-center gap-1 mx-2">
                                <span>Q{Math.ceil((currentMonth.getMonth() + 1) / 3)}</span>
                                <span className="text-white/20">.</span>
                                <span>{monthNames[currentMonth.getMonth()].substring(0, 3)}</span>
                                <span className="text-white/20">.</span>
                                <span>{currentMonth.getFullYear().toString().substring(2)}</span>
                            </span>
                            <button onClick={handleNextMonth} className="text-orange-500/60 hover:text-orange-500 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                            <div key={idx} className="text-center text-[10px] font-bold text-white/20 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1
                            const selected = isSelected(day)
                            const today = isToday(day)
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDateSelect(day)}
                                    className={`
                                        aspect-square rounded border text-[11px] font-mono transition-all duration-200 relative
                                        ${selected
                                            ? 'border-orange-500 text-orange-500 bg-orange-500/5 shadow-[0_0_15px_rgba(249,115,22,0.2)] z-10'
                                            : today
                                                ? 'border-white/20 text-white bg-white/5'
                                                : 'border-transparent text-white/30 hover:bg-white/5 hover:text-white'
                                        }
                                    `}
                                >
                                    {today && !selected && (
                                        <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
                                    )}
                                    {day}
                                </button>
                            )
                        })}
                    </div>

                    {/* Today Button - Minimal */}
                    <button
                        onClick={handleToday}
                        className="mt-4 w-full py-1.5 text-[8px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-orange-500 transition-all border border-white/5 rounded"
                    >
                        Sync Current Meta
                    </button>
                </div>
            )}
        </div>
    )
}
