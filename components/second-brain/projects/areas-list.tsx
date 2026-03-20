'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { StrictModeDroppable } from '@/components/strict-mode-droppable'
import { Entry } from '@/lib/data-store'

interface AreasListProps {
    areas: Entry[]
    selectedAreaId: string | null
    onSelectArea: (id: string | null) => void
    onReorderAreas: (newAreas: Entry[]) => void
}

export function AreasList({ areas, selectedAreaId, onSelectArea, onReorderAreas }: AreasListProps) {
    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return

        const items = Array.from(areas)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        onReorderAreas(items)
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                <StrictModeDroppable droppableId="areas-list" direction="horizontal">
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="flex items-center gap-2"
                        >
                            {areas.map((area, index) => (
                                <Draggable key={area.id} draggableId={area.id} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <button
                                                onClick={() => onSelectArea(area.id)}
                                                className={`
                                                    relative px-6 py-2.5 rounded-lg text-[10px] font-mono font-bold tracking-[0.2em] transition-all whitespace-nowrap flex items-center gap-3 group
                                                    ${selectedAreaId === area.id
                                                        ? 'text-white'
                                                        : 'text-white/30 hover:text-white/60'
                                                    }
                                                    ${snapshot.isDragging ? 'scale-105 z-50' : ''}
                                                `}
                                            >
                                                {/* Background Layer */}
                                                <div className={`
                                                    absolute inset-0 rounded-lg border transition-all duration-300
                                                    ${selectedAreaId === area.id
                                                        ? 'bg-white/[0.05] border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                                        : 'bg-white/[0.02] border-white/5 group-hover:border-white/10'
                                                    }
                                                `} />

                                                {/* Selection Indicator (Dot) */}
                                                {selectedAreaId === area.id && (
                                                    <motion.div 
                                                        layoutId="active-dot"
                                                        className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                                                    />
                                                )}

                                                <span className="relative z-10">{area.data.title?.toUpperCase() || 'UNKNOWN'}</span>

                                                {/* Visual Grip Handle (Only visible on hover or drag) */}
                                                <div className={`relative z-10 w-1 h-3 flex flex-col justify-between opacity-0 group-hover:opacity-30 ${snapshot.isDragging ? 'opacity-50' : ''}`}>
                                                    <div className="w-0.5 h-0.5 rounded-full bg-current" />
                                                    <div className="w-0.5 h-0.5 rounded-full bg-current" />
                                                    <div className="w-0.5 h-0.5 rounded-full bg-current" />
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </StrictModeDroppable>

                {/* Static Unassigned Button (Outside Droppable) */}
                <div className="pl-4 border-l border-white/10 ml-2">
                    <button
                        onClick={() => onSelectArea('unassigned')}
                        className={`
                            relative px-6 py-2.5 rounded-lg text-[10px] font-mono font-bold tracking-[0.2em] transition-all
                            ${selectedAreaId === 'unassigned'
                                ? 'text-white bg-white/[0.05] border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                : 'text-white/30 bg-white/[0.02] border border-white/5 hover:border-white/10 hover:text-white/60'
                            }`}
                    >
                        {selectedAreaId === 'unassigned' && (
                            <motion.div 
                                layoutId="active-dot"
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                            />
                        )}
                        <span className={selectedAreaId === 'unassigned' ? 'pl-2' : ''}>UNASSIGNED</span>
                    </button>
                </div>
            </div>
        </DragDropContext>
    )
}
