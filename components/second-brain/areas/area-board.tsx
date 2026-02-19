'use client'

import { Entry } from '@/lib/data-store'
import { AreaEntry, AREA_BG_COLORS } from './area-utils'
import { motion } from 'framer-motion'
import { Activity, GripVertical, MoreVertical } from 'lucide-react'
import { DragDropContext, Draggable, DropResult } from '@hello-pangea/dnd'
import { StrictModeDroppable } from '@/components/strict-mode-droppable'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function AreaBoard({ areas, onUpdateArea, onAreaClick, onReorder }: {
    areas: AreaEntry[],
    onUpdateArea: (area: AreaEntry, updates: any) => void,
    onAreaClick: (id: string) => void,
    onReorder?: (newOrder: AreaEntry[]) => void // Kept for compatibility, but we rely on onUpdateArea for drag
}) {
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
        const { source, destination, draggableId } = result
        if (!destination) return

        if (source.droppableId === destination.droppableId && source.index === destination.index) return

        const sourceColId = source.droppableId
        const destColId = destination.droppableId
        const sourceList = [...columns[sourceColId]]
        const destList = sourceColId === destColId ? sourceList : [...columns[destColId]]

        const [movedArea] = sourceList.splice(source.index, 1)

        // Optimistic UI Update
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

            // Update Status based on column
            // Helper to ensure type safety
            const newRagStatus = destColId as 'Green' | 'Amber' | 'Red'
            onUpdateArea(movedArea, { ragStatus: newRagStatus })
        }
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex h-full gap-6 overflow-x-auto pb-4 custom-scrollbar min-w-[1000px]">
                <AreaColumn
                    id="Green"
                    title="STABLE / OPERATIONAL"
                    count={columns.Green.length}
                    areas={columns.Green}
                    onAreaClick={onAreaClick}
                    accentColor="text-emerald-500"
                    bgColor="bg-emerald-500/5 hover:bg-emerald-500/10"
                />
                <AreaColumn
                    id="Amber"
                    title="AT RISK / MONITORING"
                    count={columns.Amber.length}
                    areas={columns.Amber}
                    onAreaClick={onAreaClick}
                    accentColor="text-amber-500"
                    bgColor="bg-amber-500/5 hover:bg-amber-500/10"
                />
                <AreaColumn
                    id="Red"
                    title="CRITICAL / ATTENTION"
                    count={columns.Red.length}
                    areas={columns.Red}
                    onAreaClick={onAreaClick}
                    accentColor="text-rose-500"
                    bgColor="bg-rose-500/5 hover:bg-rose-500/10"
                />
            </div>
        </DragDropContext>
    )
}

function AreaColumn({ id, title, count, areas, onAreaClick, accentColor, bgColor }: {
    id: string,
    title: string,
    count: number,
    areas: AreaEntry[],
    onAreaClick: (id: string) => void,
    accentColor: string,
    bgColor: string
}) {
    return (
        <div className="flex-1 min-w-[320px] max-w-[380px] flex flex-col h-full bg-[#050505]/50 border-r border-white/5 last:border-r-0 pr-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5 group">
                <div className="flex items-center gap-3 overflow-hidden">
                    <Activity className={`w-4 h-4 ${accentColor} shrink-0`} />
                    <h3 className={`text-xs font-bold tracking-[0.1em] truncate ${accentColor}`}>{title}</h3>
                    <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-white/50 shrink-0">{count}</span>
                </div>
            </div>

            <StrictModeDroppable droppableId={id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                            "flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar rounded-xl transition-colors",
                            snapshot.isDraggingOver ? 'bg-white/[0.02]' : ''
                        )}
                    >
                        {areas.map((area, index) => (
                            <Draggable key={area.id} draggableId={area.id} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{ ...provided.draggableProps.style }}
                                        className={cn(
                                            "group relative bg-[#0A0A0A] border rounded-xl overflow-hidden transition-all cursor-pointer flex flex-col",
                                            "hover:border-white/20",
                                            snapshot.isDragging ? "opacity-90 scale-[1.02] z-50 shadow-2xl border-white/30" : "border-white/5"
                                        )}
                                        onClick={() => onAreaClick(area.id)}
                                    >
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lg border border-white/5">
                                                    {area.data.icon || '🪐'}
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <GripVertical className="w-4 h-4 text-white/20" />
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors line-clamp-1">
                                                {area.data.title}
                                            </h3>
                                            {area.data.goal && (
                                                <p className="text-xs text-white/40 line-clamp-2 italic">"{area.data.goal}"</p>
                                            )}
                                        </div>

                                        {/* Status Indicator Bar */}
                                        <div className={cn("h-1 w-full",
                                            area.data.ragStatus === 'Red' ? 'bg-rose-500' :
                                                area.data.ragStatus === 'Amber' ? 'bg-amber-500' : 'bg-emerald-500'
                                        )} />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}

                        {areas.length === 0 && (
                            <div className="h-32 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-white/20 text-xs font-mono uppercase tracking-widest">
                                [Empty Zone]
                            </div>
                        )}
                    </div>
                )}
            </StrictModeDroppable>
        </div>
    )
}
