'use client'

import { useState, useMemo } from 'react'
import { Entry } from '@/lib/data-store'
import { ChevronLeft, ChevronRight, Dumbbell, Utensils, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BodyCalendarProps {
    dietEntries: Entry[]
    recoveryEntries: Entry[]
    userId: string
}

export function BodyCalendar({ dietEntries, recoveryEntries, userId }: BodyCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const days = new Date(year, month + 1, 0).getDate()
        const firstDay = new Date(year, month, 1).getDay()
        
        const calendarDays = []
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(null)
        }
        for (let i = 1; i <= days; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
            
            const dayDiets = dietEntries.filter(e => e.createdAt.startsWith(dateStr))
            const cals = dayDiets.reduce((sum, e) => sum + Number(e.data['Calories'] || 0), 0)
            const pro = dayDiets.reduce((sum, e) => sum + Number(e.data['Protein (g)'] || 0), 0)
            
            const dayRec = recoveryEntries.filter(e => e.createdAt.startsWith(dateStr))
            const read = dayRec.reduce((sum, e) => sum + Number(e.data['Readiness (1-10)'] || 0), 0) / (dayRec.length || 1)
            
            calendarDays.push({
                date: i,
                dateStr,
                cals,
                pro,
                readiness: dayRec.length ? read.toFixed(1) : null
            })
        }
        return calendarDays
    }, [currentDate, dietEntries, recoveryEntries])

    const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))
    const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    return (
        <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-6 lg:p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">Body Calendar</h3>
                        <p className="text-xs text-white/40">Macro & Recovery Overview</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-white font-mono tracking-widest uppercase text-sm">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={prevMonth} className="text-white/50 hover:text-white">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={nextMonth} className="text-white/50 hover:text-white">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-white/10 rounded-xl overflow-hidden shadow-2xl">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="bg-[#050505] p-3 text-center text-[10px] uppercase tracking-widest text-white/40 font-mono">
                        {day}
                    </div>
                ))}
                
                {daysInMonth.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} className="bg-[#0a0a0a] min-h-[100px]" />
                    
                    const isToday = day.dateStr === new Date().toISOString().split('T')[0]
                    
                    return (
                        <div key={day.date} className="bg-[#0a0a0a] min-h-[120px] p-3 relative group hover:bg-white/[0.02] transition-colors border-t border-white/5">
                            <span className={"text-xs font-mono " + (isToday ? "text-emerald-400 font-bold" : "text-white/40")}>
                                {day.date}
                            </span>
                            
                            <div className="mt-3 space-y-2">
                                {day.cals > 0 && (
                                    <div className="flex items-center justify-between bg-white/[0.03] rounded p-1.5 px-2">
                                        <div className="flex items-center gap-1.5">
                                            <Utensils className="w-3 h-3 text-amber-400" />
                                            <span className="text-[10px] text-white/60">Cals</span>
                                        </div>
                                        <span className="text-[10px] text-white font-mono">{day.cals.toFixed(0)}</span>
                                    </div>
                                )}
                                {day.pro > 0 && (
                                    <div className="flex items-center justify-between bg-white/[0.03] rounded p-1.5 px-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                            <span className="text-[10px] text-white/60">Pro</span>
                                        </div>
                                        <span className="text-[10px] text-white font-mono">{day.pro.toFixed(0)}g</span>
                                    </div>
                                )}
                                {day.readiness && (
                                    <div className="flex items-center justify-between bg-white/[0.03] rounded p-1.5 px-2">
                                        <div className="flex items-center gap-1.5">
                                            <Zap className={"w-3 h-3 " + (Number(day.readiness) >= 7 ? "text-emerald-400" : "text-rose-400")} />
                                            <span className="text-[10px] text-white/60">Readiness</span>
                                        </div>
                                        <span className={"text-[10px] font-mono " + (Number(day.readiness) >= 7 ? "text-emerald-400" : "text-rose-400")}>
                                            {day.readiness}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
