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
import { ArrowLeft, Plus, Phone, Video, MessageSquare, Users, Mail, PartyPopper, X, Calendar, ChevronRight, MessageCircle, Sparkles } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

const INTERACTION_TYPES: Record<string, { icon: string; color: string; bg: string }> = {
    'Call': { icon: '📞', color: 'text-green-400', bg: 'bg-green-500/20' },
    'Video': { icon: '🎥', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    'Text': { icon: '💬', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    'In-Person': { icon: '🤝', color: 'text-amber-400', bg: 'bg-amber-500/20' },
    'Email': { icon: '📧', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
    'Event': { icon: '🎉', color: 'text-rose-400', bg: 'bg-rose-500/20' }
}

export default function InteractionsPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const [userId, setUserId] = useState<string>('defaultUser')
    const [entries, setEntries] = useState<Entry[]>([])
    const [contacts, setContacts] = useState<Entry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedContact, setSelectedContact] = useState<string | null>(null)
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
        const interactions = await dataStore.getEntries('interactions', userId)
        const contactsData = await dataStore.getEntries('contacts', userId)
        setEntries(interactions)
        setContacts(contactsData)
        setIsLoading(false)
    }, [userId])

    useEffect(() => {
        if (userId) fetchEntries()
    }, [userId, fetchEntries])

    const filteredEntries = useMemo(() => {
        let result = entries
        if (selectedContact) {
            result = result.filter(e => e.data['Contact'] === selectedContact)
        }
        return result.sort((a, b) => (b.data['Date'] || '').localeCompare(a.data['Date'] || ''))
    }, [entries, selectedContact])

    const contactsWithInteractions = useMemo(() => {
        const counts: Record<string, number> = {}
        entries.forEach(e => {
            const contact = e.data['Contact']
            counts[contact] = (counts[contact] || 0) + 1
        })
        return counts
    }, [entries])

    const handleSave = async (formData: Record<string, any>) => {
        if (editingEntry) {
            await dataStore.updateEntry(editingEntry.id, formData)
        } else {
            await dataStore.addEntry(userId, 'interactions', formData)
            
            // Update last interaction on contact
            if (formData['Contact']) {
                const contact = contacts.find(c => c.data['Name'] === formData['Contact'])
                if (contact) {
                    await dataStore.updateEntry(contact.id, { 'Last Interaction': formData['Date'] })
                }
            }
        }
        setShowAddModal(false)
        setEditingEntry(null)
        fetchEntries()
    }

    const handleDelete = async (id: string) => {
        await dataStore.deleteEntry(id)
        fetchEntries()
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        
        if (days === 0) return 'Today'
        if (days === 1) return 'Yesterday'
        if (days < 7) return `${days} days ago`
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const groupedByDate = useMemo(() => {
        const groups: Record<string, Entry[]> = {}
        filteredEntries.forEach(entry => {
            const date = entry.data['Date']
            if (!groups[date]) groups[date] = []
            groups[date].push(entry)
        })
        return groups
    }, [filteredEntries])

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-black to-black" />
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -top-1/2 -left-1/2 w-[100%] h-[100%] bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.2),transparent_50%)] blur-3xl" 
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
                                    <h1 className={`${playfair.className} text-2xl font-bold text-white`}>Interactions</h1>
                                    <p className="text-white/40 text-sm">{filteredEntries.length} logged</p>
                                </div>
                            </div>
                            <Button 
                                onClick={() => { setEditingEntry(null); setShowAddModal(true) }}
                                className="bg-white text-black hover:bg-white/90"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Log Interaction
                            </Button>
                        </div>

                        {/* Contact Filter */}
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                            <Button
                                variant={!selectedContact ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedContact(null)}
                                className={!selectedContact ? 'bg-white text-black' : 'border-white/20 text-white hover:bg-white/10'}
                            >
                                All
                            </Button>
                            {contacts.slice(0, 10).map(contact => (
                                <Button
                                    key={contact.id}
                                    variant={selectedContact === contact.data['Name'] ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedContact(contact.data['Name'])}
                                    className={`${selectedContact === contact.data['Name'] ? 'bg-white text-black' : 'border-white/20 text-white hover:bg-white/10'} whitespace-nowrap`}
                                >
                                    {contact.data['Name']}
                                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-white/20">
                                        {contactsWithInteractions[contact.data['Name']] || 0}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="max-w-3xl mx-auto px-6 py-8">
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />

                        <div className="space-y-8">
                            {Object.entries(groupedByDate).map(([date, items]) => (
                                <div key={date}>
                                    {/* Date Marker */}
                                    <div className="relative flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center z-10">
                                            <Calendar className="w-5 h-5 text-white/60" />
                                        </div>
                                        <h3 className="text-white font-medium">{formatDate(date)}</h3>
                                    </div>

                                    {/* Interactions */}
                                    <div className="ml-14 space-y-4">
                                        <AnimatePresence>
                                            {items.map((interaction, idx) => {
                                                const type = INTERACTION_TYPES[interaction.data['Type']] || INTERACTION_TYPES['Call']
                                                
                                                return (
                                                    <motion.div
                                                        key={interaction.id}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="group relative"
                                                    >
                                                        <div className="absolute -left-10 top-6 w-4 h-px bg-white/20" />
                                                        
                                                        <Card className="bg-white/[0.03] border-white/10 hover:border-white/20 transition-all">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-start gap-4">
                                                                    <div className={`w-10 h-10 rounded-xl ${type.bg} flex items-center justify-center text-lg flex-shrink-0`}>
                                                                        {type.icon}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center justify-between">
                                                                            <div>
                                                                                <h4 className="font-medium text-white">{interaction.data['Contact']}</h4>
                                                                                <p className="text-xs text-white/40">{interaction.data['Type']}</p>
                                                                            </div>
                                                                            <Button 
                                                                                variant="ghost" 
                                                                                size="icon"
                                                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                onClick={() => handleDelete(interaction.id)}
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                        
                                                                        <p className="text-white/70 mt-2 text-sm leading-relaxed">
                                                                            {interaction.data['Summary']}
                                                                        </p>

                                                                        {interaction.data['Key Topics'] && (
                                                                            <div className="flex flex-wrap gap-2 mt-3">
                                                                                {interaction.data['Key Topics'].split(',').map((topic: string, i: number) => (
                                                                                    <span key={i} className="px-2 py-1 rounded-full bg-white/5 text-white/40 text-xs">
                                                                                        {topic.trim()}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}

                                                                        {interaction.data['Follow Up Needed'] === 'Yes' && (
                                                                            <div className="mt-3 flex items-center gap-2 text-xs text-amber-400">
                                                                                <Sparkles className="w-3 h-3" />
                                                                                Follow up needed
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </motion.div>
                                                )
                                            })}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ))}

                            {filteredEntries.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                        <MessageCircle className="w-8 h-8 text-white/30" />
                                    </div>
                                    <h3 className="text-white font-medium mb-2">No interactions yet</h3>
                                    <p className="text-white/40 text-sm mb-4">Start logging your meaningful connections</p>
                                    <Button 
                                        onClick={() => { setEditingEntry(null); setShowAddModal(true) }}
                                        className="bg-white text-black hover:bg-white/90"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Log your first interaction
                                    </Button>
                                </div>
                            )}
                        </div>
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
                                        {editingEntry ? 'Edit Interaction' : 'Log Interaction'}
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <InteractionForm 
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

function InteractionForm({ entry, contacts, onSave, onCancel }: { entry: Entry | null; contacts: Entry[]; onSave: (data: Record<string, any>) => void; onCancel: () => void }) {
    const today = new Date().toISOString().split('T')[0]
    const [formData, setFormData] = useState({
        'Date': entry?.data['Date'] || today,
        'Contact': entry?.data['Contact'] || '',
        'Type': entry?.data['Type'] || 'Call',
        'Summary': entry?.data['Summary'] || '',
        'Key Topics': entry?.data['Key Topics'] || '',
        'Follow Up Needed': entry?.data['Follow Up Needed'] || 'No'
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
            </div>

            <div>
                <Label className="text-white/70">Type *</Label>
                <select 
                    value={formData['Type']}
                    onChange={(e) => setFormData({...formData, 'Type': e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white mt-1 p-2 rounded-md"
                >
                    {Object.keys(INTERACTION_TYPES).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            <div>
                <Label className="text-white/70">Summary *</Label>
                <Textarea 
                    value={formData['Summary']}
                    onChange={(e) => setFormData({...formData, 'Summary': e.target.value})}
                    required
                    placeholder="What did you discuss?"
                    className="bg-white/5 border-white/10 text-white mt-1"
                    rows={3}
                />
            </div>

            <div>
                <Label className="text-white/70">Key Topics</Label>
                <Input 
                    value={formData['Key Topics']}
                    onChange={(e) => setFormData({...formData, 'Key Topics': e.target.value})}
                    placeholder="work, family, hobbies (comma separated)"
                    className="bg-white/5 border-white/10 text-white mt-1"
                />
            </div>

            <div>
                <Label className="text-white/70">Follow Up Needed?</Label>
                <select 
                    value={formData['Follow Up Needed']}
                    onChange={(e) => setFormData({...formData, 'Follow Up Needed': e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white mt-1 p-2 rounded-md"
                >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                </select>
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-white/20 text-white hover:bg-white/10">
                    Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-white text-black hover:bg-white/90">
                    {entry ? 'Save Changes' : 'Log Interaction'}
                </Button>
            </div>
        </form>
    )
}
