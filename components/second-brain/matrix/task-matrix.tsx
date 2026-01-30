'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MoreVertical } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Entry } from '@/lib/data-store'
import { MatrixCard } from './matrix-card'

interface TaskMatrixProps {
    tasks: Entry[]
    onUpdateTask: (task: Entry, updates: Partial<Entry['data']>) => void
}

export function TaskMatrix({ tasks, onUpdateTask }: TaskMatrixProps) {
    // Local state for immediate UI updates while parent persists
    // We group tasks into columns
    const [columns, setColumns] = useState<{ [key: string]: Entry[] }>({
        backlog: [],
        processing: [],
        deployment: []
    })

    useEffect(() => {
        // Hydrate columns from props with robust status mapping
        const backlog = tasks.filter(t => {
            const s = t.data.Status
            // Exclude empty/false status (Inbox)
            return s === 'backlog' || s === 'Someday' || s === 'Next' || s === 'Todo'
        })
        const processing = tasks.filter(t => {
            const s = t.data.Status
            return s === 'active' || s === 'wait' || s === 'Waiting' || s === 'In Progress'
        })
        const deployment = tasks.filter(t => {
            const s = t.data.Status
            return s === true || s === 'Done' || s === 'Completed'
        })

        setColumns({
            backlog,
            processing,
            deployment
        })
    }, [tasks])

    const handleDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result
        if (!destination) return

        // If dropped in same column and same index, do nothing
        if (source.droppableId === destination.droppableId && source.index === destination.index) return

        // Find the task
        const sourceColId = source.droppableId
        const destColId = destination.droppableId
        const sourceList = [...columns[sourceColId]]
        const destList = sourceColId === destColId ? sourceList : [...columns[destColId]]

        const [movedTask] = sourceList.splice(source.index, 1)

        // Optimistic UI update
        if (sourceColId === destColId) {
            sourceList.splice(destination.index, 0, movedTask)
            setColumns({ ...columns, [sourceColId]: sourceList })
        } else {
            destList.splice(destination.index, 0, movedTask)
            setColumns({
                ...columns,
                [sourceColId]: sourceList,
                [destColId]: destList
            })

            // Determine new status based on column
            let newStatus: any = 'backlog'
            if (destColId === 'processing') newStatus = 'active'
            if (destColId === 'deployment') newStatus = true

            onUpdateTask(movedTask, { Status: newStatus })
        }
    }

    const handleAction = (task: Entry, action: 'done' | 'wait' | 'exec') => {
        // Buttons just map to status updates which will trigger re-render
        if (action === 'done') onUpdateTask(task, { Status: true })
        if (action === 'exec') onUpdateTask(task, { Status: 'active' })
        if (action === 'wait') onUpdateTask(task, { Status: 'wait' })
    }

    return (
        <div className="flex-1 h-full p-8 overflow-x-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-1 h-6 bg-amber-500" />
                <h1 className="text-sm font-bold tracking-[0.3em] text-white">LOGICAL TASK MATRIX</h1>
            </div>

            {/* DragDropContext is now provided by the parent page */}
            <div className="flex h-full gap-6 min-w-[1000px]">
                <MatrixColumn
                    id="backlog"
                    title="/BACKLOG"
                    subtitle={`QUEUE_DEPTH: ${columns.backlog.length < 10 ? '0' + columns.backlog.length : columns.backlog.length}`}
                    tasks={columns.backlog}
                    onAction={handleAction}
                    accentColor="text-white/50"
                />

                <MatrixColumn
                    id="processing"
                    title="/PROCESSING"
                    subtitle={`ACTIVE_FLOW: ${columns.processing.length < 10 ? '0' + columns.processing.length : columns.processing.length}`}
                    tasks={columns.processing}
                    onAction={handleAction}
                    accentColor="text-blue-500"
                />

                <MatrixColumn
                    id="deployment"
                    title="/DEPLOYMENT"
                    subtitle={`SYNC_STATUS: ${columns.deployment.length < 10 ? '0' + columns.deployment.length : columns.deployment.length}`}
                    tasks={columns.deployment}
                    onAction={handleAction}
                    accentColor="text-emerald-500"
                />
            </div>
        </div>
    )
}

function MatrixColumn({ id, title, subtitle, tasks, onAction, accentColor }: {
    id: string,
    title: string,
    subtitle: string,
    tasks: Entry[],
    onAction: (task: Entry, action: 'done' | 'wait' | 'exec') => void,
    accentColor: string
}) {
    return (
        <div className="flex-1 flex flex-col h-full bg-[#050505]/50 border-r border-white/5 last:border-r-0 pr-6">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/5">
                <div>
                    <h3 className={`text-xs font-bold tracking-widest mb-1 ${accentColor}`}>{title}</h3>
                    <span className="text-[9px] font-mono text-white/30">{subtitle}</span>
                </div>
                <MoreVertical className="w-4 h-4 text-white/20 cursor-pointer hover:text-white" />
            </div>

            <Droppable droppableId={id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-white/[0.02]' : ''}`}
                    >
                        {tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{ ...provided.draggableProps.style }}
                                        className={`${snapshot.isDragging ? 'opacity-90 scale-[1.02] z-50' : ''}`}
                                    >
                                        <MatrixCard task={task} onAction={(a) => onAction(task, a)} />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}

                        {tasks.length === 0 && (
                            <div className="h-24 w-full border border-dashed border-white/10 rounded-xl flex items-center justify-center text-white/20 text-xs font-mono">
                                [EMPTY_BUFFER]
                            </div>
                        )}
                    </div>
                )}
            </Droppable>
        </div>
    )
}
