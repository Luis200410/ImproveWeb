'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Zap, Plus } from 'lucide-react'
import { TaskCreationSheet } from '../task-creation-sheet'
import { TaskDetailsSheet } from '../task-details-sheet'
import { cn } from '@/lib/utils'
import { Entry } from '@/lib/data-store'
import { Droppable, Draggable } from '@hello-pangea/dnd'

interface NeuralCalendarProps {
    tasks?: Entry[]
}

export function NeuralCalendar({ tasks = [] }: NeuralCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const today = new Date()

    // Calendar Logic
    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        return new Date(year, month + 1, 0).getDate()
    }, [currentDate])

    const startDayOffset = useMemo(() => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        let day = new Date(year, month, 1).getDay()
        return day === 0 ? 6 : day - 1
    }, [currentDate])

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    const empties = Array.from({ length: startDayOffset < 0 ? 6 : startDayOffset }, (_, i) => i)

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    // Format Headers
    const monthName = currentDate.toLocaleString('default', { month: 'short' }).toUpperCase()
    const quarter = `Q${Math.floor(currentDate.getMonth() / 3) + 1}`
    const yearDisplay = currentDate.getFullYear().toString().slice(2)

    // Map tasks to days
    const activeDays = useMemo(() => {
        const active = new Set<number>()
        tasks.forEach(t => {
            if (t.data['Start Date']) {
                const d = new Date(t.data['Start Date'])
                if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
                    active.add(d.getDate())
                }
            }
        })
        return active
    }, [tasks, currentDate])

    // INBOX: Tasks with NO status or explicitly 'inbox' (Catch-all for anything not in Matrix)
    const inboxTasks = useMemo(() => {
        return tasks.filter(t => {
            const s = t.data.Status
            // Matrix Filters (Must match TaskMatrix.tsx exactly)
            const isBacklog = s === 'backlog' || s === 'Someday' || s === 'Next' || s === 'Todo'
            const isProcessing = s === 'active' || s === 'wait' || s === 'Waiting' || s === 'In Progress'
            const isDone = s === true || s === 'Done' || s === 'Completed'

            return !isBacklog && !isProcessing && !isDone
        })
    }, [tasks])

    return (
        <div className="w-[300px] h-full border-r border-white/10 p-6 flex flex-col bg-[#050505]">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-amber-500" />
                    <div className="flex-1 flex justify-between items-center">
                        <h2 className="text-xs font-bold tracking-[0.2em] text-white/50">NEURAL</h2>
                        <TaskCreationSheet
                            trigger={
                                <button className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 text-[9px] font-bold text-black hover:bg-amber-400 transition-colors">
                                    <Plus className="w-3 h-3" /> FORGE
                                </button>
                            }
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between pl-3">
                    <span className="text-xs font-bold tracking-[0.2em] text-white/80">CALENDAR</span>
                    <div className="flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/10 select-none">
                        <ChevronLeft onClick={prevMonth} className="w-3 h-3 text-amber-500 cursor-pointer hover:text-white transition-colors" />
                        <span className="text-[10px] font-mono text-amber-500 w-12 text-center">{quarter}.{monthName}.{yearDisplay}</span>
                        <ChevronRight onClick={nextMonth} className="w-3 h-3 text-amber-500 cursor-pointer hover:text-white transition-colors" />
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-12">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <div key={i} className="text-[10px] text-center text-white/20 font-mono mb-2">{d}</div>
                ))}

                {/* Empty slots */}
                {empties.map((_, i) => <div key={`empty-${i}`} />)}

                {days.map((d) => {
                    const isToday = d === today.getDate() &&
                        currentDate.getMonth() === today.getMonth() &&
                        currentDate.getFullYear() === today.getFullYear()

                    const hasTask = activeDays.has(d)

                    return (
                        <div
                            key={d}
                            className={cn(
                                "aspect-square flex items-center justify-center rounded border text-[10px] font-mono cursor-pointer transition-all hover:bg-white/10 relative",
                                isToday
                                    ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                                    : hasTask
                                        ? "bg-white/5 border-white/20 text-white/80"
                                        : "border-transparent text-white/30"
                            )}
                        >
                            {d}
                            {hasTask && !isToday && (
                                <div className="absolute w-1 h-1 rounded-full bg-blue-500 bottom-1" />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* UPCOMING RESONANCE / INBOX */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Upcoming_Resonance</span>
                    <span className="text-[9px] text-white/30 font-mono">INBOX ({inboxTasks.length})</span>
                </div>

                <Droppable droppableId="inbox">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="bg-[#0A0A0A] border border-white/10 rounded-xl flex-1 overflow-y-auto p-2 scrollbar-hide mb-6 relative group"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />

                            {inboxTasks.length === 0 && (
                                <p className="text-xs text-white/30 p-2 italic">Neural buffer empty.</p>
                            )}

                            {inboxTasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="mb-2"
                                        >
                                            <TaskDetailsSheet
                                                task={task}
                                                trigger={
                                                    <div className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-move group/item text-left">
                                                        <h4 className="text-xs text-white/90 font-medium mb-1 line-clamp-2">{task.data.Task || 'Untitled Neural Fragment'}</h4>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[9px] icon-mono text-amber-500">{task.data.Priority || 'LOW'}</span>
                                                            <div className="opacity-0 group-hover/item:opacity-100 text-[10px] text-white/50">:: DRAG</div>
                                                        </div>
                                                    </div>
                                                }
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>

                {/* Data Harvest */}
                <div className="p-4 bg-[#0A0A0A] border border-white/10 rounded-xl border-l-[3px] border-l-blue-500/50 shrink-0">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Data_Harvest</span>
                        <span className="text-[9px] text-white/30 font-mono">TOMORROW</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
