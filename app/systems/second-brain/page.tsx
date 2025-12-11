'use client'

import { ReactNode, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { motion, Reorder } from 'framer-motion'
import { ArrowLeft, Clock, LayoutPanelLeft, Layers, ListTodo, Sparkles, BookOpenCheck, CalendarClock, Rocket, Archive, NotebookPen, Share2, Flame, MapPin } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { dataStore, Entry, System } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

type ParaSection = {
    key: string
    title: string
    description: string
    accent: string
    icon: ReactNode
    microappId: string
    openPath: string
    newPath: string
    newLabel: string
    hint: string
}

const paraSections: ParaSection[] = [
    {
        key: 'projects',
        title: 'Projects',
        description: 'Active outcomes with deadlines and dependencies.',
        accent: 'from-indigo-500/30 via-cyan-400/20 to-sky-500/10',
        icon: <Rocket className="w-5 h-5 text-indigo-300" />,
        microappId: 'projects-sb',
        openPath: '/systems/second-brain/projects-sb',
        newPath: '/systems/second-brain/projects-sb?new=1',
        newLabel: 'New project',
        hint: 'Define outcomes + status'
    },
    {
        key: 'tasks',
        title: 'Tasks',
        description: 'Daily motion and execution lane.',
        accent: 'from-sky-500/30 via-cyan-400/20 to-indigo-500/10',
        icon: <ListTodo className="w-5 h-5 text-sky-200" />,
        microappId: 'tasks-sb',
        openPath: '/systems/second-brain/tasks-sb',
        newPath: '/systems/second-brain/tasks-sb/forge',
        newLabel: 'New task',
        hint: 'Plan and slot your day'
    },
    {
        key: 'areas',
        title: 'Areas',
        description: 'Ongoing responsibilities to keep green.',
        accent: 'from-emerald-500/25 via-lime-400/15 to-green-500/10',
        icon: <Layers className="w-5 h-5 text-emerald-300" />,
        microappId: 'areas-sb',
        openPath: '/systems/second-brain/areas-sb',
        newPath: '/systems/second-brain/areas-sb?new=1',
        newLabel: 'New area',
        hint: 'Guardrails & standards'
    },
    {
        key: 'resources',
        title: 'Resources',
        description: 'References, playbooks, and research.',
        accent: 'from-amber-500/25 via-orange-400/15 to-yellow-500/10',
        icon: <BookOpenCheck className="w-5 h-5 text-amber-200" />,
        microappId: 'resources-sb',
        openPath: '/systems/second-brain/resources-sb',
        newPath: '/systems/second-brain/resources-sb?new=1',
        newLabel: 'New resource',
        hint: 'Links, books, tools'
    },
    {
        key: 'notes',
        title: 'Notes',
        description: 'Distilled insights and capture.',
        accent: 'from-purple-500/30 via-fuchsia-400/20 to-pink-500/10',
        icon: <NotebookPen className="w-5 h-5 text-purple-200" />,
        microappId: 'notes-sb',
        openPath: '/systems/second-brain/notes-sb',
        newPath: '/systems/second-brain/notes-sb?new=1',
        newLabel: 'New note',
        hint: 'Atomic notes and links'
    },
    {
        key: 'archive',
        title: 'Archive',
        description: 'Finished work and decision history.',
        accent: 'from-slate-500/30 via-gray-500/20 to-zinc-500/10',
        icon: <Archive className="w-5 h-5 text-slate-200" />,
        microappId: 'archive-sb',
        openPath: '/systems/second-brain/archive-sb',
        newPath: '/systems/second-brain/archive-sb?new=1',
        newLabel: 'New archive',
        hint: 'Store with context'
    }
]

const motionStages = [
    { label: 'Capture', detail: 'Inbox quick capture feeds PARA', icon: <LayoutPanelLeft className="w-4 h-4" /> },
    { label: 'Organize', detail: 'Route notes into Projects/Areas', icon: <Layers className="w-4 h-4" /> },
    { label: 'Schedule', detail: 'Tasks auto-slot into day', icon: <CalendarClock className="w-4 h-4" /> },
    { label: 'Ship', detail: 'Archive outcomes with links', icon: <Archive className="w-4 h-4" /> }
]

export default function SecondBrainPage() {
    const router = useRouter()
    const [system, setSystem] = useState<System | null>(null)
    const [userId, setUserId] = useState<string>('defaultUser')
    const [entryCounts, setEntryCounts] = useState<Record<string, number>>({})
    const [todayTasks, setTodayTasks] = useState<Entry[]>([])
    const [roadTasks, setRoadTasks] = useState<Entry[]>([])
    const [allTasks, setAllTasks] = useState<Entry[]>([])
    const [projects, setProjects] = useState<Entry[]>([])
    const [notes, setNotes] = useState<Entry[]>([])
    const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)

    useEffect(() => {
        const s = dataStore.getSystem('second-brain')
        setSystem(s || null)
    }, [])

    useEffect(() => {
        const loadUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUserId(user?.id || 'defaultUser')
        }
        loadUser()
    }, [])

    useEffect(() => {
        if (!system) return
        const load = async () => {
            const counts: Record<string, number> = {}
            await Promise.all(paraSections.map(async (section) => {
                const entries = await dataStore.getEntries(section.microappId, userId)
                counts[section.microappId] = entries.length
            }))
            setEntryCounts(counts)

            const tasksRaw = await dataStore.getEntries('tasks-sb', userId)
            const tasks: Entry[] = []
            for (const t of tasksRaw) {
                const lane = t.data['Lane'] || (t.data['Status'] === true ? 'done' : 'pending')
                if (!t.data['Lane'] || lane !== t.data['Lane']) {
                    const updated = { ...t.data, Lane: lane }
                    await dataStore.updateEntry(t.id, updated)
                    tasks.push({ ...t, data: updated })
                } else {
                    tasks.push(t)
                }
            }
            const today = new Date().toISOString().split('T')[0]
            const todayItems = tasks.filter(t => (t.data['Start Date'] || '').startsWith(today))
            setTodayTasks(todayItems)
            setAllTasks(tasks)
            setRoadTasks(tasks)

            const proj = await dataStore.getEntries('projects-sb', userId)
            setProjects(proj)

            const noteEntries = await dataStore.getEntries('notes-sb', userId)
            setNotes(noteEntries)
        }
        load()
    }, [system, userId])

    const projectNames = useMemo(() => {
        const map: Record<string, string> = {}
        projects.forEach(p => { map[p.id] = p.data['Project Name'] || 'Project' })
        return map
    }, [projects])

    const dayBuckets = useMemo(() => {
        const buckets: Array<{ date: string; tasks: Entry[] }> = []
        const today = new Date()
        for (let i = 0; i < 14; i++) {
            const d = new Date(today)
            d.setDate(d.getDate() + i)
            const iso = d.toISOString().split('T')[0]
            const sameDay = allTasks.filter(t => (t.data['Start Date'] || '').startsWith(iso))
            buckets.push({ date: iso, tasks: sameDay })
        }
        return buckets
    }, [allTasks])

    const weekGraph = useMemo(() => dayBuckets.slice(0, 7), [dayBuckets])

    const pendingTasks = useMemo(
        () => allTasks.filter(t => (t.data['Lane'] || 'pending') === 'pending' && t.data['Status'] !== true),
        [allTasks]
    )

    const columnized = useMemo(() => {
        const todayIso = new Date().toISOString().split('T')[0]
        const pending: Entry[] = []
        const due: Entry[] = []
        const working: Entry[] = []
        const done: Entry[] = []

        allTasks.forEach(task => {
            const lane = task.data['Lane'] || 'pending'
            const status = task.data['Status']
            const end = task.data['End Date']
            const isDone = status === true
            const isDue = !isDone && end && end < todayIso
            if (lane === 'pending') {
                pending.push(task)
            } else if (isDone) {
                done.push(task)
            } else if (isDue) {
                due.push(task)
            } else {
                working.push(task)
            }
        })
        return { pending, due, working, done }
    }, [allTasks])

    const summaryCounts = useMemo(() => ({
        pending: columnized.pending.length,
        due: columnized.due.length,
        working: columnized.working.length,
    }), [columnized])

    const toggleTaskStatus = async (task: Entry) => {
        const updated = { ...task.data, Status: !task.data['Status'], Lane: task.data['Lane'] || 'pending' }
        await dataStore.updateEntry(task.id, updated)
        const tasks = await dataStore.getEntries('tasks-sb', userId)
        setAllTasks(tasks)
        const today = new Date().toISOString().split('T')[0]
        setTodayTasks(tasks.filter(t => (t.data['Start Date'] || '').startsWith(today)))
    }

    const moveTaskToLane = async (lane: 'pending' | 'due' | 'working' | 'done') => {
        if (!draggingTaskId) return
        const task = allTasks.find(t => t.id === draggingTaskId)
        if (!task) return
        const todayIso = new Date().toISOString().split('T')[0]
        const updated = { ...task.data }
        updated['Lane'] = lane
        if (lane === 'done') {
            updated['Status'] = true
            updated['Completion Date'] = todayIso
        } else {
            updated['Status'] = false
            updated['Completion Date'] = null
            updated['End Date'] = lane === 'due' ? todayIso : (updated['End Date'] || todayIso)
        }
        await dataStore.updateEntry(task.id, updated)
        const tasks = await dataStore.getEntries('tasks-sb', userId)
        setAllTasks(tasks)
        const today = new Date().toISOString().split('T')[0]
        setTodayTasks(tasks.filter(t => (t.data['Start Date'] || '').startsWith(today)))
    }

    useEffect(() => {
        if (allTasks.length === 0) {
            setRoadTasks([])
            return
        }
        const sorted = [...allTasks].sort((a, b) => (a.data['Start Date'] || '').localeCompare(b.data['Start Date'] || ''))
        setRoadTasks(sorted)
    }, [allTasks])

    const timelineBlocks = useMemo(() => {
        if (todayTasks.length === 0) {
            return [
                { title: 'Add a task', time: '—', note: 'Use Tasks to auto-slot your day', href: '/systems/second-brain/tasks-sb' }
            ]
        }
        return todayTasks
            .sort((a, b) => (a.data['Start Date'] || '').localeCompare(b.data['Start Date'] || ''))
            .map(task => ({
                title: task.data['Task'] || 'Untitled task',
                time: task.data['Start Date'] || 'Scheduled',
                note: task.data['Project'] ? 'Linked to a project' : 'Solo task',
                href: `/systems/second-brain/tasks-sb?id=${task.id}`
            }))
    }, [todayTasks])

    if (!system) return null

    return (
        <div className="min-h-screen bg-[#050508] text-white">
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.12),transparent_30%),radial-gradient(circle_at_40%_80%,rgba(52,211,153,0.12),transparent_30%)]" />
                <div className="absolute inset-0 opacity-[0.03]">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="para-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#para-grid)" />
                    </svg>
                </div>
            </div>

            <Navigation isAuthenticated />
            <div className="h-16" />

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
                <div className="flex items-center gap-3 text-white/60">
                    <Link href="/dashboard" className="flex items-center gap-2 hover:text-white transition">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Link>
                    <span className="text-white/30">/</span>
                    <span className="uppercase tracking-[0.3em] text-xs">Second Brain</span>
                </div>

                <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-8 items-start">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
                            <div className="flex items-center gap-3 text-amber-200">
                                <Sparkles className="w-5 h-5" />
                                <span className="text-xs uppercase tracking-[0.3em] text-white/60">Motion x PARA</span>
                            </div>
                            <h1 className={`${playfair.className} text-5xl font-bold mt-4 mb-3`}>
                                Build a Second Brain that schedules itself
                            </h1>
                            <p className={`${inter.className} text-lg text-white/70 max-w-3xl`}>
                                Capture once, route into PARA, and let Motion-style scheduling keep projects shipping.
                                Everything below is wired to your microapps—no scaffolding to rebuild.
                            </p>
                            <div className="mt-4 text-white/80 bg-white/5 border border-white/10 rounded-2xl p-4">
                                <p className="text-sm">
                                    You have <span className="font-semibold text-white">{summaryCounts.pending}</span> pending,
                                    <span className="font-semibold text-white"> {summaryCounts.due}</span> due,
                                    and <span className="font-semibold text-white"> {summaryCounts.working}</span> in progress.
                                </p>
                            </div>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
                                    <Link href="/systems/second-brain/inbox-sb">Open Inbox</Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                                    <Link href="/systems/second-brain/tasks-sb">Plan Tasks</Link>
                                </Button>
                                <Button asChild variant="ghost" size="lg" className="text-white/70 hover:text-white hover:bg-white/5">
                                    <Link href="/systems/second-brain/projects-sb">Projects</Link>
                                </Button>
                            </div>
                        </div>

                        <Card className="bg-white/5 border-white/10 overflow-hidden">
                            <CardHeader className="flex items-center gap-2">
                                <Flame className="w-4 h-4 text-amber-200" />
                                <CardTitle className="text-white">Motion board</CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-4 gap-3">
                                {[
                                    { key: 'pending', label: 'Pending', color: 'from-slate-500/35 to-slate-700/20', items: columnized.pending },
                                    { key: 'due', label: 'Due', color: 'from-rose-500/40 to-amber-500/30', items: columnized.due },
                                    { key: 'working', label: 'Working on', color: 'from-amber-400/40 to-yellow-400/30', items: columnized.working },
                                    { key: 'done', label: 'Done', color: 'from-emerald-500/35 to-teal-500/25', items: columnized.done }
                                ].map(col => (
                                    <motion.div
                                        layout
                                        key={col.key}
                                        className={cn('rounded-2xl border border-white/10 p-4 bg-white/5 relative overflow-hidden', `bg-gradient-to-br ${col.color}`)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={async (e) => {
                                            e.preventDefault()
                                            await moveTaskToLane(col.key as 'pending' | 'due' | 'working' | 'done')
                                            setDraggingTaskId(null)
                                        }}
                                    >
                                        <div className="flex items-center justify-between text-white mb-3">
                                            <span className="font-semibold">{col.label}</span>
                                            <span className="text-xs text-white/70">{col.items.length}</span>
                                        </div>
                                        <div className="space-y-3">
                                            {col.items.length === 0 && (
                                                <div className="text-white/60 text-xs">Drop here.</div>
                                            )}
                                                {col.items.map(item => (
                                                    <motion.div
                                                        layout
                                                        key={item.id}
                                                        draggable
                                                        onDragStart={() => setDraggingTaskId(item.id)}
                                                        onDragEnd={() => setDraggingTaskId(null)}
                                                        className="p-3 rounded-xl border border-white/15 bg-black/30 hover:border-white/40 transition cursor-grab active:cursor-grabbing"
                                                        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                                                        whileDrag={{ scale: 1.02, rotate: -1, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
                                                        onClick={() => router.push(`/systems/second-brain/tasks-sb?id=${item.id}`)}
                                                    >
                                                        <div className="flex items-center justify-between text-sm text-white">
                                                            <span className="font-semibold line-clamp-1">{item.data['Task'] || 'Untitled'}</span>
                                                            <span className="text-xs text-white/60">{(item.data['End Date'] || '').slice(5)}</span>
                                                        </div>
                                                        <p className="text-xs text-white/50">
                                                            {projectNames[item.data['Project']] || 'Solo'}
                                                        </p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <ListTodo className="w-5 h-5 text-white/70" />
                                <h2 className={`${playfair.className} text-3xl font-semibold`}>PARA control center</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {paraSections.map((section, idx) => (
                                    <motion.div
                                        key={section.key}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 * idx }}
                                        className="relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${section.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                        <div className="relative p-6 space-y-4">
                                            <div className="flex items-center gap-3">
                                                {section.icon}
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.25em] text-white/50">PARA</p>
                                                    <h3 className="text-2xl font-semibold text-white">{section.title}</h3>
                                                </div>
                                            </div>
                                            <p className={`${inter.className} text-white/70`}>{section.description}</p>
                                            <p className="text-sm text-white/60">{section.hint}</p>
                                            <div className="grid grid-cols-2 border-t border-white/10 divide-x divide-white/10">
                                                <Link
                                                    href={section.openPath}
                                                    className="block text-center text-white py-3 hover:bg-white/10 transition"
                                                >
                                                    Open
                                                </Link>
                                                <Link
                                                    href={section.newPath}
                                                    className="block text-center text-white py-3 hover:bg-white/10 transition"
                                                >
                                                    {section.newLabel}
                                                </Link>
                                            </div>
                                            <div className="text-xs text-white/50">
                                                {entryCounts[section.microappId] ?? 0} items
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Flame className="w-5 h-5 text-amber-300" />
                                <div>
                                    <p className="text-xs uppercase tracking-[0.25em] text-white/50">Task-led road</p>
                                    <h2 className={`${playfair.className} text-3xl font-semibold`}>Drag the Motion-style road</h2>
                                </div>
                            </div>
                            <Card className="bg-black/40 border-white/10 overflow-hidden">
                                <CardContent className="relative pt-10">
                                    <div className="absolute inset-x-6 top-[52%] h-[2px] bg-gradient-to-r from-white/0 via-white/30 to-white/0 blur-sm" />
                                    <div className="absolute inset-x-10 top-[52%] h-[1px] bg-white/20" />
                                    <Reorder.Group axis="x" values={roadTasks} onReorder={setRoadTasks} className="flex gap-4 overflow-x-auto pb-4">
                                        {roadTasks.length === 0 && (
                                            <div className="text-white/60 text-sm">
                                                No tasks yet. Capture in Inbox or Tasks, then drag them here.
                                            </div>
                                        )}
                                        {roadTasks.map((task, idx) => {
                                            const start = task.data['Start Date'] || 'Schedule'
                                            const project = projectNames[task.data['Project']] || 'Solo'
                                            const status = task.data['Status'] ? 'Done' : 'Active'
                                            return (
                                                <Reorder.Item
                                                    key={task.id}
                                                    value={task}
                                                    className="min-w-[260px]"
                                                >
                                                    <div className="relative p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-white/40 transition backdrop-blur">
                                                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/70 shadow-lg" />
                                                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/50" />
                                                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/50 mb-2">
                                                            <span>Task parent</span>
                                                            <span className={status === 'Done' ? 'text-emerald-300' : 'text-amber-200'}>
                                                                {status}
                                                            </span>
                                                        </div>
                                                        <h4 className="text-xl font-semibold text-white mb-2">
                                                            {task.data['Task'] || 'Untitled task'}
                                                        </h4>
                                                        <p className="text-sm text-white/60 mb-3">
                                                            Project: {project}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/70 border border-white/15">
                                                                {start}
                                                            </span>
                                                            {task.data['Resources'] && (
                                                                <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/70 border border-white/15">
                                                                    Resources linked
                                                                </span>
                                                            )}
                                                            {task.data['Notes'] && (
                                                                <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/70 border border-white/15">
                                                                    Note attached
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="mt-4 flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="bg-white text-black hover:bg-white/80"
                                                                onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task) }}
                                                            >
                                                                Toggle state
                                                            </Button>
                                                            <Button asChild size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                                                <Link href={`/systems/second-brain/tasks-sb?id=${task.id}`}>Open</Link>
                                                            </Button>
                                                        </div>
                                                        <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>Drag to reorder priority along the road</span>
                                                            <span className="text-white/30">#{idx + 1}</span>
                                                        </div>
                                                    </div>
                                                </Reorder.Item>
                                            )
                                        })}
                                    </Reorder.Group>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    )
}
