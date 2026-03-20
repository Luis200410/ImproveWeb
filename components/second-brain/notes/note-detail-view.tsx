'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Activity, Database, Cpu, Command, Hash, ChevronDown, Plus, Trash2, ArrowLeft, Rocket, LayoutGrid, ListTodo } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Entry } from '@/lib/data-store'
import { Bebas_Neue } from '@/lib/font-shim'
import { NeuralEditor } from './neural-editor'

import { ProjectEntry } from '@/components/second-brain/projects/project-utils'

const bebas = Bebas_Neue({ subsets: ['latin'] })

interface NoteDetailViewProps {
    note: Entry
    onClose: () => void
    onUpdate: (id: string, updates: Partial<Entry['data']>) => void
    onDelete?: (id: string) => void
    projectMap: Record<string, string>
    areaMap: Record<string, string>
    taskMap: Record<string, string>
    projects?: ProjectEntry[]
    areas?: Entry[]
    tasks?: Entry[]
    isPopupMode?: boolean
    onTogglePopup?: () => void
}

export function NoteDetailView({
    note, onClose, onUpdate, onDelete, projectMap, areaMap, taskMap,
    projects = [], areas = [], tasks = [], isPopupMode, onTogglePopup
}: NoteDetailViewProps) {
    const [content, setContent] = useState(note.data['Main Notes'] || '')
    const [title, setTitle] = useState(note.data.Title || '')
    const [facts, setFacts] = useState<string[]>(Array.isArray(note.data.Facts) ? note.data.Facts : [])
    const [keywords, setKeywords] = useState<{ keyword: string, meaning: string }[]>(Array.isArray(note.data.Keywords) ? note.data.Keywords : [])
    const [formulas, setFormulas] = useState<string[]>(Array.isArray(note.data.Formulas) ? note.data.Formulas : [])

    const [newFact, setNewFact] = useState('')
    const [newKeywordName, setNewKeywordName] = useState('')
    const [newKeywordMeaning, setNewKeywordMeaning] = useState('')
    const [newFormula, setNewFormula] = useState('')

    const [editMode, setEditMode] = useState(false)
    const [isImagePromptOpen, setIsImagePromptOpen] = useState(false)
    const [imageUrl, setImageUrl] = useState('')
    const [targetEditor, setTargetEditor] = useState<any>(null)

    const [isFactsExpanded, setIsFactsExpanded] = useState(true)
    const [isKeywordsExpanded, setIsKeywordsExpanded] = useState(true)
    const [isFormulasExpanded, setIsFormulasExpanded] = useState(true)

    const editorSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const handler = (e: any) => {
            setIsImagePromptOpen(true)
            setTargetEditor(e.detail.editor)
            setImageUrl('')
        }
        window.addEventListener('neural-editor-add-image', handler as any)
        return () => window.removeEventListener('neural-editor-add-image', handler as any)
    }, [])

    // Clear all pending timeouts to prevent "entry not found" errors after deletion
    const cleanupTimeouts = useCallback(() => {
        if (editorSaveTimeoutRef.current) {
            clearTimeout(editorSaveTimeoutRef.current)
            editorSaveTimeoutRef.current = null
        }
        if (titleSaveTimeoutRef.current) {
            clearTimeout(titleSaveTimeoutRef.current)
            titleSaveTimeoutRef.current = null
        }
    }, [])

    useEffect(() => {
        return () => cleanupTimeouts()
    }, [cleanupTimeouts])

    useEffect(() => {
        setContent(note.data['Main Notes'] || '')
        setTitle(note.data.Title || '')
        setFacts(Array.isArray(note.data.Facts) ? note.data.Facts : [])
        setKeywords(Array.isArray(note.data.Keywords) ? note.data.Keywords : [])
        setFormulas(Array.isArray(note.data.Formulas) ? note.data.Formulas : [])
    }, [note.id]) // Only reset when note.id changes, not on every note update from parent

    const handleDelete = useCallback(() => {
        if (confirm('Are you sure you want to delete this note?')) {
            cleanupTimeouts()
            if (onDelete) onDelete(note.id)
        }
    }, [note.id, onDelete, cleanupTimeouts])

    const handleEditorChange = useCallback((newContent: string) => {
        // Defer local state update to next tick to avoid React flushSync error during Tiptap update
        setTimeout(() => {
            setContent(newContent)
        }, 0)

        if (editorSaveTimeoutRef.current) clearTimeout(editorSaveTimeoutRef.current)
        editorSaveTimeoutRef.current = setTimeout(() => {
            onUpdate(note.id, { 'Main Notes': newContent })
        }, 1000)
    }, [note.id, onUpdate])

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value
        setTitle(newTitle)

        if (titleSaveTimeoutRef.current) clearTimeout(titleSaveTimeoutRef.current)
        titleSaveTimeoutRef.current = setTimeout(() => {
            onUpdate(note.id, { 'Title': newTitle })
        }, 800)
    }, [note.id, onUpdate])

    const handleAddFact = () => {
        if (!newFact.trim()) return
        const updated = [...facts, newFact.trim()]
        setFacts(updated)
        setNewFact('')
        onUpdate(note.id, { Facts: updated })
    }

    const handleDeleteFact = (index: number) => {
        const updated = facts.filter((_, i) => i !== index)
        setFacts(updated)
        onUpdate(note.id, { Facts: updated })
    }

    const handleAddKeyword = () => {
        if (!newKeywordName.trim() || !newKeywordMeaning.trim()) return
        const updated = [...keywords, { keyword: newKeywordName.trim(), meaning: newKeywordMeaning.trim() }]
        setKeywords(updated)
        setNewKeywordName('')
        setNewKeywordMeaning('')
        onUpdate(note.id, { Keywords: updated })
    }

    const handleDeleteKeyword = (index: number) => {
        const updated = keywords.filter((_, i) => i !== index)
        setKeywords(updated)
        onUpdate(note.id, { Keywords: updated })
    }

    const handleAddFormula = () => {
        if (!newFormula.trim()) return
        const updated = [...formulas, newFormula.trim()]
        setFormulas(updated)
        setNewFormula('')
        onUpdate(note.id, { Formulas: updated })
    }

    const handleDeleteFormula = (index: number) => {
        const updated = formulas.filter((_, i) => i !== index)
        setFormulas(updated)
        onUpdate(note.id, { Formulas: updated })
    }

    const handleAddImage = () => {
        if (!imageUrl.trim() || !targetEditor) return
        targetEditor.chain().focus().setImage({ src: imageUrl.trim() }).run()
        setIsImagePromptOpen(false)
        setImageUrl('')
    }

    const projectName = note.data.Project ? projectMap[note.data.Project] : 'UNLINKED'
    // Ensure taskMap exists and task ID is valid before access
    const taskName = (note.data.Task && taskMap && taskMap[note.data.Task]) ? taskMap[note.data.Task] : 'NO_OPS'

    const filteredProjects = projects;

    const filteredTasks = tasks.filter(t => {
        if (note.data.Project) {
            return t.data.Project === note.data.Project || t.data.projectId === note.data.Project;
        }
        return true;
    });

    return (
        <div className="h-full flex flex-col bg-[#050505] border-l border-white/10 relative overflow-hidden">
            {/* Global Site Header Clearance Offset - Vital for persistent navigation */}
            <div className="h-32 lg:h-28 shrink-0 pointer-events-none" aria-hidden="true" />

            {/* Header / Active Session Indicator */}
            <div className="flex flex-col border-b border-white/10 bg-[#0A0A0A] shrink-0 relative shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                {/* Row 1: Session Navigation & Controls */}
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <button 
                            onClick={onClose} 
                            className="p-2 -ml-2 text-white/40 hover:text-white transition-colors shrink-0 flex items-center group"
                            title="Back to Board"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </button>

                        <div className="h-6 w-px bg-white/10 mx-1 shrink-0" />

                        {onTogglePopup && (
                            <button
                                onClick={onTogglePopup}
                                className="p-2 text-white/40 hover:text-amber-500 transition-colors shrink-0"
                                title={isPopupMode ? "Dock Sidebar" : "Pop-up Note"}
                            >
                                <ExternalLink className={`w-4 h-4 ${isPopupMode ? 'text-amber-500' : ''}`} />
                            </button>
                        )}

                        <div className="h-6 w-px bg-white/10 mx-1 shrink-0" />

                        <input
                            value={title}
                            onChange={handleTitleChange}
                            className={`${bebas.className} text-xl lg:text-2xl text-white bg-transparent border-none flex-1 focus:outline-none focus:ring-0 placeholder:text-white/10 truncate min-w-[50px] uppercase tracking-wider`}
                            placeholder="INITIALIZING_SEQUENCE..."
                        />
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-4">
                        <div className="hidden xl:flex flex-col items-end mr-4">
                            <span className="font-mono text-[8px] text-white/10 uppercase tracking-[0.3em]">Sequence_Origin</span>
                            <span className="font-mono text-[9px] text-white/30 uppercase tracking-[0.1em]">N-{note.id.slice(0, 12)}</span>
                        </div>

                        {onDelete && (
                            <button 
                                onClick={handleDelete}
                                className="p-2 text-white/20 hover:text-rose-500 transition-colors shrink-0"
                                title="Delete Note"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        
                        <div className="h-4 w-px bg-white/10 mx-1 shrink-0 px-[1px]" />

                        <button onClick={onClose} className="p-2 text-white/20 hover:text-amber-500 transition-colors shrink-0">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Row 2: Matrix Context (Project & Ops) */}
                <div className="flex items-center gap-12 px-10 pb-5 pt-0 border-t border-white/[0.02]">
                    {/* Project Association */}
                    <div className="flex flex-col gap-1.5 min-w-[160px]">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/15 font-mono">
                            <Rocket className="w-2.5 h-2.5 text-blue-500/50" />
                            Associated_Project
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center justify-between gap-4 bg-white/[0.01] border border-white/5 text-white/60 px-3 py-2 rounded hover:bg-white/[0.04] hover:border-white/10 transition-all group w-fit min-w-[220px]">
                                    <span className="text-[11px] font-mono truncate">{note.data.Project ? (projects.find(p => p.id === note.data.Project)?.data['Project Name'] || projects.find(p => p.id === note.data.Project)?.data.title || 'Untitled Project') : 'NONE'}</span>
                                    <ChevronDown className="w-3 h-3 text-white/10 group-hover:text-amber-500 transition-colors shrink-0" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 bg-[#0A0A0A] border-white/10 text-white/70 max-h-[400px] overflow-y-auto custom-scrollbar shadow-2xl" align="start">
                                <DropdownMenuRadioGroup value={note.data.Project || ''} onValueChange={(val) => onUpdate(note.id, { Project: val || null })}>
                                    <DropdownMenuRadioItem value="" className="text-xs focus:bg-white/10 cursor-pointer py-2">
                                        [ NO_PROJECT_LINK ]
                                    </DropdownMenuRadioItem>
                                    {projects.map(p => (
                                        <DropdownMenuRadioItem key={p.id} value={p.id} className="text-xs focus:bg-white/10 cursor-pointer py-2">
                                            {p.data['Project Name'] || p.data.title || 'Untitled Project'}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Operational Association */}
                    <div className="flex flex-col gap-1.5 min-w-[160px]">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/15 font-mono">
                            <ListTodo className="w-2.5 h-2.5 text-emerald-500/50" />
                            Active_Operation
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center justify-between gap-4 bg-white/[0.01] border border-white/5 text-white/60 px-3 py-2 rounded hover:bg-white/[0.04] hover:border-white/10 transition-all group w-fit min-w-[220px]">
                                    <span className="text-[11px] font-mono truncate">{taskName}</span>
                                    <ChevronDown className="w-3 h-3 text-white/10 group-hover:text-emerald-500 transition-colors shrink-0" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 bg-[#0A0A0A] border-white/10 text-white/70 max-h-[400px] overflow-y-auto custom-scrollbar shadow-2xl" align="start">
                                <DropdownMenuRadioGroup value={note.data.Task || ''} onValueChange={(val) => onUpdate(note.id, { Task: val || null, taskId: val || null })}>
                                    <DropdownMenuRadioItem value="" className="text-xs focus:bg-white/10 cursor-pointer py-2">
                                        [ INBOX / UNASSIGNED ]
                                    </DropdownMenuRadioItem>
                                    {filteredTasks.map(t => (
                                        <DropdownMenuRadioItem key={t.id} value={t.id} className="text-xs focus:bg-white/10 cursor-pointer py-2">
                                            {t.data.Task || t.data.Title || t.data.title || 'Untitled Operational'}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex">
                {/* Left Column: Metadata / Facts / Keywords / Formulas */}
                <div className="w-72 border-r border-white/10 flex flex-col hidden lg:flex bg-[#080808] overflow-y-auto custom-scrollbar pt-6">

                    {/* FACTS SECTION */}
                    <div className="p-6 border-b border-white/10">
                        <button 
                            onClick={() => setIsFactsExpanded(!isFactsExpanded)}
                            className="flex items-center justify-between w-full mb-4 text-emerald-500 hover:text-emerald-400 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Database className="w-3 h-3" />
                                <span className="text-[10px] uppercase tracking-widest font-bold">Facts</span>
                            </div>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isFactsExpanded ? '' : '-rotate-90'}`} />
                        </button>
                        
                        {isFactsExpanded && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-2">
                                    <input
                                        value={newFact}
                                        onChange={(e) => setNewFact(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddFact()}
                                        placeholder="Add a concrete fact..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                                    />
                                    <button onClick={handleAddFact} className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded transition-colors">
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                                {facts.length > 0 && (
                                    <ul className="space-y-2 mt-3">
                                        {facts.map((fact, i) => (
                                            <li key={i} className="flex items-start gap-2 group">
                                                <div className="w-1 h-1 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                                                <span className="text-xs text-white/70 flex-1 break-words leading-relaxed">{fact}</span>
                                                <button onClick={() => handleDeleteFact(i)} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-rose-500 transition-all shrink-0">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    {/* KEYWORDS SECTION */}
                    <div className="p-6 border-b border-white/10">
                        <button 
                            onClick={() => setIsKeywordsExpanded(!isKeywordsExpanded)}
                            className="flex items-center justify-between w-full mb-4 text-amber-500 hover:text-amber-400 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Hash className="w-3 h-3" />
                                <span className="text-[10px] uppercase tracking-widest font-bold">Keywords</span>
                            </div>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isKeywordsExpanded ? '' : '-rotate-90'}`} />
                        </button>
                        
                        {isKeywordsExpanded && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex flex-col gap-2">
                                    <input
                                        value={newKeywordName}
                                        onChange={(e) => setNewKeywordName(e.target.value)}
                                        placeholder="Keyword"
                                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs font-bold text-amber-500 focus:outline-none focus:border-amber-500/50"
                                    />
                                    <div className="flex items-start gap-2">
                                        <textarea
                                            value={newKeywordMeaning}
                                            onChange={(e) => setNewKeywordMeaning(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault()
                                                    handleAddKeyword()
                                                }
                                            }}
                                            placeholder="Meaning..."
                                            className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-amber-500/50 resize-none min-h-[40px] custom-scrollbar"
                                        />
                                        <button onClick={handleAddKeyword} className="p-1.5 h-[40px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded transition-colors flex items-center justify-center shrink-0">
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                {keywords.length > 0 && (
                                    <ul className="space-y-3 mt-3">
                                        {keywords.map((kw, i) => (
                                            <li key={i} className="flex items-start gap-2 group bg-white/[0.02] p-2 rounded border border-white/5">
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-bold text-amber-500 mb-1 truncate">{kw.keyword}</div>
                                                    <div className="text-[11px] text-white/60 leading-relaxed break-words">{kw.meaning}</div>
                                                </div>
                                                <button onClick={() => handleDeleteKeyword(i)} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-rose-500 transition-all shrink-0">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    {/* FORMULAS SECTION */}
                    <div className="p-6">
                        <button 
                            onClick={() => setIsFormulasExpanded(!isFormulasExpanded)}
                            className="flex items-center justify-between w-full mb-4 text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Command className="w-3 h-3" />
                                <span className="text-[10px] uppercase tracking-widest font-bold">Formulas</span>
                            </div>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isFormulasExpanded ? '' : '-rotate-90'}`} />
                        </button>
                        
                        {isFormulasExpanded && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex flex-col gap-2">
                                    <textarea
                                        value={newFormula}
                                        onChange={(e) => setNewFormula(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                handleAddFormula()
                                            }
                                        }}
                                        placeholder="Enter mental model, equation, or formula..."
                                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-purple-400 focus:outline-none focus:border-purple-500/50 resize-none min-h-[60px] custom-scrollbar"
                                    />
                                    <button onClick={handleAddFormula} className="w-full py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded transition-colors flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider font-bold">
                                        <Plus className="w-3 h-3" /> Add Formula
                                    </button>
                                </div>
                                {formulas.length > 0 && (
                                    <ul className="space-y-2 mt-3 block">
                                        {formulas.map((formula, i) => (
                                            <li key={i} className="group relative bg-[#111] border border-purple-500/20 p-3 rounded font-mono text-[10px] text-purple-300 break-words leading-relaxed">
                                                {formula}
                                                <button onClick={() => handleDeleteFormula(i)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-[#111] text-white/30 hover:text-rose-500 transition-all">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Note Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12 relative">
                    <div className="max-w-3xl mx-auto space-y-8">

                        <div className="min-h-[500px]">
                            <NeuralEditor
                                initialContent={content}
                                onChange={handleEditorChange}
                            />
                        </div>

                        <div className="pt-12 mt-12 border-t border-white/10">
                            <div className="flex items-center gap-2 mb-4 text-emerald-500">
                                <Cpu className="w-4 h-4" />
                                <span className="text-[10px] uppercase tracking-widest font-bold">Resources_Synthesis</span>
                            </div>
                            <p className="text-sm text-white/60 leading-relaxed max-w-2xl font-mono">
                                {note.data.Summary || 'No synthesis generated for this resource.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Image Prompt Modal */}
            <AnimatePresence>
                {isImagePromptOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                        onClick={() => setIsImagePromptOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#0A0A0A] border border-white/10 p-8 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-md relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute -top-px -left-px w-8 h-8 border-t-2 border-l-2 border-amber-500/50 rounded-tl-xl" />
                            <div className="absolute -bottom-px -right-px w-8 h-8 border-b-2 border-r-2 border-amber-500/50 rounded-br-xl" />
                            
                            <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-amber-500 mb-8 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                Neural Image Processor
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">Resource_Remote_URL</label>
                                    <input 
                                        autoFocus
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                                        placeholder="HTTPS://SOURCE.NEURAL/DATA.JPG..."
                                        className="w-full bg-white/[0.03] border border-white/10 p-4 rounded text-xs font-mono text-white focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-white/10 uppercase"
                                    />
                                </div>
                                
                                <div className="flex justify-end gap-4 mt-10">
                                    <button 
                                        onClick={() => setIsImagePromptOpen(false)} 
                                        className="px-6 py-2 text-[10px] uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                                    >
                                        Abort_Sequence
                                    </button>
                                    <button 
                                        onClick={handleAddImage} 
                                        className="px-8 py-3 bg-amber-500 text-black text-[10px] uppercase tracking-[0.2em] font-bold rounded shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all"
                                    >
                                        Inject_Layer
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
