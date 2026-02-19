'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { NeuralCalendar } from '@/components/second-brain/matrix/neural-calendar'
import { TaskMatrix } from '@/components/second-brain/matrix/task-matrix'
import { Navigation } from '@/components/navigation'
import { dataStore, Entry } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'

export default function TasksMatrixPage() {
    const [tasks, setTasks] = useState<Entry[]>([])
    const [projects, setProjects] = useState<Entry[]>([])
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
    const [userId, setUserId] = useState<string>('defaultUser')

    useEffect(() => {
        createClient().auth.getUser().then(({ data: { user } }) => {
            const currentUserId = user?.id || 'defaultUser'
            setUserId(currentUserId)
            loadData(currentUserId)
        })
    }, [])

    const loadData = async (uid: string) => {
        const [t1, p] = await Promise.all([
            dataStore.getEntries('tasks-sb', uid),
            dataStore.getEntries('projects-sb', uid)
        ])

        const headers = [...t1]

        // Normalize task data structure
        const allTasks = headers.map(task => {
            // Normalize task data structure
            // If it has 'title' but not 'Title' (Project Architect format)
            if (!task.data.Title && (task.data.title || task.data.ProjectName)) {
                return {
                    ...task,
                    data: {
                        ...task.data,
                        Title: task.data.Title || task.data.title || task.data.ProjectName,
                        Task: task.data.Title || task.data.title || task.data.ProjectName, // For NeuralCalendar
                        Status: task.data.Status || task.data.status || 'backlog',
                        Priority: task.data.Priority || task.data.priority || 'Medium',
                        DueDate: task.data.DueDate || task.data.deadline || task.data.date,
                        'Start Date': task.data['Start Date'] || task.data.startDate || task.data.date
                    }
                }
            }
            // Ensure 'Task' field exists for calendar if 'Title' exists
            if (task.data.Title && !task.data.Task) {
                return {
                    ...task,
                    data: {
                        ...task.data,
                        Task: task.data.Title
                    }
                }
            }
            return task
        })

        // Sort by creation date descending
        allTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        setTasks(allTasks)
        setProjects(p)
    }

    const handleUpdateTask = async (task: Entry, updates: Partial<Entry['data']>) => {
        // Optimistic update
        const updatedTask = { ...task, data: { ...task.data, ...updates } }
        setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t))

        // Persist
        await dataStore.updateEntry(task.id, updates)
    }

    const handleDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result
        if (!destination) return

        if (source.droppableId === destination.droppableId && source.index === destination.index) return

        // Determine new status based on destination column ID
        // 'inbox' is the sidebar ID
        // 'backlog', 'processing', 'deployment' are matrix IDs

        let newStatus: any = 'backlog'
        if (destination.droppableId === 'processing') newStatus = 'active'
        if (destination.droppableId === 'deployment') newStatus = true
        if (destination.droppableId === 'inbox') newStatus = null // or remove status

        const task = tasks.find(t => t.id === draggableId)
        if (task) {
            handleUpdateTask(task, { Status: newStatus })
        }
    }


    // Filter tasks based on selected project
    const filteredTasks = selectedProjectId
        ? tasks.filter(t => t.data.Project === selectedProjectId || t.data.projectId === selectedProjectId)
        : tasks

    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans overflow-hidden flex flex-col">
            <Navigation />

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex-1 flex pt-20 h-screen overflow-hidden">
                    {/* Left Sidebar: Neural Calendar (Inbox) */}
                    <NeuralCalendar tasks={filteredTasks} />

                    {/* Main Content: Logical Task Matrix */}
                    <main className="flex-1 relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#050505] to-[#050505]">
                        {/* Background Grid Accent */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none" />

                        <TaskMatrix
                            tasks={filteredTasks}
                            onUpdateTask={handleUpdateTask}
                            projects={projects}
                            selectedProjectId={selectedProjectId}
                            onSelectProject={setSelectedProjectId}
                        />
                    </main>
                </div>
            </DragDropContext>
        </div>
    )
}
