'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link, Loader2, ArrowRight, ChevronDown } from 'lucide-react'
import { Playfair_Display } from '@/lib/font-shim'
import { createClient } from '@/utils/supabase/client'
import { dataStore, Entry } from '@/lib/data-store'

const playfair = Playfair_Display({ subsets: ['latin'] })

interface ResourceCreationSheetProps {
    notes: Entry[]
    defaultNoteId?: string
    onResourceCreated: () => void
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function ResourceCreationSheet({ notes, defaultNoteId, onResourceCreated, trigger, open: controlledOpen, onOpenChange }: ResourceCreationSheetProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    // Derived state for open/close
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen

    const setOpen = (val: boolean) => {
        if (isControlled && onOpenChange) onOpenChange(val)
        else setInternalOpen(val)
    }

    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [type, setType] = useState('link')
    const [noteId, setNoteId] = useState(defaultNoteId || '')

    // Sync defaultNoteId when it changes
    useEffect(() => {
        if (defaultNoteId) setNoteId(defaultNoteId)
    }, [defaultNoteId, open])

    const handleSave = async () => {
        if (!title) return

        setSaving(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const uid = user?.id || 'defaultUser'

        const resourceData = {
            title,
            url,
            type,
            noteId: noteId || null
        }

        await dataStore.addEntry(uid, 'resources-sb', resourceData)

        setSaving(false)
        setOpen(false)
        onResourceCreated()

        // Reset
        setTitle('')
        setUrl('')
        setType('link')
        setNoteId('')
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button className="bg-[#0A0A0A] border border-white/10 hover:bg-white/5 text-white gap-2">
                        <Link className="w-4 h-4 text-blue-500" /> Add Resource
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="bg-[#050505] border-l border-white/10 w-full sm:max-w-md p-0 flex flex-col z-[100]">
                <SheetHeader className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                        <Link className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">Forge: Resource</span>
                    </div>
                    <SheetTitle className={`${playfair.className} text-2xl text-white`}>
                        New Resource
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest">Title</label>
                        <Input
                            className="bg-white/5 border-white/10"
                            placeholder="Resource Name..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest">URL (Optional)</label>
                        <Input
                            className="bg-white/5 border-white/10"
                            placeholder="https://..."
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest">Type</label>
                        <div className="relative">
                            <select
                                value={type}
                                onChange={e => setType(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-md h-10 px-3 text-sm text-white appearance-none focus:outline-none focus:border-blue-500"
                            >
                                <option value="link">Link</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                <option value="file">File</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-white/50 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest">Assign to Note</label>
                        <div className="relative">
                            <select
                                value={noteId}
                                onChange={e => setNoteId(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-md h-10 px-3 text-sm text-white appearance-none focus:outline-none focus:border-blue-500"
                            >
                                <option value="">-- Select Note (Optional) --</option>
                                {notes.map(note => (
                                    <option key={note.id} value={note.id}>
                                        {note.data.Title || 'Untitled Note'}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-white/50 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-[#0A0A0A] flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving || !title}
                        className="bg-blue-500 text-white hover:bg-blue-400 font-bold tracking-wider"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Resource'}
                        {!saving && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
