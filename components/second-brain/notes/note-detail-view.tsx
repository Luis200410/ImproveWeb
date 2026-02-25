'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, ExternalLink, Activity, Database, Cpu, Command, Hash, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Entry } from '@/lib/data-store'
import { Playfair_Display } from '@/lib/font-shim'
import { NeuralEditor } from './neural-editor'

import { ProjectEntry } from '@/components/second-brain/projects/project-utils'

const playfair = Playfair_Display({ subsets: ['latin'] })

interface NoteDetailViewProps {
    note: Entry
    onClose: () => void
    onUpdate: (id: string, updates: Partial<Entry['data']>) => void
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
    note, onClose, onUpdate, projectMap, areaMap, taskMap,
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

    const editorSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        setContent(note.data['Main Notes'] || '')
        setTitle(note.data.Title || '')
        setFacts(Array.isArray(note.data.Facts) ? note.data.Facts : [])
        setKeywords(Array.isArray(note.data.Keywords) ? note.data.Keywords : [])
        setFormulas(Array.isArray(note.data.Formulas) ? note.data.Formulas : [])
    }, [note.id]) // Only reset when note.id changes, not on every note update from parent

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

    const projectName = note.data.Project ? projectMap[note.data.Project] : 'UNLINKED'
    const areaName = note.data.Area ? areaMap[note.data.Area] : 'GENERAL'
    // Ensure taskMap exists and task ID is valid before access
    const taskName = (note.data.Task && taskMap && taskMap[note.data.Task]) ? taskMap[note.data.Task] : 'NO_OPS'

    const filteredProjects = projects.filter(p => {
        if (!note.data.Area) return true;
        return p.data.Area === note.data.Area;
    });

    const filteredTasks = tasks.filter(t => {
        if (note.data.Project) {
            return t.data.Project === note.data.Project || t.data.projectId === note.data.Project;
        }
        if (note.data.Area) {
            const isDirectArea = t.data.Area === note.data.Area;
            const projectForTask = projects.find(p => p.id === (t.data.Project || t.data.projectId));
            const isAreaViaProject = projectForTask && projectForTask.data.Area === note.data.Area;
            return isDirectArea || isAreaViaProject;
        }
        return true;
    });

    return (
        <div className="h-full flex flex-col bg-[#050505] border-l border-white/10 relative">
            {/* Header / Active Session Indicator */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0A0A0A]">
                <div className="flex-1 mr-4">
                    <input
                        value={title}
                        onChange={handleTitleChange}
                        className={`${playfair.className} text-xl text-white bg-transparent border-none w-full focus:outline-none focus:ring-0 placeholder:text-white/30`}
                        placeholder="Untitled Sequence..."
                    />
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <span className="font-mono text-[10px] text-white/30 hidden sm:inline-block">SESSION_ID: N-{note.id.slice(0, 4)}</span>
                    {onTogglePopup && (
                        <button
                            onClick={onTogglePopup}
                            className="text-white/30 hover:text-white transition-colors"
                            title={isPopupMode ? "Dock Sidebar" : "Pop-up Note"}
                        >
                            <ExternalLink className="w-5 h-5" />
                        </button>
                    )}
                    <button onClick={onClose} className="hover:text-amber-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Linked Relations Dashboard */}
            <div className="p-6 border-b border-white/10 bg-white/[0.01]">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-[9px] uppercase tracking-widest text-white/30 font-mono">Linked Relations</span>
                    <span className="text-[9px] uppercase tracking-widest text-amber-500 font-mono animate-pulse">Active_Link</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#0F0F0F] border border-white/10 rounded p-1">
                        <div className="text-[8px] uppercase tracking-widest text-blue-400 mb-1 px-2 pt-1">Project</div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-full flex items-center justify-between bg-transparent border-none text-white/80 p-2 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/50 hover:bg-white/5 transition-colors group">
                                    <span className="truncate">{note.data.Project ? (projects.find(p => p.id === note.data.Project)?.data['Project Name'] || projects.find(p => p.id === note.data.Project)?.data.title || 'Untitled Project') : 'NO_PROJECT'}</span>
                                    <ChevronDown className="w-3 h-3 text-white/30 group-hover:text-amber-500 transition-colors shrink-0 ml-2" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-[#0A0A0A] border-white/10 text-white/70 max-h-[300px] overflow-y-auto custom-scrollbar" align="start">
                                <DropdownMenuRadioGroup value={note.data.Project || ''} onValueChange={(val) => onUpdate(note.id, { Project: val || null })}>
                                    <DropdownMenuRadioItem value="" className="text-xs focus:bg-white/10 focus:text-white cursor-pointer">
                                        NO_PROJECT
                                    </DropdownMenuRadioItem>
                                    {filteredProjects.map(p => (
                                        <DropdownMenuRadioItem
                                            key={p.id}
                                            value={p.id}
                                            className="text-xs focus:bg-white/10 focus:text-white cursor-pointer"
                                        >
                                            {p.data['Project Name'] || p.data.title || 'Untitled Project'}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="bg-[#0F0F0F] border border-white/10 rounded p-1">
                        <div className="text-[8px] uppercase tracking-widest text-purple-400 mb-1 px-2 pt-1">Area</div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-full flex items-center justify-between bg-transparent border-none text-white/80 p-2 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500/50 hover:bg-white/5 transition-colors group">
                                    <span className="truncate">{note.data.Area ? (areas.find(a => a.id === note.data.Area)?.data['Area Name'] || areas.find(a => a.id === note.data.Area)?.data.title || areas.find(a => a.id === note.data.Area)?.data.name || 'Untitled Area') : 'NO_AREA'}</span>
                                    <ChevronDown className="w-3 h-3 text-white/30 group-hover:text-amber-500 transition-colors shrink-0 ml-2" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-[#0A0A0A] border-white/10 text-white/70 max-h-[300px] overflow-y-auto custom-scrollbar" align="start">
                                <DropdownMenuRadioGroup value={note.data.Area || ''} onValueChange={(val) => onUpdate(note.id, { Area: val || null })}>
                                    <DropdownMenuRadioItem value="" className="text-xs focus:bg-white/10 focus:text-white cursor-pointer">
                                        NO_AREA
                                    </DropdownMenuRadioItem>
                                    {areas.map(a => (
                                        <DropdownMenuRadioItem
                                            key={a.id}
                                            value={a.id}
                                            className="text-xs focus:bg-white/10 focus:text-white cursor-pointer"
                                        >
                                            {a.data['Area Name'] || a.data.title || a.data.name || 'Untitled Area'}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="bg-[#0F0F0F] border border-white/10 rounded p-1">
                        <div className="text-[8px] uppercase tracking-widest text-emerald-400 mb-1 px-2 pt-1">Task</div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-full flex items-center justify-between bg-transparent border-none text-white/80 p-2 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50 hover:bg-white/5 transition-colors group">
                                    <span className="truncate">{note.data.Task ? (tasks.find(t => t.id === note.data.Task)?.data.Task || tasks.find(t => t.id === note.data.Task)?.data.Title || tasks.find(t => t.id === note.data.Task)?.data.title || 'Untitled Task') : 'NO_OPS'}</span>
                                    <ChevronDown className="w-3 h-3 text-white/30 group-hover:text-amber-500 transition-colors shrink-0 ml-2" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-[#0A0A0A] border-white/10 text-white/70 max-h-[300px] overflow-y-auto custom-scrollbar" align="start">
                                <DropdownMenuRadioGroup value={note.data.Task || ''} onValueChange={(val) => onUpdate(note.id, { Task: val || null })}>
                                    <DropdownMenuRadioItem value="" className="text-xs focus:bg-white/10 focus:text-white cursor-pointer">
                                        NO_OPS
                                    </DropdownMenuRadioItem>
                                    {filteredTasks.map(t => (
                                        <DropdownMenuRadioItem
                                            key={t.id}
                                            value={t.id}
                                            className="text-xs focus:bg-white/10 focus:text-white cursor-pointer"
                                        >
                                            {t.data.Task || t.data.Title || t.data.title || 'Untitled Task'}
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
                <div className="w-72 border-r border-white/10 flex flex-col hidden lg:flex bg-[#080808] overflow-y-auto custom-scrollbar">

                    {/* FACTS SECTION */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-2 mb-4 text-emerald-500">
                            <Database className="w-3 h-3" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Facts</span>
                        </div>
                        <div className="space-y-3">
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
                    </div>

                    {/* KEYWORDS SECTION */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-2 mb-4 text-amber-500">
                            <Hash className="w-3 h-3" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Keywords</span>
                        </div>
                        <div className="space-y-3">
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
                    </div>

                    {/* FORMULAS SECTION */}
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-4 text-purple-400">
                            <Command className="w-3 h-3" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Formulas</span>
                        </div>
                        <div className="space-y-3">
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
                                <span className="text-[10px] uppercase tracking-widest font-bold">Synthesis Summary</span>
                            </div>
                            <p className="text-sm text-white/60 leading-relaxed max-w-2xl">
                                {note.data.Summary || 'No synthesis generated for this entry.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
