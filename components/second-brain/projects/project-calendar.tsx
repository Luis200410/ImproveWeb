
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Entry } from '@/lib/data-store'

interface ProjectCalendarProps {
    tasks: Entry[]
    projectStart?: string
    projectDeadline?: string
}

export function ProjectCalendar({ tasks, projectStart, projectDeadline }: ProjectCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() // 0 = Sun

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    // Helper to check if a day has tasks
    const getTasksForDay = (day: number) => {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
        return tasks.filter(t => {
            if (!t.data.DueDate) return false
            return new Date(t.data.DueDate).toDateString() === d
        })
    }

    // Is today?
    const isToday = (day: number) => {
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString() === new Date().toDateString()
    }

    // Is deadline?
    const isDeadline = (day: number) => {
        if (!projectDeadline) return false;
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString() === new Date(projectDeadline).toDateString();
    }

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

    return (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4 font-mono">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3 text-amber-500" />
                    <span className="text-xs text-amber-500 font-bold tracking-widest">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                </div>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors">
                        <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors">
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={`${day}-${i}`} className="text-[10px] text-white/20 font-bold py-1">{day}</div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const dayTasks = getTasksForDay(day)
                    const hasTasks = dayTasks.length > 0
                    const isDue = isDeadline(day);
                    const today = isToday(day);

                    return (
                        <div key={day} className="aspect-square relative group cursor-default">
                            <div className={`
                                w-full h-full flex items-center justify-center text-[10px] rounded-sm transition-all
                                ${today ? 'bg-amber-500 text-black font-bold' : 'text-white/40 hover:bg-white/5'}
                                ${isDue ? 'border border-rose-500' : ''}
                            `}>
                                {day}
                                {hasTasks && !today && (
                                    <div className="absolute bottom-1 w-1 h-1 bg-emerald-500 rounded-full" />
                                )}
                            </div>

                            {/* Tooltip for tasks */}
                            {hasTasks && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-black border border-white/20 p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                    {dayTasks.map(t => (
                                        <div key={t.id} className="text-[9px] text-white truncate mb-0.5">• {t.data.Title}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="mt-3 flex gap-4 justify-center text-[9px] text-white/30 uppercase tracking-wider">
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Task Due</div>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 border border-rose-500 rounded-sm"></div> Deadline</div>
            </div>
        </div>
    )
}
