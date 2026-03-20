'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MoreVertical, Rocket, Activity, CheckCircle2 } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Entry } from '@/lib/data-store'
import { MatrixCard } from './matrix-card'
import { ProjectFilterDropdown } from './project-filter-dropdown'
import { StrictModeDroppable } from '@/components/strict-mode-droppable'

interface TaskMatrixProps {
    tasks: Entry[]
    onUpdateTask: (task: Entry, updates: Partial<Entry['data']>) => void
    onDeleteTask: (taskId: string) => void
    projects: Entry[]
    selectedProjectId: string | null
    onSelectProject: (id: string | null) => void
    highlightTaskId?: string
    searchQuery: string
    onSearchChange: (query: string) => void
}

export function TaskMatrix({ tasks, onUpdateTask, onDeleteTask, projects, selectedProjectId, onSelectProject, highlightTaskId, searchQuery, onSearchChange }: TaskMatrixProps) {
    // Local state for immediate UI updates while parent persists
    // We group tasks into columns
    const [columns, setColumns] = useState<{ [key: string]: Entry[] }>({
        inbox: [],
        active: [],
        done: []
    })

    useEffect(() => {
        // Apply search filter
        const filteredBySearch = tasks.filter(t => {
            const title = (t.data.Task || t.data.Title || t.data.ProjectName || '').toLowerCase()
            return title.includes(searchQuery.toLowerCase())
        })

        // Hydrate columns from props with robust status mapping
        const inbox = filteredBySearch.filter(t => {
            if (selectedProjectId) {
                const p = t.data.Project
                const pId = typeof p === 'object' ? p?.id : p
                if (pId !== selectedProjectId) return false
            }
            const s = String(t.data.Status || '').toLowerCase()
            return s === '' || s === 'inbox' || s === 'backlog' || s === 'someday' || s === 'next' || s === 'todo' || s === 'to do' || s === 'pending' || s === 'due' || s === 'null' || s === 'undefined'
        })
        const active = filteredBySearch.filter(t => {
            if (selectedProjectId) {
                const p = t.data.Project
                const pId = typeof p === 'object' ? p?.id : p
                if (pId !== selectedProjectId) return false
            }
            const s = String(t.data.Status).toLowerCase()
            return s === 'active' || s === 'wait' || s === 'waiting' || s === 'in progress' || s === 'working on'
        })
        const done = filteredBySearch.filter(t => {
            if (selectedProjectId) {
                const p = t.data.Project
                const pId = typeof p === 'object' ? p?.id : p
                if (pId !== selectedProjectId) return false
            }
            const s = String(t.data.Status).toLowerCase()
            return t.data.Status === true || s === 'true' || s === 'done' || s === 'completed' || s === 'deployment'
        })

        setColumns({
            inbox,
            active,
            done
        })
    }, [tasks, selectedProjectId, searchQuery])

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
            if (destColId === 'active') newStatus = 'active'
            if (destColId === 'done') newStatus = true
            if (destColId === 'inbox') newStatus = 'backlog'

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
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
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

                {/* Right Side: Search / Look up */}
                <div className="flex items-center gap-4">
                    <div className="relative group/search max-w-[200px]">
                        <input 
                            type="text" 
                            placeholder="LOOK_UP_TASK..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-mono text-white/70 focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-white/10 w-48"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 font-mono pointer-events-none group-focus-within/search:text-amber-500/50 transition-colors uppercase">
                            CMD_K
                        </div>
                    </div>
                </div>
            </div>

            {/* DragDropContext is now provided by the parent page */}
            <div className="flex h-full gap-6 min-w-[1000px]">
                <MatrixColumn
                    id="inbox"
                    title="/INBOX"
                    subtitle={`QUEUE_DEPTH: ${columns.inbox.length < 10 ? '0' + columns.inbox.length : columns.inbox.length}`}
                    tasks={columns.inbox}
                    onAction={handleAction}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                    accentColor="text-white/50"
                    highlightTaskId={highlightTaskId}
                />

                <MatrixColumn
                    id="active"
                    title="/ACTIVE"
                    subtitle={`ACTIVE_FLOW: ${columns.active.length < 10 ? '0' + columns.active.length : columns.active.length}`}
                    tasks={columns.active}
                    onAction={handleAction}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                    accentColor="text-blue-500"
                    highlightTaskId={highlightTaskId}
                />

                <MatrixColumn
                    id="done"
                    title="/DONE"
                    subtitle={`SYNC_STATUS: ${columns.done.length < 10 ? '0' + columns.done.length : columns.done.length}`}
                    tasks={columns.done}
                    onAction={handleAction}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                    accentColor="text-emerald-500"
                    highlightTaskId={highlightTaskId}
                />
            </div>
        </div>
    )
}

function MatrixColumn({ id, title, subtitle, tasks, onAction, onUpdate, onDelete, accentColor, highlightTaskId }: {
    id: string,
    title: string,
    subtitle: string,
    tasks: Entry[],
    onAction: (task: Entry, action: 'done' | 'wait' | 'exec') => void,
    onUpdate: (task: Entry, updates: Partial<Entry['data']>) => void,
    onDelete: (taskId: string) => void,
    accentColor: string,
    highlightTaskId?: string
}) {
    return (
        <div className="flex-1 flex flex-col h-full bg-[#050505]/50 border-r border-white/5 last:border-r-0 pr-6">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/5">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        {id === 'inbox' && <Rocket className="w-3 h-3 text-white/50" />}
                        {id === 'active' && <Activity className="w-3 h-3 text-blue-500" />}
                        {id === 'done' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        <h3 className={`text-xs font-bold tracking-widest ${accentColor}`}>{title}</h3>
                    </div>
                    <span className="text-[9px] font-mono text-white/30 truncate">{subtitle}</span>
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
                                        <MatrixCard 
                                            task={task} 
                                            onAction={(a) => onAction(task, a)} 
                                            onUpdate={(updates) => onUpdate(task, updates)}
                                            onDelete={() => onDelete(task.id)}
                                        />
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
