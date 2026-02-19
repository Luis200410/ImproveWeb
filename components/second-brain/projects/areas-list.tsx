'use client'

import React from 'react'
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
                                                px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all whitespace-nowrap flex items-center gap-2 group
                                                ${selectedAreaId === area.id
                                                        ? 'bg-white text-black'
                                                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                                                    }
                                                ${snapshot.isDragging ? 'opacity-80 scale-105 shadow-lg z-50 ring-2 ring-amber-500' : ''}
                                            `}
                                            >
                                                {/* Visual Grip Handle (Only visible on hover or drag) */}
                                                <div className={`w-1 h-3 flex flex-col justify-between opacity-0 group-hover:opacity-30 ${snapshot.isDragging ? 'opacity-50' : ''}`}>
                                                    <div className="w-0.5 h-0.5 rounded-full bg-current" />
                                                    <div className="w-0.5 h-0.5 rounded-full bg-current" />
                                                    <div className="w-0.5 h-0.5 rounded-full bg-current" />
                                                </div>
                                                {area.data.title?.toUpperCase() || 'UNKNOWN'}
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
                <div className="pl-2 border-l border-white/10 ml-2">
                    <button
                        onClick={() => onSelectArea('unassigned')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all ${selectedAreaId === 'unassigned'
                            ? 'bg-white text-black'
                            : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        UNASSIGNED
                    </button>
                </div>
            </div>
        </DragDropContext>
    )
}
