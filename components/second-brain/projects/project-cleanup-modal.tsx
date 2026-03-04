'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Archive, Inbox, FileText, CheckSquare, Link as LinkIcon, Zap, AlertTriangle, Check, ChevronRight } from 'lucide-react'
import { Playfair_Display } from '@/lib/font-shim'

const playfair = Playfair_Display({ subsets: ['latin'] })

// ============================
// Types
// ============================
interface CleanupItem {
    id: string
    type: 'task' | 'note' | 'resource'
    title: string
    subtitle?: string
}

type DropZone = 'archive' | 'inbox' | 'delete'
type Decision = DropZone | null   // null = unassigned (will default to delete on confirm)

interface ProjectCleanupModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectTitle: string
    tasks: Array<{ id: string; data: Record<string, any> }>
    notes: Array<{ id: string; title: string; content?: string }>
    resources: Array<{ id: string; title: string; type?: string }>
    onConfirmDelete: (decisions: Record<string, DropZone>) => Promise<void>
}

// Zone config
const ZONES: { id: DropZone; label: string; icon: React.ElementType; color: string; bg: string; border: string; ring: string }[] = [
    { id: 'archive', label: 'Archive', icon: Archive, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/40', ring: 'ring-blue-500/40' },
    { id: 'inbox', label: 'Inbox', icon: Inbox, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/40', ring: 'ring-amber-500/40' },
    { id: 'delete', label: 'Delete', icon: Trash2, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/40', ring: 'ring-rose-500/40' },
]

const ZONE_CYCLE: (DropZone | null)[] = [null, 'archive', 'inbox', 'delete']

// Item type icons
function ItemIcon({ type }: { type: CleanupItem['type'] }) {
    if (type === 'task') return <CheckSquare className="w-3 h-3 text-emerald-400 flex-shrink-0" />
    if (type === 'note') return <FileText className="w-3 h-3 text-blue-400 flex-shrink-0" />
    return <LinkIcon className="w-3 h-3 text-amber-400 flex-shrink-0" />
}

// Zone badge used on the item card
function ZoneBadge({ zone }: { zone: DropZone }) {
    const z = ZONES.find(z => z.id === zone)!
    const Icon = z.icon
    return (
        <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${z.bg} ${z.border} ${z.color}`}>
            <Icon className="w-2.5 h-2.5" />
            {z.label}
        </span>
    )
}

export function ProjectCleanupModal({
    open,
    onOpenChange,
    projectTitle,
    tasks,
    notes,
    resources,
    onConfirmDelete,
}: ProjectCleanupModalProps) {
    const [decisions, setDecisions] = useState<Record<string, Decision>>({})
    const [draggingId, setDraggingId] = useState<string | null>(null)
    const [hoveredZone, setHoveredZone] = useState<DropZone | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [done, setDone] = useState(false)

    // Build flat item list from props
    const allItems: CleanupItem[] = [
        ...tasks.map(t => ({
            id: t.id,
            type: 'task' as const,
            title: t.data?.Title || t.data?.name || 'Untitled Task',
            subtitle: t.data?.Status || undefined,
        })),
        ...notes.map(n => ({
            id: n.id,
            type: 'note' as const,
            title: n.title || 'Untitled Note',
            subtitle: n.content?.slice(0, 60) || undefined,
        })),
        ...resources.map(r => ({
            id: r.id,
            type: 'resource' as const,
            title: r.title || 'Untitled Resource',
            subtitle: r.type || undefined,
        })),
    ]

    const pendingItems = allItems.filter(i => decisions[i.id] == null)
    const assignedCount = allItems.length - pendingItems.length

    // --- Helpers ---

    /** Cycle an item through: null → archive → inbox → delete → null */
    const cycleItem = (id: string) => {
        setDecisions(prev => {
            const current = prev[id] ?? null
            const idx = ZONE_CYCLE.indexOf(current)
            const next = ZONE_CYCLE[(idx + 1) % ZONE_CYCLE.length]
            const updated = { ...prev }
            if (next === null) delete updated[id]
            else updated[id] = next
            return updated
        })
    }

    const setDecision = (id: string, zone: Decision) => {
        setDecisions(prev => {
            const updated = { ...prev }
            if (zone === null) delete updated[id]
            else updated[id] = zone
            return updated
        })
    }

    const setAll = (zone: DropZone) => {
        const all: Record<string, Decision> = {}
        allItems.forEach(i => { all[i.id] = zone })
        setDecisions(all)
    }

    // --- Drag & Drop ---
    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', id)
        setDraggingId(id)
    }

    const handleDragEnd = () => {
        setDraggingId(null)
        setHoveredZone(null)
    }

    const handleZoneDragOver = (e: React.DragEvent, zone: DropZone) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setHoveredZone(zone)
    }

    const handleZoneDrop = (e: React.DragEvent, zone: DropZone) => {
        e.preventDefault()
        const id = e.dataTransfer.getData('text/plain') || draggingId
        if (id) setDecision(id, zone)
        setDraggingId(null)
        setHoveredZone(null)
    }

    // --- Confirm ---
    const handleConfirm = async () => {
        setIsDeleting(true)
        // Default unassigned items to 'delete'
        const final: Record<string, DropZone> = {}
        allItems.forEach(i => {
            final[i.id] = decisions[i.id] ?? 'delete'
        })
        try {
            await onConfirmDelete(final)
            setDone(true)
        } catch (err) {
            console.error('Cleanup failed:', err)
        } finally {
            setIsDeleting(false)
        }
    }

    if (!open) return null

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="cleanup-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
                    onClick={(e) => { if (e.target === e.currentTarget && !isDeleting) onOpenChange(false) }}
                >
                    <motion.div
                        key="cleanup-modal"
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                    >
                        {/* ── Header ── */}
                        <div className="flex items-start justify-between px-8 py-5 border-b border-white/10 flex-shrink-0">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-rose-500 text-[10px] uppercase tracking-widest font-bold">
                                    <AlertTriangle className="w-3 h-3" />
                                    Project Cleanup
                                </div>
                                <h2 className={`${playfair.className} text-2xl text-white`}>
                                    Dissolving: <span className="text-rose-400">{projectTitle}</span>
                                </h2>
                                <p className="text-white/30 text-xs">
                                    <b>Click</b> an item to cycle zones · <b>Drag</b> to a zone · Use quick buttons to assign all at once
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                                <button onClick={() => setAll('archive')} className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-blue-400 border border-blue-400/30 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors">
                                    Archive All
                                </button>
                                <button onClick={() => setAll('inbox')} className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-amber-400 border border-amber-400/30 bg-amber-500/10 rounded-lg hover:bg-amber-500/20 transition-colors">
                                    Inbox All
                                </button>
                                <button onClick={() => setAll('delete')} className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-rose-400 border border-rose-400/30 bg-rose-500/10 rounded-lg hover:bg-rose-500/20 transition-colors">
                                    Delete All
                                </button>
                                <button onClick={() => !isDeleting && onOpenChange(false)} className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* ── Success State ── */}
                        {done ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex-1 flex flex-col items-center justify-center gap-4 py-16"
                            >
                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                                    <Check className="w-8 h-8 text-emerald-400" />
                                </div>
                                <div className={`${playfair.className} text-2xl text-white`}>Project Dissolved</div>
                                <p className="text-white/30 text-sm">All items have been handled and the project is gone.</p>
                                <button onClick={() => onOpenChange(false)} className="mt-2 px-6 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-white/90 transition-colors">
                                    Close
                                </button>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">

                                {/* ── Left: Items list ── */}
                                <div className="w-full md:w-72 border-r border-white/10 flex flex-col flex-shrink-0">
                                    <div className="px-4 py-3 border-b border-white/10">
                                        <span className="text-[11px] uppercase tracking-widest text-white/40 font-bold">
                                            {allItems.length} Items · {assignedCount} assigned
                                        </span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                                        <AnimatePresence>
                                            {allItems.length === 0 && (
                                                <div className="py-12 text-center text-white/20 text-sm italic">
                                                    No items in this project
                                                </div>
                                            )}
                                            {allItems.map(item => {
                                                const decision = decisions[item.id] ?? null
                                                const zoneConfig = decision ? ZONES.find(z => z.id === decision) : null
                                                const isDragging = draggingId === item.id

                                                return (
                                                    <motion.div
                                                        key={item.id}
                                                        layout
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e as any, item.id)}
                                                        onDragEnd={handleDragEnd}
                                                        onClick={() => cycleItem(item.id)}
                                                        title="Click to cycle zone assignment"
                                                        className={`
                                                            flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer select-none
                                                            transition-all duration-150 group
                                                            ${isDragging ? 'opacity-40 scale-95' : 'hover:bg-white/5'}
                                                            ${zoneConfig
                                                                ? `${zoneConfig.bg} ${zoneConfig.border}`
                                                                : 'bg-white/[0.03] border-white/10'
                                                            }
                                                        `}
                                                    >
                                                        <div className="mt-0.5"><ItemIcon type={item.type} /></div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-medium text-white/80 truncate">{item.title}</div>
                                                            {item.subtitle && (
                                                                <div className="text-[10px] text-white/30 truncate mt-0.5">{item.subtitle}</div>
                                                            )}
                                                            {zoneConfig && (
                                                                <div className="mt-1">
                                                                    <ZoneBadge zone={decision!} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-white/50 flex-shrink-0 mt-0.5 transition-colors" />
                                                    </motion.div>
                                                )
                                            })}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* ── Right: Drop zones ── */}
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <div className="flex-1 grid grid-cols-3 overflow-y-auto">
                                        {ZONES.map(zone => {
                                            const Icon = zone.icon
                                            const zoneItemsList = allItems.filter(i => decisions[i.id] === zone.id)
                                            const isHovered = hoveredZone === zone.id

                                            return (
                                                <div
                                                    key={zone.id}
                                                    onDragOver={(e) => handleZoneDragOver(e, zone.id)}
                                                    onDragLeave={() => setHoveredZone(null)}
                                                    onDrop={(e) => handleZoneDrop(e, zone.id)}
                                                    className={`
                                                        flex flex-col border-r last:border-r-0 border-white/10 transition-all duration-200
                                                        ${isHovered ? `${zone.bg} ring-2 ring-inset ${zone.ring}` : ''}
                                                    `}
                                                >
                                                    {/* Zone header */}
                                                    <div className={`px-4 py-3 border-b border-white/10 flex items-center gap-2 ${zone.color} sticky top-0 bg-[#0a0a0a]`}>
                                                        <Icon className="w-4 h-4" />
                                                        <span className="text-[11px] uppercase tracking-widest font-bold">{zone.label}</span>
                                                        <span className="ml-auto text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-white/40">
                                                            {zoneItemsList.length}
                                                        </span>
                                                    </div>

                                                    {/* Drop area */}
                                                    <div className={`flex-1 p-3 space-y-1.5 min-h-48 transition-all`}>
                                                        {/* Drag-over placeholder */}
                                                        {isHovered && (
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                className={`border-2 border-dashed ${zone.border} rounded-xl h-14 flex items-center justify-center ${zone.color} text-xs italic opacity-70`}
                                                            >
                                                                Drop here
                                                            </motion.div>
                                                        )}

                                                        {/* Zone items */}
                                                        <AnimatePresence>
                                                            {zoneItemsList.map(item => (
                                                                <motion.div
                                                                    key={item.id}
                                                                    layout
                                                                    initial={{ opacity: 0, scale: 0.9, y: -8 }}
                                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.8, y: -8 }}
                                                                    onClick={() => setDecision(item.id, null)}
                                                                    title="Click to unassign"
                                                                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer group transition-all ${zone.bg} ${zone.border} hover:opacity-70`}
                                                                >
                                                                    <ItemIcon type={item.type} />
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="text-[11px] font-medium text-white/80 truncate">{item.title}</div>
                                                                    </div>
                                                                    <X className="w-3 h-3 text-white/20 group-hover:text-white/60 flex-shrink-0 transition-colors" />
                                                                </motion.div>
                                                            ))}
                                                        </AnimatePresence>

                                                        {/* Empty zone guidance */}
                                                        {!isHovered && zoneItemsList.length === 0 && (
                                                            <div className="h-full flex items-center justify-center pt-8">
                                                                <span className="text-[11px] text-white/15 italic">Drag or click items to assign</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* ── Footer ── */}
                                    <div className="border-t border-white/10 px-6 py-4 flex items-center justify-between flex-shrink-0 bg-[#080808]">
                                        <div className="text-xs">
                                            {pendingItems.length > 0
                                                ? <span className="text-amber-400"><b>{pendingItems.length}</b> unassigned → will be permanently deleted</span>
                                                : <span className="text-emerald-400">All items assigned ✓</span>
                                            }
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => !isDeleting && onOpenChange(false)}
                                                disabled={isDeleting}
                                                className="px-4 py-2 text-xs text-white/40 hover:text-white uppercase tracking-wider transition-colors disabled:opacity-40"
                                            >
                                                Cancel
                                            </button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleConfirm}
                                                disabled={isDeleting}
                                                className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs uppercase tracking-wider font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {isDeleting
                                                    ? <><Zap className="w-3 h-3 animate-pulse" /> Dissolving...</>
                                                    : <><Trash2 className="w-3 h-3" /> Confirm & Delete Project</>
                                                }
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
