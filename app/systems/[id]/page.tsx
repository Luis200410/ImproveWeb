'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { dataStore, System, Entry } from '@/lib/data-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { motion, Reorder, AnimatePresence } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { ArrowLeft, Sparkles, ArrowRight, Database, Eye, Layers } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { loadPrefs, savePrefs } from '@/utils/user-preferences'
import { TasksDashboard } from '@/components/tasks-dashboard'
import { ProjectsDashboard } from '@/components/projects-dashboard'
import { ForgeForm } from '@/components/forge-form'
import { useRealtimeSubscription } from '@/hooks/use-realtime-data'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function SystemPage() {
    const params = useParams()
    const systemId = params.id as string
    const [userId, setUserId] = useState<string>('defaultUser')
    const [entryCounts, setEntryCounts] = useState<Record<string, number>>({})
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [customizeOrder, setCustomizeOrder] = useState(false)

    const system = dataStore.getSystem(systemId)
    const allMicroapps = system?.microapps || []

    const [microappOrder, setMicroappOrder] = useState<string[]>(() => {
        return system ? system.microapps.map(m => m.id) : []
    })

    // TASK & PROJECT MANAGEMENT (SECOND BRAIN SPECIFIC)
    const [taskEntries, setTaskEntries] = useState<Entry[]>([])
    const [projectEntries, setProjectEntries] = useState<Entry[]>([])
    const [areaEntries, setAreaEntries] = useState<Entry[]>([])
    const [isForgeOpen, setIsForgeOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<Entry | null>(null)
    const [editingProject, setEditingProject] = useState<Entry | null>(null)
    const [targetMicroapp, setTargetMicroapp] = useState<string>('tasks-sb')

    const fetchTasks = useCallback(async () => {
        if (systemId === 'second-brain') {
            const tasks = await dataStore.getEntries('tasks-sb')
            setTaskEntries(tasks)

            const projects = await dataStore.getEntries('projects-sb')
            setProjectEntries(projects)

            const areas = await dataStore.getEntries('areas-sb')
            setAreaEntries(areas)
        }
    }, [systemId])

    // Fetch user and initial data
    useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setUserId(user.id)
            fetchTasks()
        }
        init()
    }, [fetchTasks])

    // Realtime Sync
    useRealtimeSubscription('entries', fetchTasks)

    const handleUpdateTask = async (entry: Entry, updates: Partial<any>) => {
        setTaskEntries(prev => prev.map(e => e.id === entry.id ? { ...e, data: { ...e.data, ...updates } } : e))
        await dataStore.updateEntry(entry.id, updates)
        fetchTasks()
    }

    const handleUpdateProject = async (projectId: string, updates: Partial<any>) => {
        setProjectEntries(prev => prev.map(p => p.id === projectId ? { ...p, data: { ...p.data, ...updates } } : p))
        await dataStore.updateEntry(projectId, updates)
        fetchTasks()
    }

    const handleEditTask = (entry: Entry) => {
        setEditingTask(entry)
        setTargetMicroapp('tasks-sb')
        setIsForgeOpen(true)
    }

    const handleEditProject = (entry: Entry) => {
        setEditingProject(entry)
        setTargetMicroapp('projects-sb')
        setIsForgeOpen(true)
    }

    const handleCreateProject = (status?: string) => {
        setEditingProject(null)
        setTargetMicroapp('projects-sb')
        // We could pass initial status if ForgeForm supported dynamic initial data better, 
        // for now just open fresh
        setIsForgeOpen(true)
    }

    const handleScheduleTask = async (entry: Entry, date: Date) => {
        const updates = { 'Start Date': date.toISOString(), 'Status': 'Due' }
        await handleUpdateTask(entry, updates)
        handleEditTask({ ...entry, data: { ...entry.data, ...updates } })
    }

    const handleSaveEntry = async (formData: Record<string, any>) => {
        if (targetMicroapp === 'tasks-sb') {
            if (editingTask) {
                await dataStore.updateEntry(editingTask.id, formData)
            } else {
                await dataStore.addEntry('tasks-sb', formData, userId)
            }
        } else if (targetMicroapp === 'projects-sb') {
            if (editingProject) {
                await dataStore.updateEntry(editingProject.id, formData)
            } else {
                await dataStore.addEntry('projects-sb', formData, userId)
            }
        }
        setIsForgeOpen(false)
        setEditingTask(null)
        setEditingProject(null)
        fetchTasks()
    }

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (!system) {
            setMicroappOrder([])
            setEntryCounts({})
            return
        }
        setMicroappOrder(prev => {
            const defaultOrder = system.microapps.map(m => m.id)
            const hasSameIds = prev.length === defaultOrder.length && prev.every(id => defaultOrder.includes(id))
            return hasSameIds ? prev : defaultOrder
        })
        const loadCounts = async () => {
            const counts: Record<string, number> = {}
            await Promise.all(system.microapps.map(async (microapp) => {
                const entries = await dataStore.getEntries(microapp.id)
                counts[microapp.id] = entries.length
            }))
            setEntryCounts(counts)
        }
        loadCounts()
    }, [system])
    /* eslint-enable react-hooks/set-state-in-effect */

    useEffect(() => {
        const loadUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            const uid = user?.id || 'defaultUser'
            setUserId(uid)
            const prefs = loadPrefs(uid, { systemView: { [systemId]: 'grid' }, systemOrder: {} as Record<string, string[]> })
            const mode = (prefs.systemView as Record<string, string>)[systemId]
            if (mode === 'list' || mode === 'grid') setViewMode(mode)
            const order = (prefs.systemOrder as Record<string, string[]>)[systemId]
            if (order && order.length) {
                setMicroappOrder(order)
            } else if (system) {
                setMicroappOrder(system.microapps.map(m => m.id))
            }
        }
        loadUser()
    }, [systemId, system])

    useEffect(() => {
        if (userId && system) {
            const prefs = loadPrefs(userId, { systemView: {} as Record<string, string>, systemOrder: {} as Record<string, string[]> })
            savePrefs(userId, {
                systemView: { ...prefs.systemView, [system.id]: viewMode },
                systemOrder: { ...prefs.systemOrder, [system.id]: microappOrder }
            })
        }
    }, [viewMode, userId, system, microappOrder])

    if (!system) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white/60 mb-4">System not found</p>
                    <Link href="/dashboard">
                        <button className="border border-white text-white px-4 py-2">
                            Return to Dashboard
                        </button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.15, 0.3, 0.15],
                    }}
                    transition={{
                        duration: 11,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-0 right-1/4 w-[650px] h-[650px] bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.1, 0.25, 0.1],
                    }}
                    transition={{
                        duration: 14,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.5
                    }}
                    className="absolute bottom-1/4 left-1/3 w-[550px] h-[550px] bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl"
                />

                <div className="absolute inset-0 opacity-[0.02]">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="system-grid" width="70" height="70" patternUnits="userSpaceOnUse">
                                <path d="M 70 0 L 0 0 0 70" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#system-grid)" />
                    </svg>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                <Navigation />
                <div className="h-20" />

                <div className="max-w-7xl mx-auto px-8 py-12">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <Link href="/dashboard">
                            <button className="text-white/60 hover:text-white hover:bg-white/5 gap-2 flex items-center px-4 py-2 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Dashboard
                            </button>
                        </Link>
                    </motion.div>

                    {/* System Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mb-16 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                            className="text-8xl mb-6 inline-block"
                        >
                            {system.icon}
                        </motion.div>

                        <div className="inline-flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-white/60" />
                            <p className="text-xs uppercase tracking-[0.3em] text-white/40">System</p>
                            <Sparkles className="w-4 h-4 text-white/60" />
                        </div>

                        <h1 className={`${playfair.className} text-6xl md:text-7xl font-bold mb-6 text-white`}>
                            {system.name}
                        </h1>
                        <p className={`${inter.className} text-xl text-white/60 max-w-3xl mx-auto leading-relaxed`}>
                            {system.description}
                        </p>
                    </motion.div>

                    {/* Second Brain: Tasks Dashboard Integration */}
                    {system.id === 'second-brain' && (
                        <div className="mb-16">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <h2 className={`${playfair.className} text-3xl font-bold text-white`}>Active Tasks</h2>
                                    <div className="h-px bg-white/10 flex-1" />
                                </div>
                                <Card className="bg-black border border-white/10 overflow-hidden">
                                    <CardContent className="p-0">
                                        <TasksDashboard
                                            entries={taskEntries}
                                            onUpdateEntry={handleUpdateTask}
                                            onEditEntry={handleEditTask}
                                            onScheduleEntry={handleScheduleTask}
                                        />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    )}

                    <AnimatePresence>
                        {isForgeOpen && (
                            <ForgeForm
                                microapp={dataStore.getMicroappById('tasks-sb')!}
                                systemId="second-brain"
                                initialData={editingTask?.data || {}}
                                onSave={handleSaveTask}
                                onCancel={() => setIsForgeOpen(false)}
                                variant="panel"
                                relationOptions={{}}
                            />
                        )}
                    </AnimatePresence>

                    {/* Second Brain: Tasks Dashboard Integration */}
                    {system.id === 'second-brain' && (
                        <div className="mb-16">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <h2 className={`${playfair.className} text-3xl font-bold text-white`}>Active Tasks</h2>
                                    <div className="h-px bg-white/10 flex-1" />
                                </div>
                                <Card className="bg-black border border-white/10 overflow-hidden">
                                    <CardContent className="p-0">
                                        <TasksDashboard
                                            entries={taskEntries}
                                            onUpdateEntry={handleUpdateTask}
                                            onEditEntry={handleEditTask}
                                            onScheduleEntry={handleScheduleTask}
                                        />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    )}

                    <AnimatePresence>
                        {isForgeOpen && (
                            <ForgeForm
                                microapp={dataStore.getMicroappById('tasks-sb')!}
                                systemId="second-brain"
                                initialData={editingTask?.data || {}}
                                onSave={handleSaveTask}
                                onCancel={() => setIsForgeOpen(false)}
                                variant="panel"
                                relationOptions={{}}
                            />
                        )}
                    </AnimatePresence>

                    {/* Microapps Grid */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-6 mb-8 justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <h2 className={`${playfair.className} text-4xl font-bold text-white`}>
                                    Microapps
                                </h2>
                                <div className="h-px bg-white/10 flex-1" />
                            </div>
                            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-1 rounded-lg border ${viewMode === 'grid' ? 'border-white/40 text-white' : 'border-white/10 text-white/50'} hover:border-white/40 transition`}
                                >
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1 rounded-lg border ${viewMode === 'list' ? 'border-white/40 text-white' : 'border-white/10 text-white/50'} hover:border-white/40 transition`}
                                >
                                    List
                                </button>
                                <button
                                    onClick={() => setCustomizeOrder(!customizeOrder)}
                                    className={`px-3 py-1 rounded-lg border ${customizeOrder ? 'border-white/40 text-white bg-white/10' : 'border-white/10 text-white/50'} hover:border-white/40 transition`}
                                >
                                    Drag
                                </button>
                            </div>
                        </motion.div>

                        <Reorder.Group
                            axis={viewMode === 'grid' ? undefined : 'y'}
                            values={microappOrder}
                            onReorder={(order) => setMicroappOrder(order as string[])}
                            className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}
                        >
                            {microappOrder.map((id, index) => {
                                const microapp = system.microapps.find(m => m.id === id)
                                if (!microapp) return null
                                const entryCount = entryCounts[microapp.id] || 0

                                return (
                                    <Reorder.Item key={microapp.id} value={microapp.id} drag={customizeOrder}>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                                            whileHover={{ scale: viewMode === 'grid' ? 1.05 : 1.02, y: -6 }}
                                            className={customizeOrder ? 'cursor-grab active:cursor-grabbing' : ''}
                                        >
                                            <Link href={`/systems/${system.id}/${microapp.id}`}>
                                                <Card className={`relative h-full border border-white/10 bg-black group hover:border-white/30 transition-all duration-500 flex flex-col overflow-hidden ${viewMode === 'list' ? 'flex-row items-center p-4 gap-4' : ''}`}>
                                                    <div className="absolute -inset-0.5 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur pointer-events-none" />
                                                    <CardHeader className={`bg-black border-b border-white/10 group-hover:bg-white/5 transition-colors duration-500 relative ${viewMode === 'list' ? 'border-none p-0 pr-4' : ''}`}>
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <motion.span
                                                                whileHover={{ scale: 1.2, rotate: 5 }}
                                                                className="text-4xl"
                                                            >
                                                                {microapp.icon}
                                                            </motion.span>
                                                            <CardTitle className={`${playfair.className} text-2xl font-bold text-white`}>
                                                                {microapp.name}
                                                            </CardTitle>
                                                        </div>
                                                        <CardDescription className="text-white/60 font-light leading-relaxed">
                                                            {microapp.description}
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent className={`pt-6 flex-1 flex flex-col relative ${viewMode === 'list' ? 'pt-0' : ''}`}>
                                                        <div className={`${viewMode === 'list' ? 'grid grid-cols-3 gap-3' : 'grid grid-cols-3 gap-3 mb-6 flex-1'}`}>
                                                            <div className="text-center">
                                                                <Layers className="w-5 h-5 text-white/40 mx-auto mb-2" />
                                                                <div className={`${playfair.className} text-2xl font-bold text-white`}>
                                                                    {microapp.fields.length}
                                                                </div>
                                                                <p className="text-xs text-white/40 uppercase tracking-wider mt-1">Fields</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <Database className="w-5 h-5 text-white/40 mx-auto mb-2" />
                                                                <div className={`${playfair.className} text-2xl font-bold text-white`}>
                                                                    {entryCount}
                                                                </div>
                                                                <p className="text-xs text-white/40 uppercase tracking-wider mt-1">Entries</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <Eye className="w-5 h-5 text-white/40 mx-auto mb-2" />
                                                                <div className={`${playfair.className} text-2xl font-bold text-white`}>
                                                                    {microapp.availableViews.length}
                                                                </div>
                                                                <p className="text-xs text-white/40 uppercase tracking-wider mt-1">Views</p>
                                                            </div>
                                                        </div>

                                                        <div className="border-t border-white/10 pt-4">
                                                            <motion.div
                                                                className="flex items-center justify-between text-xs uppercase tracking-wider font-medium"
                                                                whileHover={{ x: 5 }}
                                                            >
                                                                <span className="text-white/40">Open</span>
                                                                <span className="text-white flex items-center gap-1">
                                                                    View <ArrowRight className="w-3 h-3" />
                                                                </span>
                                                            </motion.div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        </motion.div>
                                    </Reorder.Item>
                                )
                            })}
                        </Reorder.Group>
                    </div>
                </div>
            </div>
        </div>
    )
}
