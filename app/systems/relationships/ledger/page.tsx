'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { dataStore, Entry } from '@/lib/data-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { ArrowLeft, Plus, Wallet, CheckCircle, XCircle, Clock, X, ArrowRight, User, DollarSign, BookOpen } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

const LEDGER_TYPES: Record<string, { icon: string; color: string; bg: string }> = {
    'Borrowed Item': { icon: '🔧', color: 'text-orange-400', bg: 'bg-orange-500/20' },
    'Shared Recommendation': { icon: '📚', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    'IOU': { icon: '💰', color: 'text-amber-400', bg: 'bg-amber-500/20' },
    'Shared Expense': { icon: '🧾', color: 'text-green-400', bg: 'bg-green-500/20' },
    'Other': { icon: '📝', color: 'text-gray-400', bg: 'bg-gray-500/20' }
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    'Outstanding': { icon: <Clock className="w-4 h-4" />, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    'Returned': { icon: <ArrowRight className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    'Settled': { icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-400', bg: 'bg-emerald-500/20' }
}

export default function LedgerPage() {
    const searchParams = useSearchParams()
    const [userId, setUserId] = useState<string>('defaultUser')
    const [entries, setEntries] = useState<Entry[]>([])
    const [contacts, setContacts] = useState<Entry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'outstanding' | 'settled'>('all')
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
        const ledger = await dataStore.getEntries('ledger', userId)
        const contactsData = await dataStore.getEntries('contacts', userId)
        setEntries(ledger)
        setContacts(contactsData)
        setIsLoading(false)
    }, [userId])

    useEffect(() => {
        if (userId) fetchEntries()
    }, [userId, fetchEntries])

    const filteredEntries = useMemo(() => {
        let result = entries
        if (filter === 'outstanding') {
            result = result.filter(e => e.data['Status'] === 'Outstanding')
        } else if (filter === 'settled') {
            result = result.filter(e => e.data['Status'] !== 'Outstanding')
        }
        return result.sort((a, b) => (b.data['Date'] || '').localeCompare(a.data['Date'] || ''))
    }, [entries, filter])

    const stats = useMemo(() => {
        const outstanding = entries.filter(e => e.data['Status'] === 'Outstanding')
        const settled = entries.filter(e => e.data['Status'] !== 'Outstanding')
        
        return {
            total: entries.length,
            outstanding: outstanding.length,
            settled: settled.length
        }
    }, [entries])

    const handleSave = async (formData: Record<string, any>) => {
        if (editingEntry) {
            await dataStore.updateEntry(editingEntry.id, formData)
        } else {
            await dataStore.addEntry(userId, 'ledger', formData)
        }
        setShowAddModal(false)
        setEditingEntry(null)
        fetchEntries()
    }

    const handleUpdateStatus = async (entry: Entry, newStatus: string) => {
        const today = new Date().toISOString().split('T')[0]
        await dataStore.updateEntry(entry.id, { 
            'Status': newStatus,
            ...(newStatus === 'Settled' ? { 'Resolved Date': today } : {})
        })
        fetchEntries()
    }

    const handleDelete = async (id: string) => {
        await dataStore.deleteEntry(id)
        fetchEntries()
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-950/30 via-black to-black" />
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -top-1/2 -left-1/2 w-[100%] h-[100%] bg-[radial-gradient(circle_at_30%_30%,rgba(249,115,22,0.2),transparent_50%)] blur-3xl" 
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
                                    <h1 className={`${playfair.className} text-2xl font-bold text-white`}>Ledger</h1>
                                    <p className="text-white/40 text-sm">Track IOUs, borrowed items & shared expenses</p>
                                </div>
                            </div>
                            <Button 
                                onClick={() => { setEditingEntry(null); setShowAddModal(true) }}
                                className="bg-white text-black hover:bg-white/90"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Entry
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-2 mt-4">
                            <Button
                                variant={filter === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('all')}
                                className={filter === 'all' ? 'bg-white text-black' : 'border-white/20 text-white hover:bg-white/10'}
                            >
                                All ({stats.total})
                            </Button>
                            <Button
                                variant={filter === 'outstanding' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('outstanding')}
                                className={filter === 'outstanding' ? 'bg-amber-500 text-white' : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/20'}
                            >
                                Outstanding ({stats.outstanding})
                            </Button>
                            <Button
                                variant={filter === 'settled' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('settled')}
                                className={filter === 'settled' ? 'bg-emerald-500 text-white' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'}
                            >
                                Settled ({stats.settled})
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-3xl mx-auto px-6 py-8">
                    <div className="space-y-3">
                        <AnimatePresence>
                            {filteredEntries.map((entry, idx) => {
                                const type = LEDGER_TYPES[entry.data['Type']] || LEDGER_TYPES['Other']
                                const status = STATUS_CONFIG[entry.data['Status']] || STATUS_CONFIG['Outstanding']
                                
                                return (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={`
                                            group p-4 rounded-2xl border transition-all
                                            ${entry.data['Status'] === 'Settled' ? 'bg-white/[0.02] border-white/5' : 
                                              entry.data['Status'] === 'Outstanding' ? 'bg-amber-500/10 border-amber-500/30' : 
                                              'bg-white/[0.03] border-white/10'}
                                        `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl ${type.bg} flex items-center justify-center text-lg`}>
                                                {type.icon}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-white font-medium">{entry.data['Description']}</h4>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${status.bg} ${status.color}`}>
                                                        {entry.data['Status']}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {entry.data['Contact']}
                                                    </span>
                                                    <span>·</span>
                                                    <span>{entry.data['Type']}</span>
                                                    <span>·</span>
                                                    <span>{entry.data['Date']}</span>
                                                </div>
                                            </div>

                                            {entry.data['Status'] === 'Outstanding' && (
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20"
                                                        onClick={() => handleUpdateStatus(entry, 'Settled')}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Settle
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon"
                                                        onClick={() => handleDelete(entry.id)}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>

                        {filteredEntries.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                    <Wallet className="w-8 h-8 text-white/30" />
                                </div>
                                <h3 className="text-white font-medium mb-2">No ledger entries</h3>
                                <p className="text-white/40 text-sm mb-4">Track borrowed items, IOUs, and shared expenses</p>
                                <Button 
                                    onClick={() => { setEditingEntry(null); setShowAddModal(true) }}
                                    className="bg-white text-black hover:bg-white/90"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add your first entry
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
                                        {editingEntry ? 'Edit Entry' : 'Add Ledger Entry'}
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <LedgerForm 
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

function LedgerForm({ entry, contacts, onSave, onCancel }: { entry: Entry | null; contacts: Entry[]; onSave: (data: Record<string, any>) => void; onCancel: () => void }) {
    const today = new Date().toISOString().split('T')[0]
    const [formData, setFormData] = useState({
        'Contact': entry?.data['Contact'] || '',
        'Type': entry?.data['Type'] || 'IOU',
        'Description': entry?.data['Description'] || '',
        'Status': entry?.data['Status'] || 'Outstanding',
        'Date': entry?.data['Date'] || today,
        'Resolved Date': entry?.data['Resolved Date'] || ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Label className="text-white/70">Type *</Label>
                    <select 
                        value={formData['Type']}
                        onChange={(e) => setFormData({...formData, 'Type': e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white mt-1 p-2 rounded-md"
                    >
                        {Object.keys(LEDGER_TYPES).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <Label className="text-white/70">Description *</Label>
                <Textarea 
                    value={formData['Description']}
                    onChange={(e) => setFormData({...formData, 'Description': e.target.value})}
                    required
                    placeholder="What was borrowed, recommended, or owed?"
                    className="bg-white/5 border-white/10 text-white mt-1"
                    rows={2}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-white/70">Date *</Label>
                    <Input 
                        type="date"
                        value={formData['Date']}
                        onChange={(e) => setFormData({...formData, 'Date': e.target.value})}
                        required
                        className="bg-white/5 border-white/10 text-white mt-1"
                    />
                </div>
                <div>
                    <Label className="text-white/70">Status</Label>
                    <select 
                        value={formData['Status']}
                        onChange={(e) => setFormData({...formData, 'Status': e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white mt-1 p-2 rounded-md"
                    >
                        <option value="Outstanding">Outstanding</option>
                        <option value="Returned">Returned</option>
                        <option value="Settled">Settled</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-white/20 text-white hover:bg-white/10">
                    Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-white text-black hover:bg-white/90">
                    {entry ? 'Save Changes' : 'Add Entry'}
                </Button>
            </div>
        </form>
    )
}
