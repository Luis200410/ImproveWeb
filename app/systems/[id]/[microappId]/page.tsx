'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { dataStore, Microapp, Entry, FieldDefinition } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { CustomSelect } from '@/components/ui/custom-select'
import { NumberSlider } from '@/components/ui/number-slider'
import { ArrowLeft, Clock, Calendar, CheckSquare, Plus, Edit, Trash2, Link as LinkIcon, ExternalLink, Share2, MoreVertical, Flame, TrendingUp, TrendingDown, DollarSign, Activity, Zap, Utensils, Droplets, Dumbbell, Wallet, Target, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation } from '@/components/navigation'

import { MicroappForm } from '@/components/microapp-form'
import { HabitBuilder } from '@/components/habit-builder'
import { HabitTimeline } from '@/components/habit-timeline'
import { ForgeForm } from '@/components/forge-form'
import { Playfair_Display, Inter } from '@/lib/font-shim'

import { MicroappHeader } from '@/components/microapp-header'
import { ProjectsDashboard } from '@/components/projects-dashboard'
import { useRealtimeSubscription } from '@/hooks/use-realtime-data'

import { TasksDashboard } from '@/components/tasks-dashboard'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function MicroappPage() {
    const params = useParams()
    const router = useRouter();
    const searchParams = useSearchParams()
    const [userId, setUserId] = useState<string | null>(null);
    const systemId = params.id as string
    const microappId = params.microappId as string

    const [microapp, setMicroapp] = useState<Microapp | null>(null)
    const [entries, setEntries] = useState<Entry[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Additional state for Projects Dashboard
    const [tasks, setTasks] = useState<Entry[]>([])
    const [areas, setAreas] = useState<Entry[]>([])

    const [isForgeOpen, setIsForgeOpen] = useState(false)
    const [creatingRelation, setCreatingRelation] = useState<{ targetMicroappId: string, sourceFieldName: string, initialValue?: string } | null>(null)
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
    const [defaultFormData, setDefaultFormData] = useState<Record<string, any>>({})
    const [externalFieldUpdate, setExternalFieldUpdate] = useState<{ fieldName: string, value: any, label?: string } | null>(null)
    const [relatedNames, setRelatedNames] = useState<Record<string, string>>({})
    const [projectProgress, setProjectProgress] = useState<Record<string, { total: number, completed: number }>>({})
    const [relationOptions, setRelationOptions] = useState<Record<string, { value: string, label: string }[]>>({})
    const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list')

    // Atomic Habits State
    const [isCreatingHabit, setIsCreatingHabit] = useState(false)
    const [habitViewMode, setHabitViewMode] = useState<'day' | 'week'>('day')

    const fetchEntries = useCallback(async (currentUserId: string) => {
        if (!microappId) return;

        try {
            const loadedEntries = await dataStore.getEntries(microappId, currentUserId);
            setEntries(loadedEntries);

            // If it's the projects dashboard, we need more data
            if (microappId === 'projects-sb') {
                const [t, a] = await Promise.all([
                    dataStore.getEntries('tasks-sb', currentUserId),
                    dataStore.getEntries('areas-sb', currentUserId)
                ]);
                setTasks(t);
                setAreas(a);
            }

            // Load Relation Options for Forms (if microapp loaded)
            if (microapp) {
                const options: Record<string, { value: string, label: string }[]> = {};
                for (const field of microapp.fields) {
                    if (field.type === 'relation' && field.relationMicroappId) {
                        const targetEntries = await dataStore.getEntries(field.relationMicroappId, currentUserId);
                        const targetApp = dataStore.getMicroappById(field.relationMicroappId);
                        if (targetApp) {
                            const labelField = targetApp.fields.find(f =>
                                ['Title', 'Name', 'Project Name', 'Goal Name', 'Habit Name', 'Area Name'].includes(f.name)
                            ) || targetApp.fields[0];

                            options[field.name] = targetEntries.map(e => ({
                                value: e.id,
                                label: String(e.data[labelField.name] || 'Untitled')
                            }));
                        }
                    }
                }
                setRelationOptions(options);

                // Fetch related names
                const names: Record<string, string> = {}
                for (const entry of loadedEntries) {
                    for (const field of microapp.fields) {
                        if (field.type === 'relation' && entry.data[field.name]) {
                            const relId = entry.data[field.name];
                            if (!names[relId]) {
                                if (field.relationMicroappId) {
                                    const relEntry = await dataStore.getEntry(relId);
                                    if (relEntry) {
                                        const relApp = dataStore.getMicroappById(field.relationMicroappId);
                                        if (relApp) {
                                            const labelField = relApp.fields.find(f => ['Title', 'Name', 'Area Name'].includes(f.name)) || relApp.fields[0];
                                            names[relId] = relEntry.data[labelField.name] || relId;
                                        }
                                    }
                                }
                            }
                        }

                        // Project Progress Calculation
                        if (microappId === 'projects-sb') {
                            const tasksAppId = 'tasks-sb';
                            const allTasks = await dataStore.getEntries(tasksAppId, currentUserId);
                            const projectTasks = allTasks.filter(t => t.data['Project'] === entry.id || (typeof t.data['Project'] === 'object' && t.data['Project'].id === entry.id));
                            const completed = projectTasks.filter(t => t.data['Status'] === 'Done').length; // Ensure matching 'Done' string
                            setProjectProgress(prev => ({ ...prev, [entry.id]: { total: projectTasks.length, completed } }));
                        }
                    }
                }
                setRelatedNames(names);
            }
        } catch (error) {
            console.error("Failed to fetch entries:", error)
        } finally {
            setIsLoading(false)
        }
    }, [microappId, microapp]);

    // Realtime Sync
    useRealtimeSubscription('entries', () => {
        if (userId) {
            fetchEntries(userId);
        }
    });

    // Initial Load
    useEffect(() => {
        const init = async () => {
            // 1. Get Microapp
            const app = dataStore.getMicroapp(systemId, microappId);
            if (!app) {
                // If not found, maybe wait or redirect. 
                // For now, assume it might be a hydration timing issue, but getMicroapp is sync from LS.
                // If it fails, redirecting is safe.
                router.push(`/systems/${systemId}`);
                return;
            }
            setMicroapp(app);

            // 2. Get User
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUserId(user.id);
                // 3. Fetch Entries Immediately
                await fetchEntries(user.id);
            } else {
                // Handle not logged in?
                setIsLoading(false);
            }
        };
        init();
    }, [systemId, microappId, router]); // Only run on mount changes

    // We don't need the separate useEffect [microapp, userId] anymore because we call fetchEntries directly in init 
    // AND we have it in realtime subscription for updates.
    // However, if `microapp` state updates LATER (e.g. if we had async microapp loading), we might need it. 
    // But here `getMicroapp` is sync.
    // To be safe, let's keep a simple effect that runs if userId changes later (e.g. login/logout without unmount)
    useEffect(() => {
        if (userId && microapp) {
            // Avoid double fetching if init already did it.
            // This effect primarily handles cases where userId might change *after* initial load
            // (e.g., user logs in/out without a full page reload, or if init() didn't fetch for some reason).
            // The `isLoading` state should prevent premature rendering.
            fetchEntries(userId);
        }
    }, [userId, microapp]);

    useEffect(() => {
        const newParam = searchParams.get('new')
        if (newParam === '1') {
            setIsForgeOpen(true)
            setEditingEntry(null)
        }
    }, [searchParams])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSaveEntry = async (data: Record<string, any>) => {
        if (!microapp || !userId) return

        // Check if we are updating (prioritize explicit data.id, then fallback to editingEntry)
        const updateId = data.id || editingEntry?.id;

        if (updateId) {
            await dataStore.updateEntry(updateId, data)
        } else {
            // For Atomic Habits, ensure defaults
            if (microappId === 'atomic-habits') {
                // Ensure status/streak initialized
            }
            await dataStore.addEntry(userId, microapp.id, data)
        }

        // Refresh
        fetchEntries(userId);
        setIsForgeOpen(false)
        setEditingEntry(null)
        setExternalFieldUpdate(null)

        // Clear query param
        const params = new URLSearchParams(searchParams.toString())
        if (params.has('new')) {
            params.delete('new')
            router.replace(`?${params.toString()}`)
        }
    }

    const handleDelete = async (entryId: string, skipConfirm = false) => {
        if (!userId) return
        if (skipConfirm || confirm('Are you sure you want to delete this entry?')) {
            await dataStore.deleteEntry(entryId)
            fetchEntries(userId);
        }
    }

    const handleEdit = (entry: Entry) => {
        setEditingEntry(entry)
        setIsForgeOpen(true)
    }

    const handleCancelForm = () => {
        setIsForgeOpen(false)
        setEditingEntry(null)
        setExternalFieldUpdate(null)
        // Clear query param
        const params = new URLSearchParams(searchParams.toString())
        if (params.has('new')) {
            params.delete('new')
            router.replace(`?${params.toString()}`)
        }
    }

    const handleSaveRelationEntry = async (data: Record<string, any>) => {
        if (!creatingRelation || !userId) return;

        // Save new entry to target microapp
        // We know targetMicroappId
        await dataStore.addEntry(userId, creatingRelation.targetMicroappId, data);

        // Find newly created entry to pass back
        const entries = await dataStore.getEntries(creatingRelation.targetMicroappId, userId);
        const newEntry = entries[entries.length - 1]; // Risky but works for local

        // Update main form field
        const targetApp = dataStore.getMicroappById(creatingRelation.targetMicroappId);
        let label = newEntry.id;
        if (targetApp) {
            const labelField = targetApp.fields.find(f => ['Title', 'Name', 'Area Name'].includes(f.name)) || targetApp.fields[0];
            label = newEntry.data[labelField.name] || newEntry.id;
        }

        setExternalFieldUpdate({
            fieldName: creatingRelation.sourceFieldName,
            value: newEntry.id,
            label: label
        });

        setCreatingRelation(null);

        // Refresh relations list for name lookup?
        setRelatedNames(prev => ({ ...prev, [newEntry.id]: label }))
    }

    const handleScheduleTask = async (entry: Entry, date: Date) => {
        if (!userId) return
        const updatedData = { ...entry.data, id: entry.id, 'Start Date': date.toISOString(), 'Status': 'Due' }
        await handleSaveEntry(updatedData)
        handleEdit({ ...entry, data: updatedData })
    }

    const handleUpdateEntry = async (entry: Entry, updates: Record<string, any>) => {
        if (!userId) return
        await dataStore.updateEntry(entry.id, updates)
        fetchEntries(userId)
    }

    // For Projects Dashboard specifically
    const handleUpdateProject = async (projectId: string, updates: Record<string, any>) => {
        if (!userId) return
        await dataStore.updateEntry(projectId, updates)
        fetchEntries(userId)
    }

    const handleCreateProject = () => {
        if (!userId) return
        setEditingEntry(null)
        setIsForgeOpen(true)
    }

    const handleEditEntry = (entry: Entry) => {
        setEditingEntry(entry)
        setIsForgeOpen(true)
    }

    // Helper to get target microapp for modal
    const targetMicroapp = creatingRelation ? dataStore.getMicroappById(creatingRelation.targetMicroappId) : null;
    const relationInitialData = creatingRelation?.initialValue ? {
        [creatingRelation.targetMicroappId === 'areas-sb' ? 'Area Name' :
            creatingRelation.sourceFieldName === 'Project' ? 'Name' : 'Title']: creatingRelation.initialValue
    } : {};

    if (!microapp) return null

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white/20">
            {/* ... Navigation ... */}
            <Navigation />

            <div className="max-w-7xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
                {/* ... Header ... */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                            <span className="text-3xl">{microapp.icon}</span>
                        </div>
                        <div>
                            <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold text-white mb-2`}>
                                {microapp.name}
                            </h1>
                            <p className={`${inter.className} text-white/60 font-light`}>{microapp.description}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Header Actions */}
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="uppercase tracking-widest text-xs">Back</span>
                    </button>

                    {microappId === 'atomic-habits' ? (
                        <button
                            onClick={() => setIsCreatingHabit(true)}
                            className="bg-white text-black px-6 py-2 rounded-full uppercase tracking-widest text-xs font-bold hover:bg-white/90 transition-colors flex items-center gap-2"
                        >
                            <Flame className="w-4 h-4" /> Forge Habit
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                setEditingEntry(null)
                                setIsForgeOpen(true)
                            }}
                            className="bg-white text-black px-6 py-2 rounded-full uppercase tracking-widest text-xs font-bold hover:bg-white/90 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> New Entry
                        </button>
                    )}
                </div>

                {/* Content Area */}
                <div className="relative">
                    {/* Atomic Habits Custom View */}
                    {microappId === 'atomic-habits' ? (
                        // ... (atomic habits code) ...
                        <>
                            {isCreatingHabit ? (
                                <HabitBuilder
                                    onSave={async (data) => {
                                        await handleSaveEntry(data)
                                        setIsCreatingHabit(false)
                                        setEditingEntry(null)
                                    }}
                                    onCancel={() => {
                                        setIsCreatingHabit(false)
                                        setEditingEntry(null)
                                    }}
                                    onDelete={editingEntry ? () => {
                                        handleDelete(editingEntry.id)
                                        setIsCreatingHabit(false)
                                        setEditingEntry(null)
                                    } : undefined}
                                    initialData={editingEntry?.data}
                                    existingEntries={entries.filter(e => e.id !== editingEntry?.id)}
                                />
                            ) : (
                                <HabitTimeline
                                    entries={entries}
                                    onToggleStatus={(entry) => {
                                        handleSaveEntry({ ...entry.data, id: entry.id });
                                    }}
                                    onEdit={(entry) => {
                                        setEditingEntry(entry)
                                        setIsCreatingHabit(true)
                                    }}
                                    onDelete={async (entryId, skipConfirm) => {
                                        // ...
                                        if (skipConfirm) {
                                            const entry = entries.find(e => e.id === entryId);
                                            if (entry) {
                                                await handleSaveEntry({ ...entry.data, id: entry.id, archived: true });
                                            }
                                        } else {
                                            handleDelete(entryId, skipConfirm)
                                        }
                                    }}
                                    onFocusComplete={async (duration, entry) => {
                                        // ...
                                        try {
                                            await dataStore.addEntry(userId, 'pomodoro', {
                                                'Session Name': entry.data['Habit Name'],
                                                'Duration': duration,
                                                'Date': new Date().toISOString(),
                                                'Completed': true,
                                                'Notes': `Focus Session for ${entry.data['Category'] || 'General'} habit.`
                                            });
                                        } catch (e) {
                                            console.log('Focus logging not fully configured yet', e);
                                        }
                                    }}
                                    viewMode={habitViewMode}
                                    onChangeViewMode={setHabitViewMode}
                                />
                            )}
                        </>
                    ) : microappId === 'tasks-sb' ? (
                        /* Tasks Dashboard View - Adding below this image per request */
                        <>
                            <AnimatePresence>
                                {isForgeOpen && (
                                    <ForgeForm
                                        microapp={microapp}
                                        systemId={systemId}
                                        onSave={handleSaveEntry}
                                        onCancel={handleCancelForm}
                                        initialData={editingEntry ? editingEntry.data : defaultFormData}
                                        onRequestCreateRelation={(targetId, fieldName) => setCreatingRelation({ targetMicroappId: targetId, sourceFieldName: fieldName })}
                                        relationOptions={relationOptions}
                                        variant={'panel'}
                                    />
                                )}
                            </AnimatePresence>
                            <AnimatePresence>
                                {creatingRelation && targetMicroapp && (
                                    <ForgeForm
                                        microapp={targetMicroapp}
                                        systemId={systemId}
                                        onSave={handleSaveRelationEntry}
                                        onCancel={() => setCreatingRelation(null)}
                                        initialData={relationInitialData}
                                        relationOptions={relationOptions}
                                    />
                                )}
                            </AnimatePresence>

                            <TasksDashboard
                                entries={entries}
                                onUpdateEntry={(entry, updates) => handleSaveEntry({ ...entry.data, id: entry.id, ...updates })}
                                onEditEntry={handleEdit}
                                onScheduleEntry={handleScheduleTask}
                            />
                        </>
                    ) : microappId === 'projects-sb' ? (
                        <>
                            <AnimatePresence>
                                {isForgeOpen && (
                                    <ForgeForm
                                        microapp={microapp}
                                        systemId={systemId}
                                        onSave={handleSaveEntry}
                                        onCancel={handleCancelForm}
                                        initialData={editingEntry ? editingEntry.data : defaultFormData}
                                        onRequestCreateRelation={(targetId, fieldName) => setCreatingRelation({ targetMicroappId: targetId, sourceFieldName: fieldName })}
                                        relationOptions={relationOptions}
                                        variant="panel"
                                    />
                                )}
                            </AnimatePresence>
                            <div className="max-w-7xl mx-auto px-8 py-12">
                                <ProjectsDashboard
                                    projects={entries}
                                    tasks={tasks}
                                    areas={areas}
                                    onUpdateProject={handleUpdateProject}
                                    onEditProject={handleEditEntry}
                                    onCreateProject={handleCreateProject}
                                />
                            </div>
                        </>
                    ) : (
                        /* Standard View */
                        <>
                            {/* New Entry Form - Rendered at Top Level for Full Screen Fixed Positioning */}
                            <AnimatePresence>
                                {isForgeOpen && (
                                    <ForgeForm
                                        microapp={microapp}
                                        systemId={systemId}
                                        onSave={handleSaveEntry}
                                        onCancel={handleCancelForm}
                                        initialData={editingEntry ? editingEntry.data : defaultFormData}
                                        onRequestCreateRelation={(targetId, fieldName) => setCreatingRelation({ targetMicroappId: targetId, sourceFieldName: fieldName })}
                                        relationOptions={relationOptions}
                                        variant={microappId === 'tasks-sb' ? 'panel' : 'fullscreen'}
                                    />
                                )}
                            </AnimatePresence>

                            {/* ... (Relation Creation Modal) ... */}
                            <AnimatePresence>
                                {creatingRelation && targetMicroapp && (
                                    <ForgeForm
                                        microapp={targetMicroapp}
                                        systemId={systemId}
                                        onSave={handleSaveRelationEntry}
                                        onCancel={() => setCreatingRelation(null)}
                                        initialData={relationInitialData}
                                        relationOptions={relationOptions}
                                    />
                                )}
                            </AnimatePresence>

                            {/* Entries List */}
                            <div>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex items-center gap-6 mb-8"
                                >
                                    <h2 className={`${playfair.className} text-3xl font-bold text-white`}>
                                        Entries ({entries.length})
                                    </h2>
                                    <div className="h-px bg-white/10 flex-1" />
                                </motion.div>

                                {/* ... (Standard Grid) ... */}
                                {entries.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-20 bg-white/5 border border-white/10"
                                    >
                                        <p className={`${inter.className} text-white/40 text-lg mb-4`}>No entries yet</p>
                                        <p className={`${inter.className} text-white/30 text-sm`}>Create your first entry to get started</p>
                                    </motion.div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <AnimatePresence>
                                            {entries.map((entry, index) => (
                                                <motion.div
                                                    key={entry.id}
                                                    layoutId={entry.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    whileHover={{ scale: 1.02, y: -5 }}
                                                    className="relative group h-full"
                                                >
                                                    {/* ... (Standard Card Content) ... */}
                                                    {/* ... Copied relevant parts for standard card rendering ... */}
                                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur" />
                                                    <Card className="relative border border-white/10 bg-white/5 group-hover:border-white/30 transition-all duration-500 h-full flex flex-col">
                                                        <CardHeader className="border-b border-white/10">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <Calendar className="w-5 h-5 text-white/40" />
                                                                    <CardDescription className="text-white/60 text-sm">
                                                                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                                                            month: 'long',
                                                                            day: 'numeric',
                                                                            year: 'numeric'
                                                                        })}
                                                                    </CardDescription>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={() => handleEdit(entry)}
                                                                        className="p-2 hover:bg-white/10 transition-colors"
                                                                    >
                                                                        <Edit className="w-4 h-4 text-white/40 hover:text-white transition-colors" />
                                                                    </motion.button>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={() => handleDelete(entry.id)}
                                                                        className="p-2 hover:bg-white/10 transition-colors"
                                                                    >
                                                                        <Trash2 className="w-4 h-4 text-white/40 hover:text-white transition-colors" />
                                                                    </motion.button>
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="pt-6 flex-1">
                                                            {microappId === 'notes-sb' ? (
                                                                <div className="space-y-6">
                                                                    <div>
                                                                        <h3 className={`${playfair.className} text-xl text-white mb-2`}>{String(entry.data['Title'] || 'Untitled')}</h3>
                                                                        <div className="flex flex-wrap gap-4 text-xs uppercase tracking-wider text-white/40">
                                                                            {entry.data['Project'] && <span>Project: {relatedNames[entry.data['Project']] || entry.data['Project']}</span>}
                                                                            {entry.data['Area'] && <span>Area: {relatedNames[entry.data['Area']] || entry.data['Area']}</span>}
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid md:grid-cols-3 gap-6 border-t border-b border-white/10 py-4">
                                                                        <div className="md:col-span-1 border-r border-white/10 pr-6">
                                                                            <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Cues</p>
                                                                            <p className={`${inter.className} text-white/80 whitespace-pre-wrap font-serif italic text-sm`}>
                                                                                {entry.data['Cues'] || 'No cues recorded'}
                                                                            </p>
                                                                        </div>
                                                                        <div className="md:col-span-2">
                                                                            <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Notes</p>
                                                                            <p className={`${inter.className} text-white whitespace-pre-wrap leading-relaxed`}>
                                                                                {entry.data['Main Notes'] || entry.data['Content'] || ''}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Summary</p>
                                                                        <div className="bg-white/5 p-4 rounded-sm border-l-2 border-white/20">
                                                                            <p className={`${inter.className} text-white/90 italic`}>
                                                                                {entry.data['Summary'] || 'No summary'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : microappId === 'projects-sb' ? (
                                                                <div className="space-y-4">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <h3 className={`${playfair.className} text-xl text-white mb-1`}>{String(entry.data['Project Name'] || 'Untitled')}</h3>
                                                                            {entry.data['Area'] && <p className="text-xs uppercase tracking-wider text-white/40">In: {relatedNames[entry.data['Area']] || entry.data['Area']}</p>}
                                                                        </div>
                                                                        <span className={`px-2 py-1 text-xs rounded border ${entry.data['Status'] === 'Completed' ? 'border-green-500 text-green-500' : 'border-white/20 text-white/60'}`}>
                                                                            {entry.data['Status']}
                                                                        </span>
                                                                    </div>
                                                                    <p className={`${inter.className} text-white/60 text-sm line-clamp-2`}>{entry.data['Description']}</p>
                                                                    {projectProgress[entry.id] && (
                                                                        <div className="space-y-1 pt-2">
                                                                            <div className="flex justify-between text-xs text-white/40 uppercase tracking-wider">
                                                                                <span>Progress</span>
                                                                                <span>{Math.round((projectProgress[entry.id].completed / (projectProgress[entry.id].total || 1)) * 100)}% ({projectProgress[entry.id].completed}/{projectProgress[entry.id].total})</span>
                                                                            </div>
                                                                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className="h-full bg-white transition-all duration-500 ease-out"
                                                                                    style={{ width: `${(projectProgress[entry.id].completed / (projectProgress[entry.id].total || 1)) * 100}%` }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : microappId === 'routine-builder' ? (
                                                                <div className="space-y-4">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <h3 className={`${playfair.className} text-xl text-white mb-1`}>{String(entry.data['Program Name'] || 'Untitled')}</h3>
                                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded border border-white/20 text-white/60 bg-white/5">
                                                                                    {entry.data['Goal']}
                                                                                </span>
                                                                                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded border border-white/20 text-white/60 bg-white/5">
                                                                                    {entry.data['Split']}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-2xl font-mono">{entry.data['Sessions / Week']}</div>
                                                                            <div className="text-[10px] uppercase tracking-wider text-white/40">Sess/Wk</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
                                                                        <div>
                                                                            <p className="text-[10px] uppercase tracking-wider text-white/40">Next Session</p>
                                                                            <p className="text-sm font-light mt-1">{entry.data['Next Session'] ? new Date(entry.data['Next Session']).toLocaleDateString() : 'Not Set'}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-[10px] uppercase tracking-wider text-white/40">Length</p>
                                                                            <p className="text-sm font-light mt-1">{entry.data['Session Length (min)']}m</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : microappId === 'recovery' ? (
                                                                <div className="space-y-4">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <h3 className={`${playfair.className} text-xl text-white mb-1`}>{String(entry.data['Modality'] || 'Recovery')}</h3>
                                                                            <p className="text-xs uppercase tracking-wider text-white/40">{entry.data['Focus Area']}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className={`text-2xl font-mono ${Number(entry.data['Readiness (1-10)']) >= 8 ? 'text-emerald-400' : Number(entry.data['Readiness (1-10)']) >= 5 ? 'text-amber-400' : 'text-rose-400'}`}>
                                                                                {entry.data['Readiness (1-10)']}
                                                                            </div>
                                                                            <div className="text-[10px] uppercase tracking-wider text-white/40">Readiness</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-sm text-white/60">
                                                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {entry.data['Duration (min)']}m</span>
                                                                        {entry.data['Sleep Hours'] > 0 && <span className="flex items-center gap-1"><Moon className="w-3 h-3" /> {entry.data['Sleep Hours']}h sleep</span>}
                                                                        <span className="ml-auto px-2 py-0.5 text-[10px] uppercase rounded border border-white/10">{entry.data['Intensity']}</span>
                                                                    </div>
                                                                    {entry.data['Notes'] && <p className="text-xs text-white/50 italic line-clamp-2 border-t border-white/10 pt-2">{entry.data['Notes']}</p>}
                                                                </div>
                                                            ) : microappId === 'diet' ? (
                                                                <div className="space-y-4">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="text-[10px] uppercase tracking-wider text-white/40">{entry.data['Meal']}</span>
                                                                                <span className="text-[10px] uppercase tracking-wider text-white/40 mx-1">·</span>
                                                                                <span className="text-[10px] uppercase tracking-wider text-white/40">{entry.data['Date']}</span>
                                                                            </div>
                                                                            <h3 className={`${playfair.className} text-xl text-white`}>{entry.data['Plate Build'] || 'Meal Log'}</h3>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-2xl font-mono text-emerald-200">{entry.data['Calories']}</div>
                                                                            <div className="text-[10px] uppercase tracking-wider text-white/40">Kcal</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-3 gap-2 py-2 bg-white/5 rounded-lg border border-white/10 text-center">
                                                                        <div>
                                                                            <div className="text-lg font-mono">{entry.data['Protein (g)']}</div>
                                                                            <div className="text-[10px] text-white/40">PRO</div>
                                                                        </div>
                                                                        <div className="border-l border-white/10">
                                                                            <div className="text-lg font-mono">{entry.data['Carbs (g)']}</div>
                                                                            <div className="text-[10px] text-white/40">CARB</div>
                                                                        </div>
                                                                        <div className="border-l border-white/10">
                                                                            <div className="text-lg font-mono">{entry.data['Fats (g)']}</div>
                                                                            <div className="text-[10px] text-white/40">FAT</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-xs text-white/50">
                                                                        <span>💧 {entry.data['Hydration (glasses)']} glasses</span>
                                                                        <span>{entry.data['Mood After']}</span>
                                                                    </div>
                                                                </div>
                                                            ) : microappId === 'income' ? (
                                                                <div className="space-y-4">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{entry.data['Type']}</p>
                                                                            <h3 className={`${playfair.className} text-xl text-white`}>{entry.data['Source']}</h3>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-2xl font-mono text-emerald-400">+${Number(entry.data['Amount']).toLocaleString()}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="pt-2 border-t border-white/10 text-xs text-white/50">
                                                                        {entry.data['Notes'] || 'No notes'}
                                                                    </div>
                                                                </div>
                                                            ) : microappId === 'expenses' ? (
                                                                <div className="space-y-4">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{entry.data['Category']}</p>
                                                                            <h3 className={`${playfair.className} text-xl text-white`}>{entry.data['Description']}</h3>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-2xl font-mono text-rose-400">-${Number(entry.data['Amount']).toLocaleString()}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex justify-between pt-2 border-t border-white/10 text-xs text-white/50">
                                                                        <span>{entry.data['Payment Method']}</span>
                                                                        <span>{new Date(entry.data['Date']).toLocaleDateString()}</span>
                                                                    </div>
                                                                </div>
                                                            ) : microappId === 'subscriptions' ? (
                                                                <div className="space-y-4">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{entry.data['Category']}</p>
                                                                            <h3 className={`${playfair.className} text-xl text-white`}>{entry.data['Name']}</h3>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-2xl font-mono">${Number(entry.data['Amount']).toLocaleString()}</div>
                                                                            <div className="text-[10px] uppercase tracking-wider text-white/40">/{entry.data['Billing Cycle']}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-xs text-white/60">
                                                                        <Clock className="w-3 h-3" />
                                                                        Next Charge: {new Date(entry.data['Next Charge']).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                            ) : microappId === 'savings-goals' ? (
                                                                <div className="space-y-4">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{entry.data['Category']}</p>
                                                                            <h3 className={`${playfair.className} text-xl text-white`}>{entry.data['Goal Name']}</h3>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-xl font-mono text-emerald-200">${Number(entry.data['Current Amount']).toLocaleString()}</div>
                                                                            <div className="text-[10px] text-white/40">of ${Number(entry.data['Target Amount']).toLocaleString()}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <div className="flex justify-between text-[10px] text-white/40 uppercase tracking-wider">
                                                                            <span>Progress</span>
                                                                            <span>{Math.round((Number(entry.data['Current Amount']) / Number(entry.data['Target Amount'])) * 100)}%</span>
                                                                        </div>
                                                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                                                                                style={{ width: `${Math.min(100, (Number(entry.data['Current Amount']) / Number(entry.data['Target Amount'])) * 100)}%` }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : microappId === 'budget' ? (
                                                                <div className="space-y-4">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{entry.data['Month']}</p>
                                                                            <h3 className={`${playfair.className} text-xl text-white`}>{entry.data['Category']}</h3>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-xl font-mono">${Number(entry.data['Budgeted Amount']).toLocaleString()}</div>
                                                                            <div className="text-[10px] text-white/40">Budget</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-2 pt-2 border-t border-white/10">
                                                                        <div className="flex justify-between text-sm">
                                                                            <span className="text-white/60">Actual Spend</span>
                                                                            <span className="font-mono">${Number(entry.data['Actual Amount'] || 0).toLocaleString()}</span>
                                                                        </div>
                                                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                                            <div
                                                                                className={`h-full ${Number(entry.data['Actual Amount']) > Number(entry.data['Budgeted Amount']) ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                                                                style={{ width: `${Math.min(100, (Number(entry.data['Actual Amount'] || 0) / Number(entry.data['Budgeted Amount'])) * 100)}%` }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="grid md:grid-cols-2 gap-4">
                                                                    {Object.entries(entry.data).map(([key, value]) => (
                                                                        <div key={key} className="space-y-1">
                                                                            <p className="text-xs uppercase tracking-wider text-white/40">{key}</p>
                                                                            <p className={`${inter.className} text-white font-light`}>
                                                                                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
                                                                                    (relatedNames[String(value)] ? relatedNames[String(value)] : String(value))
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </>
                    )
                    }
                </div>
            </div>
        </div>
    )

}
