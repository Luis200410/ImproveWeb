'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, StickyNote } from 'lucide-react'
import { Entry } from '@/lib/data-store'
import { ResourceCard } from './resource-card'
import { StrictModeDroppable } from '@/components/strict-mode-droppable'

interface ResourceBoardProps {
    notes: Entry[]
    resources: Entry[]
    onResourceMoved: (resource: Entry, targetNoteId: string) => void
    onResourceClick: (id: string) => void
    onCreateResource: (noteId?: string) => void
}

export function ResourceBoard({ notes, resources, onResourceMoved, onResourceClick, onCreateResource }: ResourceBoardProps) {
    const [columns, setColumns] = useState<Record<string, Entry[]>>({})
    const [unassignedResources, setUnassignedResources] = useState<Entry[]>([])

    useEffect(() => {
        const cols: Record<string, Entry[]> = {}
        const unassigned: Entry[] = []

        // Init columns for each Note
        notes.forEach(note => {
            cols[note.id] = []
        })

        // Distribute resources
        resources.forEach(res => {
            const noteId = res.data.noteId
            if (noteId && cols[noteId]) {
                cols[noteId].push(res)
            } else {
                unassigned.push(res)
            }
        })

        setColumns(cols)
        setUnassignedResources(unassigned)
    }, [notes, resources])

    const handleDragEnd = (result: DropResult) => {
        const { source, destination } = result
        if (!destination) return

        if (source.droppableId === destination.droppableId && source.index === destination.index) return

        const sourceId = source.droppableId
        const destId = destination.droppableId

        const getList = (id: string) => id === 'unassigned' ? unassignedResources : columns[id]

        const sourceList = [...getList(sourceId)]
        const destList = sourceId === destId ? sourceList : [...getList(destId)]

        const [movedResource] = sourceList.splice(source.index, 1)

        // Optimistic Update
        if (sourceId === destId) {
            sourceList.splice(destination.index, 0, movedResource)
            if (sourceId === 'unassigned') setUnassignedResources(sourceList)
            else setColumns({ ...columns, [sourceId]: sourceList })
        } else {
            destList.splice(destination.index, 0, movedResource)
            const newColumns = { ...columns }
            if (sourceId !== 'unassigned') newColumns[sourceId] = sourceList
            if (destId !== 'unassigned') newColumns[destId] = destList

            setColumns(newColumns)
            if (sourceId === 'unassigned') setUnassignedResources(sourceList)
            if (destId === 'unassigned') setUnassignedResources(destList)

            const targetNoteId = destId === 'unassigned' ? '' : destId
            onResourceMoved(movedResource, targetNoteId)
        }
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex h-full gap-6 overflow-x-auto pb-4 custom-scrollbar">
                {/* Unassigned Column */}
                <BoardColumn
                    id="unassigned"
                    title="/UNASSIGNED"
                    count={unassignedResources.length}
                    resources={unassignedResources}
                    onResourceClick={onResourceClick}
                    onCreateResource={() => onCreateResource()}
                    accentColor="text-white/30"
                    isNote={false}
                />

                {/* Note Columns */}
                {notes.map(note => (
                    <BoardColumn
                        key={note.id}
                        id={note.id}
                        title={`/NOTE: ${note.data.Title}`}
                        count={columns[note.id]?.length || 0}
                        resources={columns[note.id] || []}
                        onResourceClick={onResourceClick}
                        onCreateResource={() => onCreateResource(note.id)}
                        accentColor="text-blue-500"
                        isNote={true}
                    />
                ))}
            </div>
        </DragDropContext>
    )
}

function BoardColumn({ id, title, count, resources, onResourceClick, onCreateResource, accentColor, isNote }: {
    id: string,
    title: string,
    count: number,
    resources: Entry[],
    onResourceClick: (id: string) => void,
    onCreateResource: () => void,
    accentColor: string,
    isNote: boolean
}) {
    return (
        <div className="flex-1 min-w-[320px] max-w-[320px] flex flex-col h-full bg-[#050505]/50 border-r border-white/5 last:border-r-0 pr-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5 group">
                <div className="flex items-center gap-3 overflow-hidden">
                    {isNote && <StickyNote className="w-4 h-4 text-blue-500 shrink-0" />}
                    <h3 className={`text-xs font-bold tracking-[0.1em] truncate ${accentColor}`} title={title}>{title}</h3>
                    <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-white/50 shrink-0">{count}</span>
                </div>
                <button
                    onClick={onCreateResource}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded text-white/50 hover:text-white"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <StrictModeDroppable droppableId={id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-white/[0.02]' : ''}`}
                    >
                        {resources.map((res, index) => (
                            <Draggable key={res.id} draggableId={res.id} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{ ...provided.draggableProps.style }}
                                        className={`${snapshot.isDragging ? 'opacity-90 scale-[1.02] z-50' : ''}`}
                                    >
                                        <ResourceCard
                                            resource={res}
                                            onClick={() => onResourceClick(res.id)}
                                        />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}

                        {resources.length === 0 && (
                            <div className="h-24 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-white/20 text-xs font-mono uppercase tracking-widest">
                                [Empty]
                            </div>
                        )}
                    </div>
                )}
            </StrictModeDroppable>
        </div>
    )
}
