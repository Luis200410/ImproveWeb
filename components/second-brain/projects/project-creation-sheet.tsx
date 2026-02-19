
'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { FolderKanban, AlertTriangle, ArrowRight, Loader2, Sparkles, CheckCircle2, Circle } from 'lucide-react'
import { Playfair_Display } from '@/lib/font-shim'
import { createClient } from '@/utils/supabase/client'
import { dataStore, Entry } from '@/lib/data-store'
import { ProjectData } from './project-utils'
import { generateProjectPlan, GeneratedTask } from '@/app/actions/project-architect'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const playfair = Playfair_Display({ subsets: ['latin'] })

export function ProjectCreationSheet({ trigger, onProjectCreated, areas = [], defaultAreaId }: {
    trigger?: React.ReactNode,
    onProjectCreated?: () => void,
    areas?: Entry[],
    defaultAreaId?: string
}) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(0) // 0 = Mode Selection
    const [saving, setSaving] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [mode, setMode] = useState<'manual' | 'ai'>('manual')

    // AI Architect State
    const [habits, setHabits] = useState<Entry[]>([])
    const [selectedHabitId, setSelectedHabitId] = useState<string>('')
    const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([])
    const [selectedTaskIndices, setSelectedTaskIndices] = useState<Set<number>>(new Set())

    // Initial State
    const [form, setForm] = useState<Partial<ProjectData>>({
        title: '',
        complexity: 'M',
        priority: 'P2',
        ragStatus: 'Green',
        status: 'backlog',
        subtasks: [],
        blockedBy: '',
        Area: defaultAreaId
    })

    // Update form when defaultAreaId changes or sheet opens
    useEffect(() => {
        if (open && defaultAreaId) {
            setForm(prev => ({ ...prev, Area: defaultAreaId === 'unassigned' ? undefined : defaultAreaId }))
        }
    }, [open, defaultAreaId])

    const setField = (key: keyof ProjectData, value: any) => setForm(prev => ({ ...prev, [key]: value }))

    // Load Habits for AI Mode
    useEffect(() => {
        if (open && mode === 'ai') {
            const loadHabits = async () => {
                const loadedHabits = await dataStore.getEntries('atomic-habits')
                setHabits(loadedHabits)
            }
            loadHabits()
        }
    }, [open, mode])

    const handleGeneratePlan = async () => {
        if (!form.title || !form.startDate || !form.deadline || !selectedHabitId) return

        setGenerating(true)
        try {
            const habit = habits.find(h => h.id === selectedHabitId)
            const tasks = await generateProjectPlan(
                form.title,
                form.description || form.title,
                habit?.data['Habit Name'] || 'General Work',
                form.startDate,
                form.deadline
            )
            setGeneratedTasks(tasks)
            // Select all by default
            setSelectedTaskIndices(new Set(tasks.map((_, i) => i)))
            setStep(5) // Move to selection view
        } catch (error: any) {
            console.error('Project Architect Error:', error)
            const errorMessage = error.message.includes('GEMINI_API_KEY')
                ? 'API Key missing. Please add GEMINI_API_KEY to .env.local'
                : 'Failed to generate plan. Please try again.'
            toast.error(errorMessage)
        } finally {
            setGenerating(false)
        }
    }

    const toggleTaskSelection = (index: number) => {
        const newSet = new Set(selectedTaskIndices)
        if (newSet.has(index)) {
            newSet.delete(index)
        } else {
            newSet.add(index)
        }
        setSelectedTaskIndices(newSet)
    }

    const handleSave = async () => {
        setSaving(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const uid = user?.id || 'defaultUser'

        const projectId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
        const now = new Date().toISOString()

        // 1. Save Project
        // 1. Save Project
        const projectData: ProjectData = {
            title: form.title!,
            description: form.description,
            ragStatus: form.ragStatus || 'Green',
            subtasks: form.subtasks || [], // Manual subtasks
            startDate: form.startDate!,
            deadline: form.deadline!,
            complexity: form.complexity || 'M',
            priority: form.priority || 'P2',
            blockedBy: form.blockedBy,
            status: form.status || 'backlog',
            Area: form.Area
        }

        const projectEntry: Entry = {
            id: projectId,
            userId: uid,
            microappId: 'projects-sb',
            data: projectData,
            createdAt: now,
            updatedAt: now
        }

        await dataStore.saveEntry(projectEntry)

        // 2. Save Generated Tasks (AI Mode)
        if (mode === 'ai' && generatedTasks.length > 0) {
            const selectedTasks = generatedTasks.filter((_, i) => selectedTaskIndices.has(i))

            for (const task of selectedTasks) {
                const taskEntry: Entry = {
                    id: crypto.randomUUID(),
                    userId: uid,
                    microappId: 'tasks-sb',
                    data: {
                        Title: task.title,
                        Status: 'To Do',
                        Project: projectId, // Link to new project
                        Habit: selectedHabitId, // Link to habit
                        DueDate: task.data.scheduled_date,
                        Duration: task.data.duration_mins,
                        Priority: task.data.is_essential ? 'High' : 'Medium',
                        Notes: `${task.data.description}\n\nTip: ${task.data.professional_tip}`
                    },
                    createdAt: now,
                    updatedAt: now
                }
                await dataStore.saveEntry(taskEntry)
            }
        }

        setSaving(false)
        setOpen(false)
        if (onProjectCreated) onProjectCreated()

        // Reset
        setForm({ title: '', complexity: 'M', priority: 'P2', ragStatus: 'Green', subtasks: [], blockedBy: '' })
        setStep(0)
        setMode('manual')
        setGeneratedTasks([])
        window.location.reload()
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button className="bg-[#0A0A0A] border border-white/10 hover:bg-white/5 text-white gap-2">
                        <FolderKanban className="w-4 h-4 text-amber-500" /> Initialize Project
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="bg-[#050505] border-l border-white/10 w-full sm:max-w-md p-0 flex flex-col z-[100]">
                <SheetHeader className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                        <FolderKanban className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">Forge: Project Construct</span>
                    </div>
                    <SheetTitle className={`${playfair.className} text-2xl text-white`}>
                        {form.title || "New Project Entity"}
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* Step 0: Mode Selection */}
                    {step === 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <label className="text-xs text-amber-500 uppercase tracking-wider font-bold">Select Construction Method</label>
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => { setMode('manual'); setStep(1) }}
                                    className="p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 text-left transition-all group"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-amber-500/10 rounded text-amber-500"><FolderKanban className="w-5 h-5" /></div>
                                        <div className="font-bold text-white">Manual Forge</div>
                                    </div>
                                    <p className="text-xs text-white/40">Build the project structure yourself. Standard input flow.</p>
                                </button>

                                <button
                                    onClick={() => { setMode('ai'); setStep(1) }}
                                    className="p-4 border border-amber-500/30 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 text-left transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-amber-500/20 rounded text-amber-500"><Sparkles className="w-5 h-5" /></div>
                                        <div className="font-bold text-white">AI Architect</div>
                                    </div>
                                    <p className="text-xs text-white/40">Gemini AI generates a realistic plan based on your habits.</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Manual & AI Flow Steps */}
                    {step > 0 && (
                        <>
                            {/* Stage 1: Core Matrix */}
                            <div className={`transition-opacity duration-500 ${step === 1 ? 'opacity-100' : 'hidden'}`}>
                                <div className="space-y-4">
                                    <label className="text-xs text-amber-500 uppercase tracking-wider font-bold flex items-center gap-2">
                                        Stage 01: Core Matrix
                                    </label>

                                    <div className="space-y-2">
                                        <label className="text-[10px] text-white/40 uppercase tracking-widest">Project Title</label>
                                        <Input
                                            className="bg-white/5 border-white/10 h-12 text-lg font-medium"
                                            placeholder="Project: Neural Overdrive"
                                            value={form.title}
                                            onChange={e => setField('title', e.target.value)}
                                            autoFocus
                                        />
                                    </div>

                                    {mode === 'ai' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-white/40 uppercase tracking-widest">Goal / Outcome</label>
                                            <Input
                                                className="bg-white/5 border-white/10"
                                                placeholder="What do you want to achieve?"
                                                value={form.description || ''}
                                                onChange={e => setField('description', e.target.value)}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] text-white/40 uppercase tracking-widest">Complexity (T-Shirt Size)</label>
                                        <div className="flex gap-2">
                                            {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => setField('complexity', size)}
                                                    className={`flex-1 py-3 text-xs font-mono border rounded transition-all ${form.complexity === size ? 'border-amber-500 text-amber-500 bg-amber-500/10' : 'border-white/10 text-white/40 hover:border-white/20'}`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stage 2: Temporal Data (Expanded for AI) */}
                            <div className={`transition-all duration-500 ${step === 2 ? 'opacity-100' : 'hidden'}`}>
                                <div className="space-y-4">
                                    <label className="text-xs text-blue-500 uppercase tracking-wider font-bold flex items-center gap-2">
                                        Stage 02: Temporal Data
                                    </label>

                                    {mode === 'ai' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-white/40 uppercase tracking-widest">Linked Habit (Time Source)</label>
                                            <select
                                                className="w-full bg-[#0A0A0A] border border-white/10 text-white p-2 rounded text-sm"
                                                value={selectedHabitId}
                                                onChange={e => setSelectedHabitId(e.target.value)}
                                            >
                                                <option value="">Select a Habit...</option>
                                                {habits.map(h => (
                                                    <option key={h.id} value={h.id}>{h.data['Habit Name']}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-white/40 uppercase tracking-widest">Start Date</label>
                                            <DatePicker
                                                value={form.startDate || ''}
                                                onChange={(val) => setField('startDate', val)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-white/40 uppercase tracking-widest">Deadline</label>
                                            <DatePicker
                                                value={form.deadline || ''}
                                                onChange={(val) => setField('deadline', val)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stage 3: Operational Health (Manual Only) */}
                            <div className={`transition-all duration-500 ${step === 3 ? 'opacity-100' : 'hidden'}`}>
                                <div className="space-y-4">
                                    <label className="text-xs text-emerald-500 uppercase tracking-wider font-bold flex items-center gap-2">
                                        Stage 03: Operational Health
                                    </label>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* RAG Status */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-white/40 uppercase tracking-widest">System Health</label>
                                                <div className="flex gap-1">
                                                    {[
                                                        { label: 'Critical', value: 'Red', style: 'bg-rose-500/20 text-rose-500 border-rose-500' },
                                                        { label: 'Risk', value: 'Amber', style: 'bg-amber-500/20 text-amber-500 border-amber-500' },
                                                        { label: 'Stable', value: 'Green', style: 'bg-emerald-500/20 text-emerald-500 border-emerald-500' }
                                                    ].map((item) => (
                                                        <button
                                                            key={item.value}
                                                            onClick={() => setField('ragStatus', item.value as any)}
                                                            className={`flex-1 py-3 text-[10px] font-bold uppercase rounded border transition-all ${form.ragStatus === item.value
                                                                ? item.style
                                                                : 'border-white/10 text-white/30 hover:bg-white/5'
                                                                }`}
                                                        >
                                                            {item.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Priority */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-white/40 uppercase tracking-widest">Priority Level</label>
                                                <div className="grid grid-cols-2 gap-1">
                                                    {[
                                                        { label: 'Critical', value: 'P0' },
                                                        { label: 'High', value: 'P1' },
                                                        { label: 'Normal', value: 'P2' },
                                                        { label: 'Low', value: 'P3' }
                                                    ].map((item) => (
                                                        <button
                                                            key={item.value}
                                                            onClick={() => setField('priority', item.value as any)}
                                                            className={`py-2 text-[10px] font-bold border rounded transition-all ${form.priority === item.value ? 'bg-white/10 border-white text-white' : 'border-white/10 text-white/30'
                                                                }`}
                                                        >
                                                            {item.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Blockers */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-2">
                                                <AlertTriangle className="w-3 h-3 text-rose-500" /> Active Constraints (Blockers)
                                            </label>
                                            <Input
                                                placeholder="Optional: What is blocking this project?"
                                                className="bg-white/5 border-white/10 text-rose-200 placeholder:text-rose-900/50"
                                                value={form.blockedBy || ''}
                                                onChange={e => setField('blockedBy', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stage 4: AI Generation (Loading) */}
                            {step === 4 && mode === 'ai' && (
                                <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse" />
                                        <Loader2 className="w-12 h-12 text-amber-500 animate-spin relative z-10" />
                                    </div>
                                    <h3 className="mt-6 font-serif text-xl text-white">Architecting Path...</h3>
                                    <p className="text-sm text-white/40">Aligning goals with neural habits</p>
                                </div>
                            )}

                            {/* Stage 5: AI Selection View */}
                            {step === 5 && mode === 'ai' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center bg-[#0A0A0A] pb-4 sticky top-0 z-10 border-b border-white/10">
                                        <div>
                                            <label className="text-xs text-purple-500 uppercase tracking-wider font-bold">Stage 03: Task Selection</label>
                                            <p className="text-[10px] text-white/40">{selectedTaskIndices.size} tasks selected for commit</p>
                                        </div>
                                        <Button
                                            size="sm" variant="ghost" className="text-xs text-white/40 h-6"
                                            onClick={() => {
                                                if (selectedTaskIndices.size === generatedTasks.length) {
                                                    setSelectedTaskIndices(new Set())
                                                } else {
                                                    setSelectedTaskIndices(new Set(generatedTasks.map((_, i) => i)))
                                                }
                                            }}
                                        >
                                            {selectedTaskIndices.size === generatedTasks.length ? 'Deselect All' : 'Select All'}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {generatedTasks.map((task, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => toggleTaskSelection(idx)}
                                                className={`
                                                    p-3 rounded-md border text-left transition-all cursor-pointer relative group
                                                    ${selectedTaskIndices.has(idx)
                                                        ? 'bg-amber-500/10 border-amber-500/50'
                                                        : 'bg-white/5 border-white/10 hover:bg-white/10 opacity-60'}
                                                `}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className={`text-xs font-bold ${selectedTaskIndices.has(idx) ? 'text-white' : 'text-white/50'}`}>
                                                                {task.title}
                                                            </div>
                                                            {task.data.is_essential && (
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-500 border border-rose-500/30 uppercase font-bold">
                                                                    Essential
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-white/40 line-clamp-1">{task.data.description}</p>
                                                        <div className="flex gap-4 mt-2 text-[9px] font-mono text-white/30">
                                                            <span>📅 {task.data.scheduled_date}</span>
                                                            <span>⏱️ {task.data.duration_mins}m</span>
                                                            <span className="uppercase">{task.data.phase}</span>
                                                        </div>
                                                    </div>
                                                    <div className={`
                                                        w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                                                        ${selectedTaskIndices.has(idx) ? 'bg-amber-500 border-amber-500 text-black' : 'border-white/20'}
                                                    `}>
                                                        {selectedTaskIndices.has(idx) && <CheckCircle2 className="w-3 h-3" />}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-[#0A0A0A] flex justify-between items-center">
                    {step > 0 && (
                        <button
                            className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                            onClick={() => {
                                if (step === 5) setStep(2) // Back from selection to temporal
                                else setStep(s => s - 1)
                            }}
                            disabled={generating}
                        >
                            Back
                        </button>
                    )}

                    {step > 0 && (
                        <Button
                            onClick={() => {
                                // Logic flow controller
                                if (mode === 'manual') {
                                    step < 3 ? setStep(s => s + 1) : handleSave()
                                } else {
                                    // AI Mode
                                    if (step === 1) setStep(2)
                                    else if (step === 2) {
                                        setStep(4) // Show loading
                                        handleGeneratePlan()
                                    }
                                    else if (step === 5) handleSave()
                                }
                            }}
                            disabled={
                                saving || generating ||
                                (step === 1 && (!form.title || !form.Area)) ||
                                (step === 2 && mode === 'ai' && !selectedHabitId)
                            }
                            className="bg-amber-500 text-black hover:bg-amber-400 ml-auto font-bold tracking-wider"
                        >
                            {saving || generating ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                (step === 3 && mode === 'manual') || (step === 5 && mode === 'ai') ? 'Commit Protocol' : 'Next Phase'}
                            {!saving && !generating && <ArrowRight className="w-4 h-4 ml-2" />}
                        </Button>
                    )}
                </div>

            </SheetContent>
        </Sheet>
    )
}
