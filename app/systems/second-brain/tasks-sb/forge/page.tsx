'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { createClient } from '@/utils/supabase/client'
import { dataStore, Entry } from '@/lib/data-store'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CustomSelect } from '@/components/ui/custom-select'
import { DatePicker } from '@/components/ui/date-picker'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, Rocket, NotebookPen, ListTodo } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

type Option = { value: string; label: string }

export default function TaskForgePage() {
    const router = useRouter()
    const [userId, setUserId] = useState<string>('defaultUser')
    const [projects, setProjects] = useState<Option[]>([])
    const [notes, setNotes] = useState<Option[]>([])
    const [resources, setResources] = useState<Option[]>([])
    const [saving, setSaving] = useState(false)
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
    const [error, setError] = useState<string | null>(null)
    const [projectMode, setProjectMode] = useState<'select' | 'create'>('select')
    const [noteMode, setNoteMode] = useState<'select' | 'create'>('select')

    const [form, setForm] = useState<Record<string, any>>({
        Task: '',
        'Start Date': '',
        'End Date': '',
        Project: '',
        Notes: '',
        Resources: '',
        'Assignee': '',
        'Status': false,
        'Lane': 'pending'
    })

    const [projectDraft, setProjectDraft] = useState({ name: '', description: '', status: 'Active' })
    const [noteDraft, setNoteDraft] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        main: '',
        summary: ''
    })

    useEffect(() => {
        const loadUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUserId(user?.id || 'defaultUser')
        }
        loadUser()
    }, [])

    useEffect(() => {
        const loadRelations = async () => {
            const projEntries: Entry[] = await dataStore.getEntries('projects-sb', userId)
            const noteEntries: Entry[] = await dataStore.getEntries('notes-sb', userId)
            const resourceEntries: Entry[] = await dataStore.getEntries('resources-sb', userId)

            setProjects(projEntries.map(p => ({ value: p.id, label: p.data['Project Name'] || 'Untitled project' })))
            setNotes(noteEntries.map(n => ({ value: n.id, label: n.data['Title'] || 'Untitled note' })))
            setResources(resourceEntries.map(r => ({ value: r.id, label: r.data['Title'] || 'Resource' })))
        }
        loadRelations()
    }, [userId])

    const canSave = useMemo(() => {
        return form.Task.trim().length > 0 && form['Start Date'] && form.Project && form.Notes
    }, [form])

    const handleSave = async () => {
        if (!canSave || saving) return
        setSaving(true)
        setError(null)
        try {
            await dataStore.addEntry(userId, 'tasks-sb', {
                ...form,
                'Status': false,
                'Lane': 'pending'
            })
            router.push('/systems/second-brain')
        } catch (e: any) {
            setError('Could not save task. Please try again.')
            console.error(e)
        } finally {
            setSaving(false)
        }
    }

    const setField = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

    const createProject = async () => {
        const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
        const now = new Date().toISOString()
        const entry: Entry = {
            id,
            userId,
            microappId: 'projects-sb',
            data: {
                'Project Name': projectDraft.name,
                'Status': projectDraft.status,
                'Description': projectDraft.description
            },
            createdAt: now,
            updatedAt: now
        }
        await dataStore.saveEntry(entry)
        setProjects(prev => [...prev, { value: id, label: projectDraft.name }])
        return id
    }

    const createNote = async () => {
        const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
        const now = new Date().toISOString()
        const entry: Entry = {
            id,
            userId,
            microappId: 'notes-sb',
            data: {
                'Title': noteDraft.title,
                'Date': noteDraft.date,
                'Project': form.Project,
                'Main Notes': noteDraft.main,
                'Summary': noteDraft.summary
            },
            createdAt: now,
            updatedAt: now
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
        setStep((prev) => Math.min(4, (prev + 1) as 1 | 2 | 3 | 4))
    }
    const goPrev = () => setStep((prev) => Math.max(1, (prev - 1) as 1 | 2 | 3 | 4))

    return (
        <div className="min-h-screen bg-black text-white">
            <Navigation isAuthenticated />
            <div className="h-16" />

            <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
                <div className="flex items-center gap-3 text-white/60">
                    <Link href="/systems/second-brain" className="flex items-center gap-2 hover:text-white transition">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Link>
                    <span className="text-white/30">/</span>
                    <span className="uppercase tracking-[0.3em] text-xs">Forge Task</span>
                </div>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-amber-200" />
                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-white/50">Motion x PARA</p>
                            <CardTitle className={`${playfair.className} text-3xl text-white`}>Forge a Task</CardTitle>
                            <p className={`${inter.className} text-white/60`}>
                                Tasks must link to a Project and a Note so context stays attached.
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-3 text-white/70">
                            {[1, 2, 3, 4].map((s) => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full border border-white/20 flex items-center justify-center ${step === s ? 'bg-white text-black' : 'bg-white/5 text-white'}`}>
                                        {s}
                                    </div>
                                    {s < 4 && <div className="w-10 h-px bg-white/20" />}
                                </div>
                            ))}
                        </div>

                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-white/70">Task</label>
                                    <Input
                                        className="bg-white/5 border-white/10 text-white"
                                        value={form.Task}
                                        onChange={(e) => setField('Task', e.target.value)}
                                        placeholder="What needs to get done?"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-white/70">Assignee</label>
                                    <Input
                                        className="bg-white/5 border-white/10 text-white"
                                        value={form['Assignee']}
                                        onChange={(e) => setField('Assignee', e.target.value)}
                                        placeholder="Who will do it?"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-white/70">Start date</label>
                                    <DatePicker
                                        value={form['Start Date']}
                                        onChange={(val) => setField('Start Date', val)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-white/70">End date</label>
                                    <DatePicker
                                        value={form['End Date']}
                                        onChange={(val) => setField('End Date', val)}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                <div className="flex gap-3">
                                    <div
                                        className={`flex-1 p-4 rounded-xl border ${projectMode === 'select' ? 'border-white/40 bg-white/10' : 'border-white/10 bg-black/20'} cursor-pointer`}
                                        onClick={() => setProjectMode('select')}
                                    >
                                        <p className="text-sm text-white/70">Use existing project</p>
                                    </div>
                                    <div
                                        className={`flex-1 p-4 rounded-xl border ${projectMode === 'create' ? 'border-white/40 bg-white/10' : 'border-white/10 bg-black/20'} cursor-pointer`}
                                        onClick={() => setProjectMode('create')}
                                    >
                                        <p className="text-sm text-white/70">Create new project</p>
                                    </div>
                                </div>

                                {projectMode === 'select' ? (
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm text-white/70">
                                            <Rocket className="w-4 h-4 text-emerald-200" /> Project (required)
                                        </label>
                                        <CustomSelect
                                            value={form.Project}
                                            onChange={(val) => setField('Project', val)}
                                            options={projects}
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/70">Project name</label>
                                            <Input
                                                className="bg-white/5 border-white/10 text-white"
                                                value={projectDraft.name}
                                                onChange={(e) => setProjectDraft({ ...projectDraft, name: e.target.value })}
                                                placeholder="Launch website redesign"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/70">Status</label>
                                            <CustomSelect
                                                value={projectDraft.status}
                                                onChange={(val) => setProjectDraft({ ...projectDraft, status: val })}
                                                options={['Active', 'On Hold', 'Completed']}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm text-white/70">Description</label>
                                            <Textarea
                                                className="bg-white/5 border-white/10 text-white"
                                                value={projectDraft.description}
                                                onChange={(e) => setProjectDraft({ ...projectDraft, description: e.target.value })}
                                                placeholder="Scope, objectives, constraints..."
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                <div className="flex gap-3">
                                    <div
                                        className={`flex-1 p-4 rounded-xl border ${noteMode === 'select' ? 'border-white/40 bg-white/10' : 'border-white/10 bg-black/20'} cursor-pointer`}
                                        onClick={() => setNoteMode('select')}
                                    >
                                        <p className="text-sm text-white/70">Use existing note</p>
                                    </div>
                                    <div
                                        className={`flex-1 p-4 rounded-xl border ${noteMode === 'create' ? 'border-white/40 bg-white/10' : 'border-white/10 bg-black/20'} cursor-pointer`}
                                        onClick={() => setNoteMode('create')}
                                    >
                                        <p className="text-sm text-white/70">Create new note</p>
                                    </div>
                                </div>

                                {noteMode === 'select' ? (
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm text-white/70">
                                            <NotebookPen className="w-4 h-4 text-amber-200" /> Note (required)
                                        </label>
                                        <CustomSelect
                                            value={form.Notes}
                                            onChange={(val) => setField('Notes', val)}
                                            options={notes}
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm text-white/70">Note title</label>
                                                <Input
                                                    className="bg-white/5 border-white/10 text-white"
                                                    value={noteDraft.title}
                                                    onChange={(e) => setNoteDraft({ ...noteDraft, title: e.target.value })}
                                                    placeholder="Decision log, insights..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-white/70">Date</label>
                                                <DatePicker
                                                    value={noteDraft.date}
                                                    onChange={(val) => setNoteDraft({ ...noteDraft, date: val })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/70">Main notes</label>
                                            <Textarea
                                                className="bg-white/5 border-white/10 text-white"
                                                value={noteDraft.main}
                                                onChange={(e) => setNoteDraft({ ...noteDraft, main: e.target.value })}
                                                placeholder="What did you learn? Links, snippets, evidence."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/70">Summary</label>
                                            <Textarea
                                                className="bg-white/5 border-white/10 text-white"
                                                value={noteDraft.summary}
                                                onChange={(e) => setNoteDraft({ ...noteDraft, summary: e.target.value })}
                                                placeholder="TL;DR, next steps."
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                                <label className="text-sm text-white/70">Notes / context</label>
                                <Textarea
                                    className="bg-white/5 border-white/10 text-white"
                                    value={form['Context'] || ''}
                                    onChange={(e) => setField('Context', e.target.value)}
                                    placeholder="What does success look like? Links, acceptance criteria, risks."
                                />
                            </motion.div>
                        )}

                        {error && <div className="text-rose-300 text-sm">{error}</div>}

                        <div className="flex justify-between items-center">
                            <Button
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10"
                                onClick={step === 1 ? () => router.push('/systems/second-brain') : goPrev}
                            >
                                {step === 1 ? 'Cancel' : 'Back'}
                            </Button>
                            {step < 4 ? (
                                <Button
                                    className="bg-white text-black hover:bg-white/90"
                                    onClick={goNext}
                                    disabled={
                                        step === 1
                                            ? !form.Task.trim() || !form['Start Date']
                                            : step === 2
                                                ? (projectMode === 'select' ? !form.Project : !projectDraft.name.trim())
                                                : step === 3
                                                    ? (noteMode === 'select' ? !form.Notes : !noteDraft.title.trim())
                                                    : false
                                    }
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    className="bg-white text-black hover:bg-white/90"
                                    disabled={!canSave || saving}
                                    onClick={handleSave}
                                >
                                    {saving ? 'Saving...' : 'Save task'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
