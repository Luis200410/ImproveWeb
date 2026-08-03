'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
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
import { ArrowLeft, Plus, Search, Filter, Grid3X3, List, Users, Heart, Calendar, MessageCircle, Mail, Phone, MoreHorizontal, Edit, Trash2, Copy, ExternalLink, Sparkles, X, ChevronRight } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

const TIER_CONFIG: Record<string, { color: string; gradient: string; border: string; bg: string; gradientFull: string }> = {
    'Immediate Family': { color: 'text-rose-400', gradient: 'from-rose-500/20', border: 'border-rose-500/30', bg: 'bg-rose-500/10', gradientFull: 'from-rose-500/30 to-transparent' },
    'Extended Family': { color: 'text-pink-400', gradient: 'from-pink-500/20', border: 'border-pink-500/30', bg: 'bg-pink-500/10', gradientFull: 'from-pink-500/30 to-transparent' },
    'Friends': { color: 'text-blue-400', gradient: 'from-blue-500/20', border: 'border-blue-500/30', bg: 'bg-blue-500/10', gradientFull: 'from-blue-500/30 to-transparent' },
    'Mentors': { color: 'text-purple-400', gradient: 'from-purple-500/20', border: 'border-purple-500/30', bg: 'bg-purple-500/10', gradientFull: 'from-purple-500/30 to-transparent' },
    'Colleagues': { color: 'text-amber-400', gradient: 'from-amber-500/20', border: 'border-amber-500/30', bg: 'bg-amber-500/10', gradientFull: 'from-amber-500/30 to-transparent' },
    'Acquaintances': { color: 'text-gray-400', gradient: 'from-gray-500/20', border: 'border-gray-500/30', bg: 'bg-gray-500/10', gradientFull: 'from-gray-500/30 to-transparent' }
}

function ContactsContent() {
    const params = useParams()
    const searchParams = useSearchParams()
    const [userId, setUserId] = useState<string>('defaultUser')
    const [entries, setEntries] = useState<Entry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTier, setSelectedTier] = useState<string | null>(null)
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
        const contacts = await dataStore.getEntries('contacts', userId)
        setEntries(contacts)
        setIsLoading(false)
    }, [userId])

    useEffect(() => {
        if (userId) fetchEntries()
    }, [userId, fetchEntries])

    const filteredEntries = useMemo(() => {
        let result = entries
        if (searchQuery) {
            result = result.filter(e => 
                e.data['Name']?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.data['Notes']?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }
        if (selectedTier) {
            result = result.filter(e => e.data['Relationship Tier'] === selectedTier)
        }
        return result
    }, [entries, searchQuery, selectedTier])

    const contactsByTier = useMemo(() => {
        const grouped: Record<string, Entry[]> = {
            'Immediate Family': [],
            'Extended Family': [],
            'Friends': [],
            'Mentors': [],
            'Colleagues': [],
            'Acquaintances': []
        }
        filteredEntries.forEach(entry => {
            const tier = entry.data['Relationship Tier'] || 'Acquaintances'
            if (grouped[tier]) grouped[tier].push(entry)
        })
        return grouped
    }, [filteredEntries])

    const handleSave = async (formData: Record<string, any>) => {
        if (editingEntry) {
            await dataStore.updateEntry(editingEntry.id, formData)
        } else {
            await dataStore.addEntry(userId, 'contacts', formData)
        }
        setShowAddModal(false)
        setEditingEntry(null)
        fetchEntries()
    }

    const handleDelete = async (id: string) => {
        await dataStore.deleteEntry(id)
        fetchEntries()
    }

    const copyToken = (token: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/schedule?token=${token}`)
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-950/30 via-black to-black" />
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -top-1/2 -left-1/2 w-[100%] h-[100%] bg-[radial-gradient(circle_at_30%_30%,rgba(244,63,94,0.2),transparent_50%)] blur-3xl" 
                />
                <motion.div 
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute -bottom-1/2 -right-1/2 w-[100%] h-[100%] bg-[radial-gradient(circle_at_70%_70%,rgba(244,63,94,0.15),transparent_50%)] blur-3xl" 
                />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-[100px] z-20">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link href="/systems/relationships">
                                    <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className={`${playfair.className} text-2xl font-bold text-white`}>Contacts</h1>
                                    <p className="text-white/40 text-sm">{filteredEntries.length} relationships</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                    <Input 
                                        placeholder="Search contacts..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 bg-white/5 border-white/10 text-white w-64"
                                    />
                                </div>
                                <div className="flex border border-white/10 rounded-lg overflow-hidden">
                                    <Button 
                                        variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('kanban')}
                                        className={viewMode === 'kanban' ? 'bg-white text-black' : 'text-white'}
                                    >
                                        <Grid3X3 className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className={viewMode === 'list' ? 'bg-white text-black' : 'text-white'}
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                </div>
                                <Button 
                                    onClick={() => { setEditingEntry(null); setShowAddModal(true) }}
                                    className="bg-white text-black hover:bg-white/90"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Contact
                                </Button>
                            </div>
                        </div>

                        {/* Tier Filter */}
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                            <Button
                                variant={!selectedTier ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedTier(null)}
                                className={!selectedTier ? 'bg-white text-black' : 'border-white/20 text-white hover:bg-white/10'}
                            >
                                All
                            </Button>
                            {Object.keys(TIER_CONFIG).map(tier => (
                                <Button
                                    key={tier}
                                    variant={selectedTier === tier ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedTier(tier)}
                                    className={`${selectedTier === tier ? 'bg-white text-black' : 'border-white/20 text-white hover:bg-white/10'} whitespace-nowrap`}
                                >
                                    {tier} ({contactsByTier[tier]?.length || 0})
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    {viewMode === 'kanban' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                            {Object.entries(contactsByTier).map(([tier, contacts]) => {
                                const config = TIER_CONFIG[tier]
                                if (contacts.length === 0 && selectedTier) return null
                                
                                return (
                                    <motion.div
                                        key={tier}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className={`flex items-center justify-between p-4 rounded-2xl border ${config.border} ${config.bg} backdrop-blur-sm`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                                                    <Users className={`w-5 h-5 ${config.color}`} />
                                                </div>
                                                <div>
                                                    <h3 className={`font-semibold ${config.color}`}>{tier}</h3>
                                                    <p className="text-white/40 text-xs">{contacts.length} contacts</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <AnimatePresence>
                                                {contacts.map((contact, idx) => (
                                                    <motion.div
                                                        key={contact.id}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="group relative"
                                                    >
                                                        <div className={`absolute inset-0 bg-gradient-to-r ${config.gradientFull} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl`} />
                                                        <Card className="relative bg-white/[0.03] border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.02]">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-lg font-bold ${config.color}`}>
                                                                            {(contact.data['Name'] || '?').charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-semibold text-white">{contact.data['Name']}</h4>
                                                                            <p className="text-white/40 text-xs">{contact.data['Connection Cadence']}</p>
                                                                        </div>
                                                                    </div>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        onClick={() => { setEditingEntry(contact); setShowAddModal(true) }}
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                                
                                                                {contact.data['Last Interaction'] && (
                                                                    <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
                                                                        <Calendar className="w-3 h-3" />
                                                                        <span>Last: {contact.data['Last Interaction']}</span>
                                                                    </div>
                                                                )}

                                                                <div className="mt-3 flex gap-2">
                                                                    {contact.data['Email'] && (
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                                                                            <Mail className="w-3 h-3" />
                                                                        </Button>
                                                                    )}
                                                                    {contact.data['Phone'] && (
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                                                                            <Phone className="w-3 h-3" />
                                                                        </Button>
                                                                    )}
                                                                    {contact.data['Access Token'] && (
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="icon" 
                                                                            className="h-8 w-8 text-white/40 hover:text-white"
                                                                            onClick={() => copyToken(contact.data['Access Token'])}
                                                                        >
                                                                            <Copy className="w-3 h-3" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            
                                            {contacts.length === 0 && (
                                                <div className="text-center py-8 text-white/30">
                                                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">No contacts in this tier</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredEntries.map((contact, idx) => {
                                const tier = contact.data['Relationship Tier'] || 'Acquaintances'
                                const config = TIER_CONFIG[tier]
                                
                                return (
                                    <motion.div
                                        key={contact.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                    >
                                        <Card className="bg-white/[0.03] border-white/10 hover:border-white/20 transition-all">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-lg font-bold ${config.color}`}>
                                                        {(contact.data['Name'] || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-white">{contact.data['Name']}</h4>
                                                        <div className="flex items-center gap-3 text-xs text-white/40">
                                                            <span className={config.color}>{tier}</span>
                                                            <span>·</span>
                                                            <span>{contact.data['Connection Cadence']}</span>
                                                            <span>·</span>
                                                            <span>Last: {contact.data['Last Interaction'] || 'Never'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon"
                                                        onClick={() => { setEditingEntry(contact); setShowAddModal(true) }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon"
                                                        onClick={() => handleDelete(contact.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-400" />
                                                    </Button>
                                                    <ChevronRight className="w-5 h-5 text-white/20" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
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
                                        {editingEntry ? 'Edit Contact' : 'Add New Contact'}
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <ContactForm 
                                        entry={editingEntry} 
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

export default function ContactsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white/20 uppercase tracking-[0.5em] text-xs">Loading Relationships...</div>}>
            <ContactsContent />
        </Suspense>
    )
}

function ContactForm({ entry, onSave, onCancel }: { entry: Entry | null; onSave: (data: Record<string, any>) => void; onCancel: () => void }) {
    const [formData, setFormData] = useState({
        'Name': entry?.data['Name'] || '',
        'Relationship Tier': entry?.data['Relationship Tier'] || 'Friends',
        'Connection Cadence': entry?.data['Connection Cadence'] || 'Weekly',
        'Last Interaction': entry?.data['Last Interaction'] || '',
        'Email': entry?.data['Email'] || '',
        'Phone': entry?.data['Phone'] || '',
        'Access Token': entry?.data['Access Token'] || Math.random().toString(36).substring(2, 15),
        'How We Met': entry?.data['How We Met'] || '',
        'Interests': entry?.data['Interests'] || '',
        'Gift Ideas': entry?.data['Gift Ideas'] || '',
        'Life Events': entry?.data['Life Events'] || '',
        'Preferences': entry?.data['Preferences'] || '',
        'Notes': entry?.data['Notes'] || ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label className="text-white/70">Name *</Label>
                <Input 
                    value={formData['Name']}
                    onChange={(e) => setFormData({...formData, 'Name': e.target.value})}
                    required
                    className="bg-white/5 border-white/10 text-white mt-1"
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-white/70">Relationship Tier *</Label>
                    <select 
                        value={formData['Relationship Tier']}
                        onChange={(e) => setFormData({...formData, 'Relationship Tier': e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white mt-1 p-2 rounded-md"
                    >
                        {Object.keys(TIER_CONFIG).map(tier => (
                            <option key={tier} value={tier}>{tier}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <Label className="text-white/70">Connection Cadence *</Label>
                    <select 
                        value={formData['Connection Cadence']}
                        onChange={(e) => setFormData({...formData, 'Connection Cadence': e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white mt-1 p-2 rounded-md"
                    >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Bi-weekly">Bi-weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="As Needed">As Needed</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-white/70">Email</Label>
                    <Input 
                        type="email"
                        value={formData['Email']}
                        onChange={(e) => setFormData({...formData, 'Email': e.target.value})}
                        className="bg-white/5 border-white/10 text-white mt-1"
                    />
                </div>
                <div>
                    <Label className="text-white/70">Phone</Label>
                    <Input 
                        value={formData['Phone']}
                        onChange={(e) => setFormData({...formData, 'Phone': e.target.value})}
                        className="bg-white/5 border-white/10 text-white mt-1"
                    />
                </div>
            </div>

            <div>
                <Label className="text-white/70">Access Token (for scheduling)</Label>
                <Input 
                    value={formData['Access Token']}
                    onChange={(e) => setFormData({...formData, 'Access Token': e.target.value})}
                    className="bg-white/5 border-white/10 text-white mt-1 font-mono text-sm"
                />
            </div>

            <div>
                <Label className="text-white/70">How We Met</Label>
                <Textarea 
                    value={formData['How We Met']}
                    onChange={(e) => setFormData({...formData, 'How We Met': e.target.value})}
                    className="bg-white/5 border-white/10 text-white mt-1"
                    rows={2}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-white/70">Interests</Label>
                    <Textarea 
                        value={formData['Interests']}
                        onChange={(e) => setFormData({...formData, 'Interests': e.target.value})}
                        className="bg-white/5 border-white/10 text-white mt-1"
                        rows={2}
                    />
                </div>
                <div>
                    <Label className="text-white/70">Gift Ideas</Label>
                    <Textarea 
                        value={formData['Gift Ideas']}
                        onChange={(e) => setFormData({...formData, 'Gift Ideas': e.target.value})}
                        className="bg-white/5 border-white/10 text-white mt-1"
                        rows={2}
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-white/20 text-white hover:bg-white/10">
                    Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-white text-black hover:bg-white/90">
                    {entry ? 'Save Changes' : 'Add Contact'}
                </Button>
            </div>
        </form>
    )
}
