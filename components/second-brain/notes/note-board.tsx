'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, Database } from 'lucide-react'
import { Entry } from '@/lib/data-store'
import { NoteCard } from './note-card'
import { StrictModeDroppable } from '@/components/strict-mode-droppable'

interface NoteBoardProps {
    notes: Entry[]
    tasks: Entry[]
    onNoteMoved: (note: Entry, targetTaskId: string) => void
    onNoteClick: (id: string) => void
    onCreateNote: (taskId?: string) => void
    projectMap: Record<string, string>
    areaMap: Record<string, string>
    taskMap: Record<string, string>
}

export function NoteBoard({ notes, tasks, onNoteMoved, onNoteClick, onCreateNote, projectMap, areaMap, taskMap }: NoteBoardProps) {
    const [columns, setColumns] = useState<Record<string, Entry[]>>({})
    const [unassignedNotes, setUnassignedNotes] = useState<Entry[]>([])

    useEffect(() => {
        // Group notes by Task ID
        const cols: Record<string, Entry[]> = {}
        const unassigned: Entry[] = []

        // Initialize columns for each task
        tasks.forEach(task => {
            cols[task.id] = []
        })

        // Distribute notes
        notes.forEach(note => {
            const taskId = note.data.Task || note.data.taskId
            if (taskId && cols[taskId]) {
                cols[taskId].push(note)
            } else {
                unassigned.push(note)
            }
        })

        setColumns(cols)
        setUnassignedNotes(unassigned)
    }, [notes, tasks])

    const handleDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result
        if (!destination) return

        if (source.droppableId === destination.droppableId && source.index === destination.index) return

        const sourceId = source.droppableId
        const destId = destination.droppableId

        // Helper to get list by ID (handles 'unassigned' special case)
        const getList = (id: string) => id === 'unassigned' ? unassignedNotes : columns[id]

        const sourceList = [...getList(sourceId)]
        const destList = sourceId === destId ? sourceList : [...getList(destId)]

        const [movedNote] = sourceList.splice(source.index, 1)

        // Optimistic Update
        if (sourceId === destId) {
            sourceList.splice(destination.index, 0, movedNote)
            if (sourceId === 'unassigned') {
                setUnassignedNotes(sourceList)
            } else {
                setColumns({ ...columns, [sourceId]: sourceList })
            }
        } else {
            destList.splice(destination.index, 0, movedNote)

            const newColumns = { ...columns }
            if (sourceId !== 'unassigned') newColumns[sourceId] = sourceList
            if (destId !== 'unassigned') newColumns[destId] = destList

            setColumns(newColumns)
            if (sourceId === 'unassigned') setUnassignedNotes(sourceList)
            if (destId === 'unassigned') setUnassignedNotes(destList)

            // Trigger actual update
            // If destId is 'unassigned', we clear the task. Otherwise set it.
            const targetTaskId = destId === 'unassigned' ? '' : destId
            onNoteMoved(movedNote, targetTaskId)
        }
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex h-full gap-6 overflow-x-auto pb-4 custom-scrollbar">
                {/* Unassigned Column */}
                <BoardColumn
                    id="unassigned"
                    title="/UNASSIGNED"
                    count={unassignedNotes.length}
                    notes={unassignedNotes}
                    onNoteClick={onNoteClick}
                    onCreateNote={() => onCreateNote()}
                    accentColor="text-white/30"
                    projectMap={projectMap}
                    areaMap={areaMap}
                    taskMap={taskMap}
                    isTask={false}
                />

                {/* Task Columns */}
                {tasks.map(task => (
                    <BoardColumn
                        key={task.id}
                        id={task.id}
                        title={`/TASK: ${task.data.Task}`}
                        count={columns[task.id]?.length || 0}
                        notes={columns[task.id] || []}
                        onNoteClick={onNoteClick}
                        onCreateNote={() => onCreateNote(task.id)}
                        accentColor="text-emerald-500"
                        projectMap={projectMap}
                        areaMap={areaMap}
                        taskMap={taskMap}
                        isTask={true}
                    />
                ))}
            </div>
        </DragDropContext>
    )
}

function BoardColumn({ id, title, count, notes, onNoteClick, onCreateNote, accentColor, projectMap, areaMap, taskMap, isTask }: {
    id: string,
    title: string,
    count: number,
    notes: Entry[],
    onNoteClick: (id: string) => void,
    onCreateNote: () => void,
    accentColor: string,
    projectMap: Record<string, string>,
    areaMap: Record<string, string>,
    taskMap: Record<string, string>,
    isTask: boolean
}) {
    return (
        <div className="flex-1 min-w-[320px] max-w-[320px] flex flex-col h-full bg-[#050505]/50 border-r border-white/5 last:border-r-0 pr-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5 group">
                <div className="flex items-center gap-3 overflow-hidden">
                    {isTask && <Database className="w-4 h-4 text-emerald-500 shrink-0" />}
                    <h3 className={`text-xs font-bold tracking-[0.1em] truncate ${accentColor}`} title={title}>{title}</h3>
                    <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-white/50 shrink-0">{count}</span>
                </div>
                <button
                    onClick={onCreateNote}
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
                        className={`flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-white/[0.02]' : ''}`}
                    >
                        {notes.map((note, index) => (
                            <Draggable key={note.id} draggableId={note.id} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{ ...provided.draggableProps.style }}
                                        className={`${snapshot.isDragging ? 'opacity-90 scale-[1.02] z-50' : ''}`}
                                    >
                                        <NoteCard
                                            note={note}
                                            isSelected={false}
                                            onClick={() => onNoteClick(note.id)}
                                            projectMap={projectMap}
                                            areaMap={areaMap}
                                            taskMap={taskMap}
                                        />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}

                        {notes.length === 0 && (
                            <div className="h-32 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-white/20 text-xs font-mono uppercase tracking-widest">
                                [Empty Sequence]
                            </div>
                        )}
                    </div>
                )}
            </StrictModeDroppable>
        </div>
    )
}
