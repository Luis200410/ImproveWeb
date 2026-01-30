
'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { FolderKanban, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react'
import { Playfair_Display } from '@/lib/font-shim'
import { createClient } from '@/utils/supabase/client'
import { dataStore, Entry } from '@/lib/data-store'
import { ProjectData } from './project-utils'

const playfair = Playfair_Display({ subsets: ['latin'] })

export function ProjectCreationSheet({ trigger, onProjectCreated }: { trigger?: React.ReactNode, onProjectCreated?: () => void }) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(1)
    const [saving, setSaving] = useState(false)
    const [userId, setUserId] = useState('defaultUser')

    // Initial State
    const [form, setForm] = useState<Partial<ProjectData>>({
        title: '',
        complexity: 'M',
        priority: 'P2',
        ragStatus: 'Green',
        status: 'backlog',
        subtasks: [],
        blockedBy: ''
    })

    const setField = (key: keyof ProjectData, value: any) => setForm(prev => ({ ...prev, [key]: value }))

    const handleSave = async () => {
        setSaving(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const uid = user?.id || 'defaultUser'

        const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
        const now = new Date().toISOString()

        // Ensure status is set
        const projectData: ProjectData = {
            title: form.title!,
            description: form.description,
            ragStatus: form.ragStatus || 'Green',
            subtasks: form.subtasks || [],
            startDate: form.startDate!,
            deadline: form.deadline!,
            complexity: form.complexity || 'M',
            priority: form.priority || 'P2',
            blockedBy: form.blockedBy,
            status: form.status || 'backlog'
        }

        const entry: Entry = {
            id,
            userId: uid,
            microappId: 'projects-sb',
            data: projectData,
            createdAt: now,
            updatedAt: now
        }

        await dataStore.saveEntry(entry)
        setSaving(false)
        setOpen(false)
        if (onProjectCreated) onProjectCreated()
        // Reset form
        setForm({ title: '', complexity: 'M', priority: 'P2', ragStatus: 'Green', subtasks: [], blockedBy: '' })
        setStep(1)
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

                    {/* Stage 1: Core Matrix */}
                    <div className={`transition-opacity duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                        <div className="space-y-4">
                            <label className="text-xs text-amber-500 uppercase tracking-wider font-bold flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-sm ${step >= 1 ? 'bg-amber-500' : 'bg-white/20'}`} />
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
                                    disabled={step > 1}
                                />
                            </div>

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

                    {/* Stage 2: Temporal Data */}
                    <div className={`transition-all duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                        <div className="space-y-4">
                            <label className="text-xs text-blue-500 uppercase tracking-wider font-bold flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-sm ${step >= 2 ? 'bg-blue-500' : 'bg-white/20'}`} />
                                Stage 02: Temporal Data
                            </label>

                            {step >= 2 && (
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
                            )}
                        </div>
                    </div>

                    {/* Stage 3: Operational Health */}
                    <div className={`transition-all duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                        <div className="space-y-4">
                            <label className="text-xs text-emerald-500 uppercase tracking-wider font-bold flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-sm ${step >= 3 ? 'bg-emerald-500' : 'bg-white/20'}`} />
                                Stage 03: Operational Health
                            </label>

                            {step >= 3 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* RAG Status (Simplified Terms) */}
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

                                        {/* Priority (Simplified Terms) */}
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
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-[#0A0A0A] flex justify-between items-center">
                    {step > 1 && (
                        <button
                            className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                            onClick={() => setStep(s => s - 1)}
                        >
                            Back
                        </button>
                    )}

                    <Button
                        onClick={() => step < 3 ? setStep(s => s + 1) : handleSave()}
                        disabled={saving || (step === 1 && !form.title)}
                        className="bg-amber-500 text-black hover:bg-amber-400 ml-auto font-bold tracking-wider"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : step === 3 ? 'Initialize Project' : 'Next Phase'}
                        {!saving && step < 3 && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                </div>

            </SheetContent>
        </Sheet>
    )
}
