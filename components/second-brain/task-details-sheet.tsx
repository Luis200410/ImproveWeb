'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Entry } from '@/lib/data-store'
import {
    Maximize2, Link as LinkIcon, Calendar, Activity,
    Hash, Terminal, CheckCircle2, Trash2, Save
} from 'lucide-react'
import { Playfair_Display, Inter } from '@/lib/font-shim'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

interface TaskDetailsSheetProps {
    task: Entry
    trigger: React.ReactNode
    onUpdate?: (updates: Partial<Entry['data']>) => void
}

export function TaskDetailsSheet({ task, trigger, onUpdate }: TaskDetailsSheetProps) {
    const [open, setOpen] = useState(false)
    const [status, setStatus] = useState(task.data.Status || false)

    // Linked Note State
    const [noteId, setNoteId] = useState<string | null>(task.data.Notes || null)
    const [noteTitle, setNoteTitle] = useState('')
    const [noteContent, setNoteContent] = useState('')
    const [loadingNote, setLoadingNote] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Load referenced note on open
    useEffect(() => {
        if (open && task.data.Notes) {
            setLoadingNote(true)
            import('@/lib/data-store').then(({ dataStore }) => {
                dataStore.getEntry(task.data.Notes).then(note => {
                    if (note) {
                        setNoteId(note.id)
                        setNoteTitle(note.data.Title || '')
                        setNoteContent(note.data['Main Notes'] || '')
                    }
                    setLoadingNote(false)
                })
            })
        }
    }, [open, task.data.Notes])

    const handleSave = async () => {
        setIsSaving(true)
        const { dataStore } = await import('@/lib/data-store')

        if (noteId) {
            // Update existing linked note
            await dataStore.updateEntry(noteId, {
                'Title': noteTitle,
                'Main Notes': noteContent
            })
        } else {
            // Fallback: update task if no note linked (legacy support)
            if (onUpdate) {
                onUpdate({
                    Task: noteTitle,
                    Notes: noteContent // In legacy, notes might be storing content directly
                })
            }
        }
        setIsSaving(false)
        setOpen(false)
    }

    // Mock data based on the image if real data is missing
    const breadcrumbs = ['AREAS', 'OPERATIONS', (task.data.Project || 'Task Node').toUpperCase()]
    const createdDate = task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '2024-01-01'
    const lastSync = new Date().toLocaleTimeString() + ' UTC'

    // Generate a pseudo-code block for the aesthetic
    const configScript = `def initialize_node(id="${task.id.slice(0, 8)}"):
    protocol_v = "3.1.0-beta"
    if status == "${status ? 'COMPLETE' : 'PENDING'}":
        # Execute synaptic bridge
        bridge = Bridge(version=protocol_v)
        return bridge.connect(id)
    else:
        return await_signal()`

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {trigger}
            </SheetTrigger>
            <SheetContent className="bg-[#050505] border-l border-white/10 w-full sm:max-w-2xl p-0 flex flex-col z-[100]">
                {/* Header Section */}
                <div className="p-8 pb-4 border-b border-white/5 space-y-6">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-blue-400 font-mono">
                        {breadcrumbs.map((crumb, i) => (
                            <span key={i} className="flex items-center gap-2">
                                {crumb}
                                {i < breadcrumbs.length - 1 && <span className="text-white/20">›</span>}
                            </span>
                        ))}
                    </div>

                    {/* Accessible Title (Hidden) */}
                    <SheetTitle className="sr-only">
                        {noteTitle || task.data.Task || 'Task Details'}
                    </SheetTitle>

                    {/* Visual Title (Editable) */}
                    <div className="flex justify-between items-start gap-4">
                        {loadingNote ? (
                            <div className="h-10 w-3/4 bg-white/10 animate-pulse rounded" />
                        ) : (
                            <input
                                value={noteTitle || task.data.Task} // Fallback to task name if note title empty or loading
                                onChange={(e) => setNoteTitle(e.target.value)}
                                className={`${playfair.className} text-4xl text-white leading-tight bg-transparent border-none outline-none placeholder:text-white/20 w-full focus:ring-0 px-0`}
                                placeholder="Untitled Node"
                            />
                        )}
                        <Button variant="ghost" size="icon" className="text-white/30 hover:text-white shrink-0">
                            <Maximize2 className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-3 gap-8 pt-2">
                        <div className="space-y-1">
                            <p className="text-[9px] uppercase tracking-widest text-white/30">Created Date</p>
                            <div className="flex items-center gap-2 text-blue-400 text-xs font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {createdDate}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] uppercase tracking-widest text-white/30">Last Sync</p>
                            <p className="text-white/60 text-xs font-mono">{lastSync}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] uppercase tracking-widest text-white/30">Status</p>
                            <p className={`text-xs font-mono font-bold ${status ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {status ? 'ENCRYPTED' : 'ACTIVE_SIGNAL'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Body - Manual implementation since ScrollArea missing */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    {/* Overview / Note Content */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-400">
                            <Hash className="w-4 h-4" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">Linked Note Content</h3>
                        </div>
                        {loadingNote ? (
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-white/10 animate-pulse rounded" />
                                <div className="h-4 w-5/6 bg-white/10 animate-pulse rounded" />
                                <div className="h-4 w-4/6 bg-white/10 animate-pulse rounded" />
                            </div>
                        ) : (
                            <textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white/80 leading-relaxed font-light text-sm min-h-[300px] focus:outline-none focus:border-blue-500/50 transition-colors resize-none placeholder:text-white/20"
                                placeholder="Start writing your neural protocol..."
                            />
                        )}
                    </div>

                    {/* Code Block (Visual Sugar) */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] uppercase tracking-widest text-white/30">Configuration Script</span>
                            <span className="text-[9px] border border-blue-500/30 text-blue-400 h-5 px-1.5 rounded bg-blue-500/5 font-mono flex items-center">PYTHON</span>
                        </div>
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4 font-mono text-xs overflow-x-auto relative group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20" />
                            <pre className="text-blue-200/80">
                                <code>{configScript}</code>
                            </pre>
                        </div>
                    </div>

                    {/* Sub-tasks / Checklist */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-400">
                            <Hash className="w-4 h-4" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">Sub-tasks</h3>
                        </div>
                        <div className="space-y-3">
                            {/* Pseudocode for subtasks - simply rendered as unchecked for now */}
                            {['Initial synapse handshake', 'Verify data integrity', 'Commit protocol to mainnet'].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 group">
                                    <input
                                        type="checkbox"
                                        id={`st-${i}`}
                                        className="appearance-none w-5 h-5 rounded border border-white/20 checked:bg-blue-500 checked:border-blue-500 transition-colors cursor-pointer"
                                    />
                                    <label
                                        htmlFor={`st-${i}`}
                                        className="text-sm text-white/60 group-hover:text-white transition-colors cursor-pointer"
                                    >
                                        {item}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/10 bg-[#0A0A0A] flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">System Ready</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="text-white/40 hover:text-rose-400 text-xs uppercase tracking-widest hover:bg-transparent px-2">
                            Discard
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider px-6 py-5 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                            Commit Changes
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
