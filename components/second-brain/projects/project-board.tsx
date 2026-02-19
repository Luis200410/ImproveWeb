'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion' // Using framer-motion for basic animations, dnd-kit for drag/drop
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { MoreVertical, Plus } from 'lucide-react'
import { ProjectEntry, ProjectData } from './project-utils'
import { ProjectCard } from './project-card'
import { Entry } from '@/lib/data-store'

interface ProjectBoardProps {
    projects: ProjectEntry[]
    onUpdateProject: (project: ProjectEntry, updates: Partial<ProjectData>) => void
    onProjectClick: (id: string) => void
    tasks?: Entry[]
}

export function ProjectBoard({ projects, onUpdateProject, onProjectClick, tasks = [] }: {
    projects: ProjectEntry[],
    onUpdateProject: (project: ProjectEntry, updates: Partial<ProjectData>) => void,
    onProjectClick: (id: string) => void,
    tasks?: Entry[]
}) {

    // Internal state for optimistic updates
    const [columns, setColumns] = useState<{ [key: string]: ProjectEntry[] }>({
        backlog: [],
        active: [],
        completed: []
    })

    useEffect(() => {
        // Group by status
        // Default to 'backlog' if status is missing or unknown
        const backlog = projects.filter(p => !p.data.status || p.data.status === 'backlog')
        const active = projects.filter(p => p.data.status === 'active')
        const completed = projects.filter(p => p.data.status === 'completed')

        setColumns({ backlog, active, completed })
    }, [projects])

    const handleDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result
        if (!destination) return

        if (source.droppableId === destination.droppableId && source.index === destination.index) return

        const sourceColId = source.droppableId as keyof typeof columns
        const destColId = destination.droppableId as keyof typeof columns

        const sourceList = [...columns[sourceColId]]
        const destList = sourceColId === destColId ? sourceList : [...columns[destColId]]

        const [movedProject] = sourceList.splice(source.index, 1)

        // Optimistic Update
        if (sourceColId === destColId) {
            sourceList.splice(destination.index, 0, movedProject)
            setColumns({ ...columns, [sourceColId]: sourceList })
        } else {
            destList.splice(destination.index, 0, movedProject)
            setColumns({
                ...columns,
                [sourceColId]: sourceList,
                [destColId]: destList
            })
            // Update Data Store
            onUpdateProject(movedProject, { status: destColId as 'backlog' | 'active' | 'completed' })
        }
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex h-full gap-6 overflow-x-auto pb-4">
                <BoardColumn
                    id="backlog"
                    title="/BACKLOG"
                    count={columns.backlog.length}
                    projects={columns.backlog}
                    onProjectClick={onProjectClick}
                    accentColor="text-white/50"
                    tasks={tasks}
                />
                <BoardColumn
                    id="active"
                    title="/ACTIVE"
                    count={columns.active.length}
                    projects={columns.active}
                    onProjectClick={onProjectClick}
                    accentColor="text-amber-500"
                    tasks={tasks}
                />
                <BoardColumn
                    id="completed"
                    title="/COMPLETED"
                    count={columns.completed.length}
                    projects={columns.completed}
                    onProjectClick={onProjectClick}
                    accentColor="text-emerald-500"
                    tasks={tasks}
                />
            </div>
        </DragDropContext>
    )
}

function BoardColumn({ id, title, count, projects, onProjectClick, accentColor, tasks }: {
    id: string,
    title: string,
    count: number,
    projects: ProjectEntry[],
    onProjectClick: (id: string) => void,
    accentColor: string,
    tasks: Entry[] // Added tasks prop
}) {
    return (
        <div className="flex-1 min-w-[320px] flex flex-col h-full bg-[#050505]/50 border-r border-white/5 last:border-r-0 pr-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <h3 className={`text-xs font-bold tracking-[0.2em] ${accentColor}`}>{title}</h3>
                    <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-white/50">{count}</span>
                </div>
                <button className="text-white/20 hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <Droppable droppableId={id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-white/[0.02]' : ''}`}
                    >
                        {projects.map((project, index) => (
                            <Draggable key={project.id} draggableId={project.id} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{ ...provided.draggableProps.style }}
                                        className={`${snapshot.isDragging ? 'opacity-90 scale-[1.02] z-50' : ''}`}
                                    >
                                        <ProjectCard
                                            project={project}
                                            onClick={() => onProjectClick(project.id)}
                                            linkedTasks={tasks ? tasks.filter(t => t.data.Project === project.id) : []}
                                        />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}

                        {projects.length === 0 && (
                            <div className="h-32 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-white/20 text-xs font-mono uppercase tracking-widest">
                                [Status Empty]
                            </div>
                        )}
                    </div>
                )}
            </Droppable>
        </div>
    )
}
