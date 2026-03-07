'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MoreVertical } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Entry } from '@/lib/data-store'
import { MatrixCard } from './matrix-card'
import { ProjectFilterDropdown } from './project-filter-dropdown'
import { StrictModeDroppable } from '@/components/strict-mode-droppable'

interface TaskMatrixProps {
    tasks: Entry[]
    onUpdateTask: (task: Entry, updates: Partial<Entry['data']>) => void
    projects: Entry[]
    selectedProjectId: string | null
    onSelectProject: (id: string | null) => void
    highlightTaskId?: string
}

export function TaskMatrix({ tasks, onUpdateTask, projects, selectedProjectId, onSelectProject, highlightTaskId }: TaskMatrixProps) {
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
            if (selectedProjectId) {
                const p = t.data.Project
                const pId = typeof p === 'object' ? p?.id : p
                if (pId !== selectedProjectId) return false
            }
            const s = String(t.data.Status).toLowerCase()
            // Only explicitly backlogged tasks go here. Null/undefined go to inbox.
            return s === 'backlog' || s === 'someday' || s === 'next' || s === 'todo' || s === 'to do' || s === 'pending' || s === 'due'
        })
        const processing = tasks.filter(t => {
            if (selectedProjectId) {
                const p = t.data.Project
                const pId = typeof p === 'object' ? p?.id : p
                if (pId !== selectedProjectId) return false
            }
            const s = String(t.data.Status).toLowerCase()
            return s === 'active' || s === 'wait' || s === 'waiting' || s === 'in progress' || s === 'working on'
        })
        const deployment = tasks.filter(t => {
            if (selectedProjectId) {
                const p = t.data.Project
                const pId = typeof p === 'object' ? p?.id : p
                if (pId !== selectedProjectId) return false
            }
            const s = String(t.data.Status).toLowerCase()
            return t.data.Status === true || s === 'true' || s === 'done' || s === 'completed'
        })

        setColumns({
            backlog,
            processing,
            deployment
        })
    }, [tasks, selectedProjectId])

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
            <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-1 h-6 bg-amber-500" />
                    <h1 className="text-sm font-bold tracking-[0.3em] text-white">LOGICAL TASK MATRIX</h1>
                </div>



                <div className="h-4 w-[1px] bg-white/10" />

                {/* Project Filter */}
                <ProjectFilterDropdown
                    projects={projects}
                    selectedProjectId={selectedProjectId}
                    onSelectProject={onSelectProject}
                />
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
                    highlightTaskId={highlightTaskId}
                />

                <MatrixColumn
                    id="processing"
                    title="/PROCESSING"
                    subtitle={`ACTIVE_FLOW: ${columns.processing.length < 10 ? '0' + columns.processing.length : columns.processing.length}`}
                    tasks={columns.processing}
                    onAction={handleAction}
                    accentColor="text-blue-500"
                    highlightTaskId={highlightTaskId}
                />

                <MatrixColumn
                    id="deployment"
                    title="/DEPLOYMENT"
                    subtitle={`SYNC_STATUS: ${columns.deployment.length < 10 ? '0' + columns.deployment.length : columns.deployment.length}`}
                    tasks={columns.deployment}
                    onAction={handleAction}
                    accentColor="text-emerald-500"
                    highlightTaskId={highlightTaskId}
                />
            </div>
        </div>
    )
}

function MatrixColumn({ id, title, subtitle, tasks, onAction, accentColor, highlightTaskId }: {
    id: string,
    title: string,
    subtitle: string,
    tasks: Entry[],
    onAction: (task: Entry, action: 'done' | 'wait' | 'exec') => void,
    accentColor: string,
    highlightTaskId?: string
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

            <StrictModeDroppable droppableId={id}>
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
                                        ref={el => {
                                            provided.innerRef(el)
                                            // Scroll highlighted task into view
                                            if (el && task.id === highlightTaskId) {
                                                setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)
                                            }
                                        }}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{ ...provided.draggableProps.style }}
                                        className={`${snapshot.isDragging ? 'opacity-90 scale-[1.02] z-50' : ''} ${task.id === highlightTaskId
                                            ? 'ring-2 ring-amber-400/70 ring-offset-2 ring-offset-transparent rounded-xl'
                                            : ''
                                            }`}
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
            </StrictModeDroppable>
        </div>
    )
}
