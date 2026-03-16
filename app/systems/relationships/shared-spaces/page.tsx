'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
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
import { ArrowLeft, Plus, Link as LinkIcon, Image, FileText, Star, User, X, Sparkles, MessageSquare, ExternalLink, Heart } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

const SPACE_TYPES: Record<string, { icon: string; color: string; bg: string }> = {
    'Memory Drop': { icon: '💭', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    'Link': { icon: '🔗', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    'Photo': { icon: '📷', color: 'text-rose-400', bg: 'bg-rose-500/20' },
    'Note': { icon: '📝', color: 'text-amber-400', bg: 'bg-amber-500/20' },
    'Recommendation': { icon: '⭐', color: 'text-green-400', bg: 'bg-green-500/20' }
}

function SharedSpacesContent() {
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
        const spaces = await dataStore.getEntries('shared-spaces', userId)
        const contactsData = await dataStore.getEntries('contacts', userId)
        setEntries(spaces)
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

    const spacesByContact = useMemo(() => {
        const grouped: Record<string, Entry[]> = {}
        filteredEntries.forEach(entry => {
            const contact = entry.data['Contact'] || 'Unknown'
            if (!grouped[contact]) grouped[contact] = []
            grouped[contact].push(entry)
        })
        return grouped
    }, [filteredEntries])

    const handleSave = async (formData: Record<string, any>) => {
        if (editingEntry) {
            await dataStore.updateEntry(editingEntry.id, formData)
        } else {
            await dataStore.addEntry(userId, 'shared-spaces', formData)
        }
        setShowAddModal(false)
        setEditingEntry(null)
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
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-black to-black" />
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -top-1/2 -left-1/2 w-[100%] h-[100%] bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.2),transparent_50%)] blur-3xl" 
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
                                    <h1 className={`${playfair.className} text-2xl font-bold text-white`}>Shared Spaces</h1>
                                    <p className="text-white/40 text-sm">Collaborative memory drops with your contacts</p>
                                </div>
                            </div>
                            <Button 
                                onClick={() => { setEditingEntry(null); setShowAddModal(true) }}
                                className="bg-white text-black hover:bg-white/90"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Memory
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
                                All Spaces
                            </Button>
                            {Object.keys(spacesByContact).map(contact => (
                                <Button
                                    key={contact}
                                    variant={selectedContact === contact ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedContact(contact)}
                                    className={selectedContact === contact ? 'bg-white text-black' : 'border-white/20 text-white hover:bg-white/10'}
                                >
                                    {contact}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    {Object.entries(spacesByContact).map(([contact, items]) => (
                        <div key={contact} className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <User className="w-5 h-5 text-white/60" />
                                </div>
                                <h2 className="text-white font-medium">{contact}</h2>
                                <span className="text-white/40 text-sm">({items.length} items)</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <AnimatePresence>
                                    {items.map((item, idx) => {
                                        const type = SPACE_TYPES[item.data['Type']] || SPACE_TYPES['Note']
                                        
                                        return (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group relative"
                                            >
                                                <Card className="bg-white/[0.03] border-white/10 hover:border-white/20 transition-all h-full">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className={`w-10 h-10 rounded-xl ${type.bg} flex items-center justify-center text-lg`}>
                                                                {type.icon}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-xs px-2 py-1 rounded-full ${item.data['Shared By'] === 'Me' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                                                    {item.data['Shared By']}
                                                                </span>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                                                                    onClick={() => handleDelete(item.id)}
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        
                                                        <h4 className="text-white font-medium mb-1">{item.data['Space Name']}</h4>
                                                        <p className="text-white/60 text-sm line-clamp-3">{item.data['Content']}</p>
                                                        
                                                        <div className="mt-3 flex items-center justify-between text-xs text-white/40">
                                                            <span>{item.data['Date']}</span>
                                                            <span>{item.data['Type']}</span>
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
                                <Sparkles className="w-8 h-8 text-white/30" />
                            </div>
                            <h3 className="text-white font-medium mb-2">No shared memories yet</h3>
                            <p className="text-white/40 text-sm mb-4">Start sharing links, notes, and memories with your contacts</p>
                            <Button 
                                onClick={() => { setEditingEntry(null); setShowAddModal(true) }}
                                className="bg-white text-black hover:bg-white/90"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create your first shared space
                            </Button>
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
                                        {editingEntry ? 'Edit Memory' : 'Add Shared Memory'}
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <SharedSpaceForm 
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

export default function SharedSpacesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white/20 uppercase tracking-[0.5em] text-xs">Loading Spaces...</div>}>
            <SharedSpacesContent />
        </Suspense>
    )
}

function SharedSpaceForm({ entry, contacts, onSave, onCancel }: { entry: Entry | null; contacts: Entry[]; onSave: (data: Record<string, any>) => void; onCancel: () => void }) {
    const today = new Date().toISOString().split('T')[0]
    const [formData, setFormData] = useState({
        'Space Name': entry?.data['Space Name'] || '',
        'Contact': entry?.data['Contact'] || '',
        'Type': entry?.data['Type'] || 'Note',
        'Content': entry?.data['Content'] || '',
        'Shared By': entry?.data['Shared By'] || 'Me',
        'Date': entry?.data['Date'] || today
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label className="text-white/70">Space Name *</Label>
                <Input 
                    value={formData['Space Name']}
                    onChange={(e) => setFormData({...formData, 'Space Name': e.target.value})}
                    required
                    placeholder="Project ideas, Gift ideas, etc."
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
                    <Label className="text-white/70">Type *</Label>
                    <select 
                        value={formData['Type']}
                        onChange={(e) => setFormData({...formData, 'Type': e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white mt-1 p-2 rounded-md"
                    >
                        {Object.keys(SPACE_TYPES).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <Label className="text-white/70">Content *</Label>
                <Textarea 
                    value={formData['Content']}
                    onChange={(e) => setFormData({...formData, 'Content': e.target.value})}
                    required
                    placeholder="Link, note, or memory content..."
                    className="bg-white/5 border-white/10 text-white mt-1"
                    rows={4}
                />
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-white/20 text-white hover:bg-white/10">
                    Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-white text-black hover:bg-white/90">
                    {entry ? 'Save Changes' : 'Add Memory'}
                </Button>
            </div>
        </form>
    )
}
