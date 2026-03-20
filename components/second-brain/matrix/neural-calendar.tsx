'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Zap, Plus, Target, Box } from 'lucide-react'
import { TaskCreationSheet } from '../task-creation-sheet'
import { TaskDetailsSheet } from '../task-details-sheet'
import { cn } from '@/lib/utils'
import { Entry } from '@/lib/data-store'
import { getTaskTitle } from '../utils'

interface NeuralCalendarProps {
    tasks?: Entry[]
    selectedProjectId?: string | null
    searchQuery?: string
    onUpdateTask?: (task: Entry, updates: Partial<Entry['data']>) => void
    onDeleteTask?: (taskId: string) => void
    onTaskCreated?: () => void
}

export function NeuralCalendar({ tasks = [], selectedProjectId, searchQuery = '', onUpdateTask, onDeleteTask, onTaskCreated }: NeuralCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate())
    const today = new Date()

    // Status Helper
    const getTaskStatusInfo = (t: Entry) => {
        const s = String(t.data.Status || '').toLowerCase()
        const isDone = t.data.Status === true || s === 'true' || s === 'done' || s === 'completed' || s === 'deployment'
        const isProcessing = s === 'active' || s === 'review' || s === 'processing' || s === 'wait' || s === 'waiting' || s === 'in progress' || s === 'working on'
        const isBacklog = !t.data.Status || s === '' || s === 'inbox' || s === 'backlog' || s === 'someday' || s === 'next' || s === 'todo' || s === 'to do' || s === 'pending' || s === 'due' || s === 'null'
        
        if (isDone) return 'done'
        if (isProcessing) return 'active'
        return 'inbox'
    }

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
        setSelectedDay(null)
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
        setSelectedDay(null)
    }

    const monthName = currentDate.toLocaleString('default', { month: 'short' }).toUpperCase()
    const quarter = `Q${Math.floor(currentDate.getMonth() / 3) + 1}`
    const yearDisplay = currentDate.getFullYear().toString().slice(2)

    // Map tasks to days with Status-aware dots
    const calendarDots = useMemo(() => {
        const dots: Record<number, { 
            tasks: Entry[],
            statusDots: { type: 'start' | 'deadline', status: 'inbox' | 'active' | 'done', taskId: string }[]
        }> = {}

        tasks.forEach(t => {
            const startDate = t.data['Start Date'] || t.data.startDate || t.data.date
            const dueDate = t.data.DueDate || t.data.Deadline || t.data.deadline || t.data['End Date'] || t.data.date
            const statusType = getTaskStatusInfo(t)

            // Process Start Date
            if (startDate) {
                const d = new Date(startDate)
                if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
                    const dayNum = d.getDate()
                    if (!dots[dayNum]) dots[dayNum] = { tasks: [], statusDots: [] }
                    dots[dayNum].tasks.push(t)
                    dots[dayNum].statusDots.push({ type: 'start', status: statusType, taskId: t.id })
                }
            }
            // Process Deadline
            if (dueDate) {
                const d = new Date(dueDate)
                if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
                    const dayNum = d.getDate()
                    if (!dots[dayNum]) dots[dayNum] = { tasks: [], statusDots: [] }
                    if (!dots[dayNum].tasks.find(tk => tk.id === t.id)) dots[dayNum].tasks.push(t)
                    dots[dayNum].statusDots.push({ type: 'deadline', status: statusType, taskId: t.id })
                }
            }
        })
        return dots
    }, [tasks, currentDate])

    const dayTasks = useMemo(() => {
        if (!selectedDay) return []
        const raw = calendarDots[selectedDay]?.tasks || []
        if (!searchQuery) return raw
        return raw.filter(t => getTaskTitle(t, '').toLowerCase().includes(searchQuery.toLowerCase()))
    }, [selectedDay, calendarDots, searchQuery])

    return (
        <div className="w-[300px] h-full border-r border-white/10 p-6 flex flex-col bg-black">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase">Calendar Overlay</span>
                    <TaskCreationSheet
                        onTaskCreated={onTaskCreated}
                        trigger={
                            <button className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 text-[9px] font-bold text-black hover:bg-amber-400 transition-colors">
                                <Plus className="w-3 h-3" /> FORGE
                            </button>
                        }
                    />
                </div>
                <div className="flex items-center justify-between px-2 py-1 rounded bg-white/5 border border-white/10 select-none">
                    <ChevronLeft onClick={prevMonth} className="w-3 h-3 text-amber-500 cursor-pointer hover:text-white transition-colors" />
                    <span className="text-[10px] font-mono text-amber-500 w-12 text-center">{quarter}.{monthName}.{yearDisplay}</span>
                    <ChevronRight onClick={nextMonth} className="w-3 h-3 text-amber-500 cursor-pointer hover:text-white transition-colors" />
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-12">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <div key={i} className="text-[10px] text-center text-white/20 font-mono mb-2">{d}</div>
                ))}
                {empties.map((_, i) => <div key={`empty-${i}`} />)}
                {days.map((d) => {
                    const isToday = d === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()
                    const dayData = calendarDots[d]
                    const isSelected = selectedDay === d

                    return (
                        <div
                            key={d}
                            onClick={() => setSelectedDay(d)}
                            className={cn(
                                "aspect-square flex items-center justify-center rounded border text-[10px] font-mono cursor-pointer transition-all hover:bg-white/10 relative",
                                isSelected
                                    ? "bg-amber-500 border-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] z-10"
                                    : isToday
                                        ? "bg-amber-500/10 border-amber-500 text-amber-500"
                                        : dayData
                                            ? "bg-white/5 border-white/20 text-white/80"
                                            : "border-transparent text-white/30"
                            )}
                        >
                            {d}
                            {dayData && (
                                <div className="absolute flex flex-wrap gap-0.5 bottom-1 px-1 justify-center max-w-full">
                                    {dayData.statusDots.slice(0, 4).map((dot, i) => (
                                        <div 
                                            key={`${dot.taskId}-${i}`}
                                            className={cn(
                                                "w-1 h-1 rounded-full",
                                                dot.status === 'done' ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" :
                                                dot.status === 'active' ? "bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]" :
                                                dot.status === 'inbox' ? "bg-white/40 shadow-[0_0_5px_rgba(255,255,255,0.2)]" :
                                                dot.type === 'start' ? "bg-blue-400" : "bg-rose-400"
                                            )}
                                        />
                                    ))}
                                    {dayData.statusDots.length > 4 && (
                                        <div className="w-1 h-1 rounded-full bg-white/40" />
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-4 px-1">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono flex items-center gap-1">
                        <Target className="w-2.5 h-2.5 text-amber-500" /> DAY_ANALYSIS
                    </span>
                    {selectedDay && (
                        <span className="text-[10px] text-amber-500/80 font-mono">
                            {selectedDay < 10 ? '0' + selectedDay : selectedDay}/{monthName}
                        </span>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-none">
                    <AnimatePresence mode="wait">
                        {!selectedDay ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center p-4 border border-white/5 rounded-xl bg-white/[0.01]">
                                <Box className="w-6 h-6 text-white/10 mb-2" />
                                <p className="text-[10px] font-mono text-white/20 uppercase">SELECT_DAY<br/>FOR_NEURAL_LOGS</p>
                            </motion.div>
                        ) : dayTasks.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center p-4 border border-white/5 rounded-xl bg-white/[0.01]">
                                <Zap className="w-6 h-6 text-white/10 mb-2" />
                                <p className="text-[10px] font-mono text-white/20 uppercase">NO_SIGNALS_DETECTED</p>
                            </motion.div>
                        ) : (
                            dayTasks.map((task, idx) => (
                                <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                                    <TaskDetailsSheet
                                        task={task}
                                        onUpdate={(updates) => onUpdateTask && onUpdateTask(task, updates)}
                                        onDelete={() => onDeleteTask && onDeleteTask(task.id)}
                                        trigger={
                                            <div className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer group/item transition-colors">
                                                <h4 className="text-xs text-white/90 font-medium mb-1 line-clamp-2">{getTaskTitle(task, 'Untitled Neural Fragment')}</h4>
                                                <div className="flex justify-between items-center">
                                                    <span className={cn(
                                                        "text-[9px] font-mono uppercase",
                                                        getTaskStatusInfo(task) === 'done' ? "text-emerald-500" :
                                                        getTaskStatusInfo(task) === 'active' ? "text-amber-500" : "text-blue-400"
                                                    )}>
                                                        {task.data.Priority || 'LOW'} :: {getTaskStatusInfo(task)}
                                                    </span>
                                                    <div className="text-[8px] text-white/20 font-mono">VIEW_NODE</div>
                                                </div>
                                            </div>
                                        }
                                    />
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
