'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { createClient } from '@/utils/supabase/client'
import { dataStore, Entry } from '@/lib/data-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CustomSelect } from '@/components/ui/custom-select'
import { DatePicker } from '@/components/ui/date-picker'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Plus, Sparkles, Rocket, NotebookPen, ArrowRight, Loader2 } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

type Option = { value: string; label: string }

export function TaskCreationSheet({ trigger }: { trigger?: React.ReactNode }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [userId, setUserId] = useState<string>('defaultUser')
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
    const [saving, setSaving] = useState(false)

    // Data for relations
    const [projects, setProjects] = useState<Option[]>([])
    const [notes, setNotes] = useState<Option[]>([])

    // Form State
    const [form, setForm] = useState<Record<string, any>>({
        Task: '',
        'Start Date': new Date(),
        'End Date': '',
        Project: '',
        Notes: '',
        'Assignee': '',
        'Status': false,
        'Lane': 'pending'
    })

    // Modes
    const [projectMode, setProjectMode] = useState<'select' | 'create'>('select')
    const [noteMode, setNoteMode] = useState<'select' | 'create'>('select')

    // Drafts
    const [projectDraft, setProjectDraft] = useState({ name: '', description: '', status: 'Active' })
    const [noteDraft, setNoteDraft] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        main: '',
        summary: ''
    })

    useEffect(() => {
        if (open) {
            loadData()
        }
    }, [open])

    const loadData = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const uid = user?.id || 'defaultUser'
        setUserId(uid)

        const projEntries = await dataStore.getEntries('projects-sb', uid)
        const noteEntries = await dataStore.getEntries('notes-sb', uid)

        setProjects(projEntries.map(p => ({ value: p.id, label: p.data['Project Name'] || 'Untitled' })))
        setNotes(noteEntries.map(n => ({ value: n.id, label: n.data['Title'] || 'Untitled' })))
    }

    const setField = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

    // Logic from Forge
    const createProject = async () => {
        const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
        const now = new Date().toISOString()
        const entry: Entry = {
            id, userId, microappId: 'projects-sb',
            data: { 'Project Name': projectDraft.name, 'Status': projectDraft.status, 'Description': projectDraft.description },
            createdAt: now, updatedAt: now
        }
        await dataStore.saveEntry(entry)
        setProjects(prev => [...prev, { value: id, label: projectDraft.name }])
        return id
    }

    const createNote = async () => {
        const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
        const now = new Date().toISOString()
        const entry: Entry = {
            id, userId, microappId: 'notes-sb',
            data: {
                'Title': noteDraft.title, 'Date': noteDraft.date,
                'Project': form.Project, 'Main Notes': noteDraft.main, 'Summary': noteDraft.summary
            },
            createdAt: now, updatedAt: now
        }
        await dataStore.saveEntry(entry)
        setNotes(prev => [...prev, { value: id, label: noteDraft.title }])
        return id
    }

    const goNext = async () => {
        if (step === 2 && projectMode === 'create') {
            if (!projectDraft.name.trim()) return
            const id = await createProject()
            setForm(prev => ({ ...prev, Project: id }))
        }
        if (step === 3 && noteMode === 'create') {
            if (!noteDraft.title.trim()) return
            const id = await createNote()
            setForm(prev => ({ ...prev, Notes: id }))
        }
        setStep(prev => (prev < 4 ? prev + 1 : 4) as any)
    }

    const handleSave = async () => {
        if (saving) return
        setSaving(true)
        try {
            await dataStore.addEntry(userId, 'tasks-sb', { ...form, 'Status': false, 'Lane': 'pending' })
            setOpen(false)
            setStep(1)
            setForm({
                Task: '', 'Start Date': new Date(), 'End Date': '', Project: '', Notes: '',
                'Assignee': '', 'Status': false, 'Lane': 'pending'
            })
            // Force refresh if needed, or let optimistic UI handle it (but this is global add, so usually needs manual refresh or SWR)
            window.location.reload() // Simple brute force for now to ensure all views update
        } catch (e) {
            console.error(e)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button className="bg-white text-black hover:bg-white/90 gap-2">
                        <Plus className="w-4 h-4" /> New Task
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="bg-[#0A0A0A] border-l border-white/10 w-full sm:max-w-md p-0 flex flex-col">
                <SheetHeader className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">Forge</span>
                    </div>
                    <SheetTitle className={`${playfair.className} text-2xl text-white`}>New Neural Fragment</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    {/* Progress */}
                    <div className="flex items-center gap-2 mb-8">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-amber-500' : 'bg-white/10'}`} />
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-white/50 uppercase tracking-wider">Parameters</label>
                                    <Input
                                        placeholder="Task Directive..."
                                        className="bg-white/5 border-white/10 h-12 text-lg"
                                        value={form.Task}
                                        onChange={e => setField('Task', e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-white/50 uppercase tracking-wider">Timeline</label>
                                        <DatePicker value={form['Start Date']} onChange={d => setField('Start Date', d)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-white/50 uppercase tracking-wider">Agent</label>
                                        <Input
                                            placeholder="Me"
                                            className="bg-white/5 border-white/10"
                                            value={form['Assignee']}
                                            onChange={e => setField('Assignee', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-wider">
                                        <Rocket className="w-3 h-3 text-emerald-500" /> Project Context
                                    </label>

                                    <div className="flex gap-2 mb-4">
                                        <button
                                            onClick={() => setProjectMode('select')}
                                            className={`flex-1 py-2 text-xs rounded border transition-colors ${projectMode === 'select' ? 'bg-white/10 border-white/40 text-white' : 'border-transparent text-white/30'}`}
                                        >
                                            Select
                                        </button>
                                        <button
                                            onClick={() => setProjectMode('create')}
                                            className={`flex-1 py-2 text-xs rounded border transition-colors ${projectMode === 'create' ? 'bg-white/10 border-white/40 text-white' : 'border-transparent text-white/30'}`}
                                        >
                                            Create New
                                        </button>
                                    </div>

                                    {projectMode === 'select' ? (
                                        <CustomSelect
                                            options={projects}
                                            value={form.Project}
                                            onChange={v => setField('Project', v)}
                                            placeholder="Select active project..."
                                        />
                                    ) : (
                                        <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
                                            <Input
                                                placeholder="Project Name"
                                                className="bg-transparent border-white/10"
                                                value={projectDraft.name}
                                                onChange={e => setProjectDraft(p => ({ ...p, name: e.target.value }))}
                                            />
                                            <Textarea
                                                placeholder="Brief scope..."
                                                className="bg-transparent border-white/10 min-h-[80px]"
                                                value={projectDraft.description}
                                                onChange={e => setProjectDraft(p => ({ ...p, description: e.target.value }))}
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-wider">
                                        <NotebookPen className="w-3 h-3 text-purple-500" /> Neural Link
                                    </label>

                                    <div className="flex gap-2 mb-4">
                                        <button
                                            onClick={() => setNoteMode('select')}
                                            className={`flex-1 py-2 text-xs rounded border transition-colors ${noteMode === 'select' ? 'bg-white/10 border-white/40 text-white' : 'border-transparent text-white/30'}`}
                                        >
                                            Link Existing
                                        </button>
                                        <button
                                            onClick={() => setNoteMode('create')}
                                            className={`flex-1 py-2 text-xs rounded border transition-colors ${noteMode === 'create' ? 'bg-white/10 border-white/40 text-white' : 'border-transparent text-white/30'}`}
                                        >
                                            New Note
                                        </button>
                                    </div>

                                    {noteMode === 'select' ? (
                                        <CustomSelect
                                            options={notes}
                                            value={form.Notes}
                                            onChange={v => setField('Notes', v)}
                                            placeholder="Search knowledge base..."
                                        />
                                    ) : (
                                        <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
                                            <Input
                                                placeholder="Note Title"
                                                className="bg-transparent border-white/10"
                                                value={noteDraft.title}
                                                onChange={e => setNoteDraft(n => ({ ...n, title: e.target.value }))}
                                            />
                                            <Textarea
                                                placeholder="Key insights..."
                                                className="bg-transparent border-white/10 min-h-[80px]"
                                                value={noteDraft.main}
                                                onChange={e => setNoteDraft(n => ({ ...n, main: e.target.value }))}
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-white/50 uppercase tracking-wider">Final Analysis</label>
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                                        <h3 className="text-lg font-medium text-white">{form.Task}</h3>
                                        <div className="flex gap-4 text-xs text-white/50">
                                            <span>Starts: {form['Start Date'] ? new Date(form['Start Date']).toLocaleDateString() : 'TBD'}</span>
                                            <span>Project: {projects.find(p => p.value === form.Project)?.label || projectDraft.name || 'None'}</span>
                                        </div>
                                    </div>
                                    <Textarea
                                        placeholder="Additional context/success criteria..."
                                        className="bg-white/5 border-white/10 min-h-[100px]"
                                        value={form['Context'] || ''}
                                        onChange={e => setField('Context', e.target.value)}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-6 border-t border-white/10 bg-[#0A0A0A] flex justify-between items-center">
                    {step > 1 ? (
                        <Button variant="ghost" className="text-white/50 hover:text-white" onClick={() => setStep(prev => (prev - 1) as any)}>
                            Back
                        </Button>
                    ) : (
                        <div />
                    )}

                    <Button
                        onClick={step === 4 ? handleSave : goNext}
                        disabled={saving || (step === 1 && !form.Task)}
                        className="bg-amber-500 text-black hover:bg-amber-400"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : step === 4 ? 'Initialize Node' : 'Next Phase'}
                        {!saving && step < 4 && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
