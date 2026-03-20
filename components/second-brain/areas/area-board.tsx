'use client'

import { Entry } from '@/lib/data-store'
import { AreaEntry } from './area-utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, GripVertical, MoreVertical, Layout, Zap, Boxes, ArrowUpRight } from 'lucide-react'
import { DragDropContext, Draggable, DropResult } from '@hello-pangea/dnd'
import { StrictModeDroppable } from '@/components/strict-mode-droppable'
import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface AreaBoardProps {
    areas: AreaEntry[]
    onUpdateArea: (area: AreaEntry, updates: any) => void
    onAreaClick: (id: string) => void
    projects?: Entry[]
    tasks?: Entry[]
}

export function AreaBoard({ areas, onUpdateArea, onAreaClick, projects = [], tasks = [] }: AreaBoardProps) {
    const [columns, setColumns] = useState<{ [key: string]: AreaEntry[] }>({
        Green: [],
        Amber: [],
        Red: []
    })

    useEffect(() => {
        const green = areas.filter(a => (a.data.ragStatus || 'Green') === 'Green')
        const amber = areas.filter(a => a.data.ragStatus === 'Amber')
        const red = areas.filter(a => a.data.ragStatus === 'Red')

        setColumns({
            Green: green,
            Amber: amber,
            Red: red
        })
    }, [areas])

    const handleDragEnd = (result: DropResult) => {
        const { source, destination } = result
        if (!destination) return
        if (source.droppableId === destination.droppableId && source.index === destination.index) return

        const sourceColId = source.droppableId
        const destColId = destination.droppableId
        const sourceList = [...columns[sourceColId]]
        const destList = sourceColId === destColId ? sourceList : [...columns[destColId]]

        const [movedArea] = sourceList.splice(source.index, 1)

        if (sourceColId === destColId) {
            sourceList.splice(destination.index, 0, movedArea)
            setColumns({ ...columns, [sourceColId]: sourceList })
        } else {
            destList.splice(destination.index, 0, movedArea)
            setColumns({
                ...columns,
                [sourceColId]: sourceList,
                [destColId]: destList
            })
            onUpdateArea(movedArea, { ragStatus: destColId })
        }
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex h-[calc(100vh-280px)] gap-8 overflow-x-auto pb-8 pr-2 custom-scrollbar min-w-[1100px]">
                <AreaColumn
                    id="Green"
                    title="STABLE / OPERATIONAL"
                    count={columns.Green.length}
                    areas={columns.Green}
                    onAreaClick={onAreaClick}
                    accentColor="text-emerald-500"
                    glowColor="from-emerald-500/20"
                    projects={projects}
                    tasks={tasks}
                />
                <AreaColumn
                    id="Amber"
                    title="AT RISK / MONITORING"
                    count={columns.Amber.length}
                    areas={columns.Amber}
                    onAreaClick={onAreaClick}
                    accentColor="text-amber-500"
                    glowColor="from-amber-500/20"
                    projects={projects}
                    tasks={tasks}
                />
                <AreaColumn
                    id="Red"
                    title="CRITICAL / ATTENTION"
                    count={columns.Red.length}
                    areas={columns.Red}
                    onAreaClick={onAreaClick}
                    accentColor="text-rose-500"
                    glowColor="from-rose-500/20"
                    projects={projects}
                    tasks={tasks}
                />
            </div>
        </DragDropContext>
    )
}

function AreaColumn({ id, title, count, areas, onAreaClick, accentColor, glowColor, projects, tasks }: any) {
    return (
        <div className="flex-1 min-w-[340px] max-w-[400px] flex flex-col h-full bg-[#050505]/30 border border-white/5 rounded-2xl p-6 relative group/col">
            <div className={`absolute inset-0 bg-gradient-to-b ${glowColor} to-transparent opacity-0 group-hover/col:opacity-5 transition-opacity pointer-events-none rounded-2xl`} />
            
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", accentColor.replace('text', 'bg'))} />
                    <h3 className={cn("text-[10px] font-black tracking-[0.25em] uppercase", accentColor)}>{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/20">POPULATION</span>
                    <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-white/60 border border-white/10">{count}</span>
                </div>
            </div>

            <StrictModeDroppable droppableId={id}>
                {(provided, snapshot) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={cn(
                            "flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar transition-all duration-300",
                            snapshot.isDraggingOver ? 'bg-white/[0.01]' : ''
                        )}
                    >
                        {areas.map((area: AreaEntry, index: number) => (
                            <AreaCard 
                                key={area.id} 
                                area={area} 
                                index={index} 
                                onClick={onAreaClick} 
                                projects={projects} 
                                tasks={tasks}
                            />
                        ))}
                        {provided.placeholder}

                        {areas.length === 0 && (
                            <div className="h-40 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 text-white/10 group-hover:border-white/10 transition-colors">
                                <Boxes className="w-8 h-8 opacity-20" />
                                <span className="text-[10px] uppercase tracking-widest font-mono">NEURAL_VACUUM_DETECTED</span>
                            </div>
                        )}
                    </div>
                )}
            </StrictModeDroppable>
        </div>
    )
}

function AreaCard({ area, index, onClick, projects, tasks }: any) {
    const areaProjects = useMemo(() => projects.filter((p: any) => p.data.Area === area.id), [area.id, projects])
    const areaTasks = useMemo(() => tasks.filter((t: any) => t.data.Area === area.id), [area.id, tasks])
    const activeTasks = areaTasks.filter((t: any) => t.data.Status === 'active' || t.data.Status === 'working on')
    const doneTasks = areaTasks.filter((t: any) => t.data.Status === 'Done' || t.data.Status === 'completed' || t.data.done)
    const progress = areaTasks.length > 0 ? (doneTasks.length / areaTasks.length) * 100 : 0
    
    return (
        <Draggable draggableId={area.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onClick(area.id)}
                    className={cn(
                        "group/card relative bg-[#0A0A0A] border rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer",
                        "hover:bg-[#0E0E0E] hover:border-white/20 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]",
                        snapshot.isDragging ? "shadow-2xl border-white/30 scale-[1.05] z-50 bg-[#111111]" : "border-white/5"
                    )}
                >
                    {/* Status accent */}
                    <div className={cn(
                        "absolute top-0 left-0 w-1 h-full opacity-60",
                        area.data.ragStatus === 'Red' ? 'bg-rose-500' :
                        area.data.ragStatus === 'Amber' ? 'bg-amber-500' : 'bg-emerald-500'
                    )} />

                    <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/10 group-hover/card:border-white/20 group-hover/card:bg-white/10 transition-all shadow-inner">
                                    {area.data.icon || '🪐'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight group-hover/card:text-amber-500 transition-colors mb-0.5">
                                        {area.data.title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white/40 uppercase tracking-tighter">Domain Node</span>
                                        {activeTasks.length > 0 && (
                                            <span className="flex items-center gap-1 text-[8px] text-amber-500 font-mono italic animate-pulse">
                                                <Zap className="w-2 h-2" /> PROCESSING...
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="p-1.5 rounded-lg bg-white/5 opacity-0 group-hover/card:opacity-100 transition-all hover:bg-white/10">
                                <ArrowUpRight className="w-4 h-4 text-white/40" />
                            </div>
                        </div>

                        {area.data.goal && (
                            <p className="text-[11px] text-white/30 line-clamp-2 italic mb-4 leading-relaxed px-1 text-left">
                                "{area.data.goal}"
                            </p>
                        )}

                        {/* Neural Progress Bar */}
                        <div className="space-y-1.5 mb-6 px-1">
                            <div className="flex justify-between items-end">
                                <span className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-bold">Signal Synchronicity</span>
                                <span className="text-[10px] font-mono text-white/40">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000",
                                        area.data.ragStatus === 'Red' ? 'bg-rose-500' :
                                        area.data.ragStatus === 'Amber' ? 'bg-amber-500' : 'bg-emerald-500'
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                            <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 flex flex-col items-center justify-center group-hover/card:bg-white/[0.04] transition-all">
                                <Layout className="w-3 h-3 text-blue-500 mb-2" />
                                <span className="text-lg font-bebas text-white leading-none">{areaProjects.length}</span>
                                <span className="text-[8px] text-white/20 uppercase tracking-widest mt-1">Projects</span>
                            </div>
                            <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 flex flex-col items-center justify-center group-hover/card:bg-white/[0.04] transition-all">
                                <Zap className="w-3 h-3 text-amber-500 mb-2" />
                                <span className="text-lg font-bebas text-white leading-none">{areaTasks.length}</span>
                                <span className="text-[8px] text-white/20 uppercase tracking-widest mt-1">Signals</span>
                            </div>
                        </div>
                    </div>

                    {/* Animated scanning line for processing areas */}
                    {activeTasks.length > 0 && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
                            <motion.div 
                                animate={{ y: ['0%', '200%'] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                className="w-full h-1/2 bg-gradient-to-b from-transparent via-amber-500 to-transparent"
                            />
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    )
}
