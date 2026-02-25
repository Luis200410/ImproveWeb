'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ExternalLink, Loader2, FileText, Image as ImageIcon, Link as LinkIcon, Video, Save, Sparkles, UploadCloud, Globe } from 'lucide-react'
import { Entry, dataStore } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { sileo } from 'sileo'
import { summarizeResource } from '@/app/actions/summarize-resource'

interface ResourceDetailsSidebarProps {
    resource: Entry | null
    onClose: () => void
    onUpdate: (resource: Entry, updates: Partial<Entry['data']>) => void
}

export function ResourceDetailsSidebar({ resource, onClose, onUpdate }: ResourceDetailsSidebarProps) {
    const [form, setForm] = useState<Partial<Entry['data']>>({})
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [isSummarizing, setIsSummarizing] = useState(false)
    const [tempFile, setTempFile] = useState<{ content: string; name: string; mimeType: string } | null>(null)

    useEffect(() => {
        if (resource) {
            setForm({
                title: resource.data.title || '',
                url: resource.data.url || '',
                type: resource.data.type || 'link',
                description: resource.data.description || ''
            })
        }
    }, [resource])

    if (!resource) return null

    const setField = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

    const handleSave = async () => {
        setSaving(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const updatedData = { ...resource.data, ...form }

            const updatedEntry: Entry = {
                ...resource,
                data: updatedData,
                updatedAt: new Date().toISOString()
            }

            await dataStore.updateEntry(resource.id, updatedEntry)
            onUpdate(resource, form)
            sileo.success({ description: 'Resource updated' })
        } catch (error) {
            console.error('Error saving resource:', error)
            sileo.error({ description: 'Failed to update resource' })
        } finally {
            setSaving(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const reader = new FileReader()
            reader.onloadend = () => {
                setTempFile({
                    content: reader.result as string,
                    name: file.name,
                    mimeType: file.type
                })
                setField('url', '')
                sileo.success({ description: "File ready for synthesis" })
                setUploading(false)
            }
            reader.onerror = () => {
                sileo.error({ description: "Failed to read file" })
                setUploading(false)
            }
            reader.readAsDataURL(file)
        } catch (error: any) {
            console.error("File processing error:", error)
            sileo.error({ description: "Failed to process file" })
            setUploading(false)
        }
    }

    const handleSummarize = async () => {
        if (!form.type || !['website', 'image', 'file'].includes(form.type)) {
            sileo.error({ description: "Can only summarize websites, images, and documents." })
            return
        }

        if (!form.url && !tempFile) {
            sileo.error({ description: form.type === 'website' ? "Please provide a valid URL." : "Please upload a file or provide a URL first." })
            return
        }

        setIsSummarizing(true)
        try {
            let contentToPass = form.url as string
            let mimeType = ''

            // If it's an image or file, we fetch it and convert to base64 to send to server action
            if (form.type === 'image' || form.type === 'file') {
                if (tempFile) {
                    contentToPass = tempFile.content
                    mimeType = tempFile.mimeType
                } else if (form.url) {
                    const res = await fetch(form.url as string)
                    const blob = await res.blob()
                    mimeType = blob.type

                    // Convert blob to base64
                    const reader = new FileReader()
                    contentToPass = await new Promise<string>((resolve, reject) => {
                        reader.onloadend = () => resolve(reader.result as string)
                        reader.onerror = reject
                        reader.readAsDataURL(blob)
                    })
                }
            }

            const { summary } = await summarizeResource(form.type as any, contentToPass, mimeType)

            // Append summary to notes
            setField('description', (form.description ? form.description + '\n\n' : '') + '--- AI Synthesized Insight ---\n' + summary)
            sileo.success({ description: "AI Synthesis Complete" })

        } catch (error: any) {
            console.error("Summarization error:", error)
            sileo.error({ description: error.message || "Failed to synthesize resource" })
        } finally {
            setIsSummarizing(false)
        }
    }

    const types = [
        { id: 'website', icon: <Globe className="w-4 h-4" />, label: 'Website' },
        { id: 'link', icon: <LinkIcon className="w-4 h-4" />, label: 'Link' },
        { id: 'video', icon: <Video className="w-4 h-4" />, label: 'Video' },
        { id: 'file', icon: <FileText className="w-4 h-4" />, label: 'Document' },
        { id: 'image', icon: <ImageIcon className="w-4 h-4" />, label: 'Image' },
    ]

    return (
        <Sheet open={!!resource} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="bg-[#050505] border-l border-white/10 w-full sm:max-w-md p-0 flex flex-col z-[100] custom-scrollbar">
                <SheetHeader className="p-6 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                        {form.type === 'video' ? <Video className="w-4 h-4 text-blue-500" /> :
                            form.type === 'image' ? <ImageIcon className="w-4 h-4 text-blue-500" /> :
                                form.type === 'file' ? <FileText className="w-4 h-4 text-blue-500" /> :
                                    form.type === 'website' ? <Globe className="w-4 h-4 text-blue-500" /> :
                                        <LinkIcon className="w-4 h-4 text-blue-500" />}
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">Resource Details</span>
                    </div>
                    <SheetTitle className="text-xl text-white">
                        <Input
                            className="bg-transparent border-transparent px-0 text-xl font-bold hover:bg-white/5 focus-visible:ring-0 focus-visible:border-white/20 transition-all rounded"
                            value={form.title || ''}
                            onChange={(e) => setField('title', e.target.value)}
                            placeholder="Resource Title"
                        />
                    </SheetTitle>
                    {form.url && (
                        <a
                            href={form.url as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 w-fit mt-2"
                        >
                            <ExternalLink className="w-3 h-3" />
                            Open Resource
                        </a>
                    )}
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* URL or Upload */}
                    <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Location (URL) / Upload</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="https://..."
                                className="bg-[#0A0A0A] border-white/10 font-mono text-xs flex-1"
                                value={form.url || ''}
                                onChange={(e) => setField('url', e.target.value)}
                            />
                            {(form.type === 'image' || form.type === 'file') && (
                                <div className="relative shrink-0 flex items-center">
                                    <input
                                        type="file"
                                        accept={form.type === 'image' ? ".png,.jpg,.jpeg,.webp" : ".pdf,.txt,.doc,.docx"}
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        disabled={uploading}
                                    />
                                    <Button type="button" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 px-3 h-10 w-fit min-w-[3rem] text-xs">
                                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : tempFile ? <span className="text-white/80 max-w-[120px] truncate">{tempFile.name}</span> : <UploadCloud className="w-4 h-4 text-white/50" />}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Type Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Resource Type</label>
                        <div className="grid grid-cols-5 gap-2">
                            {types.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setField('type', t.id)}
                                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all ${form.type === t.id
                                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/80'
                                        }`}
                                >
                                    {t.icon}
                                    <span className="text-[9px] uppercase tracking-wider">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description/Notes */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Notes / Context</label>
                            {['website', 'image', 'file'].includes(form.type || '') && (
                                <button
                                    onClick={handleSummarize}
                                    disabled={isSummarizing || (!form.url && !tempFile)}
                                    className="text-[10px] flex items-center gap-1 font-bold tracking-wider uppercase text-amber-500 hover:text-amber-400 transition-colors disabled:opacity-50"
                                >
                                    {isSummarizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                    {isSummarizing ? 'Synthesizing...' : 'AI Synthesize'}
                                </button>
                            )}
                        </div>
                        <Textarea
                            placeholder="Why is this resource useful? What does it contain?"
                            className="bg-[#0A0A0A] border-white/10 min-h-[120px] resize-none text-sm"
                            value={form.description || ''}
                            onChange={(e) => setField('description', e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 bg-[#0A0A0A] flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-500 text-white w-full gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
