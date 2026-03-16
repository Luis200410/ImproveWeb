'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { dataStore, Entry } from '@/lib/data-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { ArrowLeft, Plus, CheckCircle2, Circle, AlertTriangle, Clock, Users, X, ChevronRight, Filter, Calendar, Sparkles } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

const ACTION_TYPES: Record<string, { icon: string; color: string; bg: string }> = {
    'Follow Up': { icon: '📞', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    'Send Message': { icon: '💬', color: 'text-green-400', bg: 'bg-green-500/20' },
    'Schedule Meet': { icon: '📅', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    'Send Article': { icon: '📰', color: 'text-amber-400', bg: 'bg-amber-500/20' },
    'Wish Birthday': { icon: '🎂', color: 'text-rose-400', bg: 'bg-rose-500/20' },
    'Send Gift': { icon: '🎁', color: 'text-pink-400', bg: 'bg-pink-500/20' },
    'Other': { icon: '📝', color: 'text-gray-400', bg: 'bg-gray-500/20' }
}

export default function ActionItemsPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const [userId, setUserId] = useState<string>('defaultUser')
    const [entries, setEntries] = useState<Entry[]>([])
    const [contacts, setContacts] = useState<Entry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'pending' | 'done' | 'overdue'>('all')
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null)

    useEffect(() => {
        const loadUser = async () => {
            const supabase = (await import('@/utils/supabase/client')).createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUserId(user?.id || 'defaultUser')
        }
        loadUser()

        if (searchParams.get('new') === '1') {
            setShowAddModal(true)
        }
    }, [searchParams])

    const fetchEntries = useCallback(async () => {
        const actions = await dataStore.getEntries('action-items', userId)
        const contactsData = await dataStore.getEntries('contacts', userId)
        setEntries(actions)
        setContacts(contactsData)
        setIsLoading(false)
    }, [userId])

    useEffect(() => {
        if (userId) fetchEntries()
    }, [userId, fetchEntries])

    const today = new Date().toISOString().split('T')[0]

    const filteredEntries = useMemo(() => {
        let result = entries
        
        if (filter === 'pending') {
            result = result.filter(e => e.data['Status'] === 'Pending')
        } else if (filter === 'done') {
            result = result.filter(e => e.data['Status'] === 'Done')
        } else if (filter === 'overdue') {
            result = result.filter(e => e.data['Status'] === 'Pending' && e.data['Due Date'] < today)
        }
        
        return result.sort((a, b) => {
            // Sort by status first (pending first), then by date
            if (a.data['Status'] !== b.data['Status']) {
                return a.data['Status'] === 'Pending' ? -1 : 1
            }
            return (a.data['Due Date'] || '').localeCompare(b.data['Due Date'] || '')
        })
    }, [entries, filter, today])

    const stats = useMemo(() => {
        const pending = entries.filter(e => e.data['Status'] === 'Pending')
        const overdue = pending.filter(e => e.data['Due Date'] < today)
        const done = entries.filter(e => e.data['Status'] === 'Done')
        
        return {
            total: entries.length,
            pending: pending.length,
            overdue: overdue.length,
            done: done.length
        }
    }, [entries, today])

    const handleSave = async (formData: Record<string, any>) => {
        if (editingEntry) {
            await dataStore.updateEntry(editingEntry.id, formData)
        } else {
            await dataStore.addEntry(userId, 'action-items', formData)
        }
        setShowAddModal(false)
        setEditingEntry(null)
        fetchEntries()
    }

    const handleToggleStatus = async (entry: Entry) => {
        const newStatus = entry.data['Status'] === 'Done' ? 'Pending' : 'Done'
        await dataStore.updateEntry(entry.id, { 'Status': newStatus })
        fetchEntries()
    }

    const handleDelete = async (id: string) => {
        await dataStore.deleteEntry(id)
        fetchEntries()
    }

    const getContactName = (contactName: string) => {
        const contact = contacts.find(c => c.data['Name'] === contactName)
        return contact?.data['Name'] || contactName || 'Unknown'
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-950/30 via-black to-black" />
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -top-1/2 -left-1/2 w-[100%] h-[100%] bg-[radial-gradient(circle_at_30%_30%,rgba(251,191,36,0.2),transparent_50%)] blur-3xl" 
                />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-20">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link href="/systems/relationships">
                                    <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className={`${playfair.className} text-2xl font-bold text-white`}>Action Items</h1>
                                    <p className="text-white/40 text-sm">{stats.pending} pending · {stats.overdue} overdue</p>
                                </div>
                            </div>
                            <Button 
                                onClick={() => { setEditingEntry(null); setShowAddModal(true) }}
                                className="bg-white text-black hover:bg-white/90"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Action
                            </Button>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-2 mt-4">
                            {[
                                { key: 'all', label: 'All', count: stats.total },
                                { key: 'pending', label: 'Pending', count: stats.pending },
                                { key: 'overdue', label: 'Overdue', count: stats.overdue, highlight: true },
                                { key: 'done', label: 'Done', count: stats.done }
                            ].map(f => (
                                <Button
                                    key={f.key}
                                    variant={filter === f.key ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter(f.key as any)}
                                    className={`
                                        ${filter === f.key ? 'bg-white text-black' : 'border-white/20 text-white hover:bg-white/10'}
                                        ${f.highlight && f.count > 0 ? 'ring-2 ring-amber-400' : ''}
                                    `}
                                >
                                    {f.label}
                                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-white/20">
                                        {f.count}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="grid grid-cols-4 gap-4">
                        <motion.div whileHover={{ scale: 1.02 }} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-white/40 text-xs">Pending</p>
                                    <p className="text-2xl font-bold text-white">{stats.pending}</p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-amber-400/70 text-xs">Overdue</p>
                                    <p className="text-2xl font-bold text-amber-400">{stats.overdue}</p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-emerald-400/70 text-xs">Completed</p>
                                    <p className="text-2xl font-bold text-emerald-400">{stats.done}</p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-white/40 text-xs">Total</p>
                                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Action Items List */}
                <div className="max-w-7xl mx-auto px-6 pb-8">
                    <div className="space-y-3">
                        <AnimatePresence>
                            {filteredEntries.map((item, idx) => {
                                const type = ACTION_TYPES[item.data['Type']] || ACTION_TYPES['Other']
                                const isOverdue = item.data['Status'] === 'Pending' && item.data['Due Date'] < today
                                const isDone = item.data['Status'] === 'Done'
                                
                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={`
                                            group relative p-4 rounded-2xl border transition-all duration-300
                                            ${isDone ? 'bg-white/[0.02] border-white/5 opacity-60' : 
                                              isOverdue ? 'bg-amber-500/10 border-amber-500/30' : 
                                              'bg-white/[0.03] border-white/10 hover:border-white/20'}
                                        `}
                                    >
                                        {isOverdue && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent rounded-2xl" />
                                        )}
                                        
                                        <div className="relative flex items-center gap-4">
                                            <button
                                                onClick={() => handleToggleStatus(item)}
                                                className="flex-shrink-0"
                                            >
                                                {isDone ? (
                                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                                ) : isOverdue ? (
                                                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                                                ) : (
                                                    <Circle className="w-6 h-6 text-white/30 hover:text-white/60 transition-colors" />
                                                )}
                                            </button>

                                            <div className={`w-10 h-10 rounded-xl ${type.bg} flex items-center justify-center text-lg`}>
                                                {type.icon}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-medium ${isDone ? 'line-through text-white/40' : 'text-white'}`}>
                                                    {item.data['Task']}
                                                </h4>
                                                <div className="flex items-center gap-3 text-xs mt-1">
                                                    <span className="flex items-center gap-1 text-white/40">
                                                        <Users className="w-3 h-3" />
                                                        {getContactName(item.data['Contact'])}
                                                    </span>
                                                    <span className={`flex items-center gap-1 ${isOverdue ? 'text-amber-400' : 'text-white/40'}`}>
                                                        <Calendar className="w-3 h-3" />
                                                        {item.data['Due Date'] || 'No date'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => { setEditingEntry(item); setShowAddModal(true) }}
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>

                        {filteredEntries.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-8 h-8 text-white/30" />
                                </div>
                                <h3 className="text-white font-medium mb-2">No action items</h3>
                                <p className="text-white/40 text-sm mb-4">Stay on top of your relationships with follow-ups</p>
                                <Button 
                                    onClick={() => { setEditingEntry(null); setShowAddModal(true) }}
                                    className="bg-white text-black hover:bg-white/90"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add your first action
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg"
                        >
                            <Card className="bg-zinc-950 border-white/10">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-white">
                                        {editingEntry ? 'Edit Action' : 'Add Action Item'}
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <ActionForm 
                                        entry={editingEntry}
                                        contacts={contacts}
                                        onSave={handleSave} 
                                        onCancel={() => setShowAddModal(false)} 
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function ActionForm({ entry, contacts, onSave, onCancel }: { entry: Entry | null; contacts: Entry[]; onSave: (data: Record<string, any>) => void; onCancel: () => void }) {
    const today = new Date().toISOString().split('T')[0]
    const [formData, setFormData] = useState({
        'Task': entry?.data['Task'] || '',
        'Contact': entry?.data['Contact'] || '',
        'Due Date': entry?.data['Due Date'] || today,
        'Type': entry?.data['Type'] || 'Follow Up',
        'Notes': entry?.data['Notes'] || '',
        'Status': entry?.data['Status'] || 'Pending',
        'Automated': entry?.data['Automated'] || 'No'
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label className="text-white/70">Task *</Label>
                <Input 
                    value={formData['Task']}
                    onChange={(e) => setFormData({...formData, 'Task': e.target.value})}
                    required
                    placeholder="Follow up on project discussion"
                    className="bg-white/5 border-white/10 text-white mt-1"
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-white/70">Contact *</Label>
                    <select 
                        value={formData['Contact']}
                        onChange={(e) => setFormData({...formData, 'Contact': e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white mt-1 p-2 rounded-md"
                    >
                        <option value="">Select contact</option>
                        {contacts.map(c => (
                            <option key={c.id} value={c.data['Name']}>{c.data['Name']}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <Label className="text-white/70">Due Date *</Label>
                    <Input 
                        type="date"
                        value={formData['Due Date']}
                        onChange={(e) => setFormData({...formData, 'Due Date': e.target.value})}
                        required
                        className="bg-white/5 border-white/10 text-white mt-1"
                    />
                </div>
            </div>

            <div>
                <Label className="text-white/70">Type *</Label>
                <select 
                    value={formData['Type']}
                    onChange={(e) => setFormData({...formData, 'Type': e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white mt-1 p-2 rounded-md"
                >
                    {Object.keys(ACTION_TYPES).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            <div>
                <Label className="text-white/70">Notes</Label>
                <Textarea 
                    value={formData['Notes']}
                    onChange={(e) => setFormData({...formData, 'Notes': e.target.value})}
                    className="bg-white/5 border-white/10 text-white mt-1"
                    rows={2}
                />
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-white/20 text-white hover:bg-white/10">
                    Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-white text-black hover:bg-white/90">
                    {entry ? 'Save Changes' : 'Add Action'}
                </Button>
            </div>
        </form>
    )
}
