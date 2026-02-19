'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LayoutGrid, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { Playfair_Display } from '@/lib/font-shim'
import { createClient } from '@/utils/supabase/client'
import { dataStore, Entry } from '@/lib/data-store'
import { AreaData } from './area-utils'
import { toast } from 'sonner'

const playfair = Playfair_Display({ subsets: ['latin'] })

export function AreaCreationSheet({ trigger, onAreaCreated }: { trigger?: React.ReactNode, onAreaCreated?: () => void }) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(0) // 0 = Intro/Mode
    const [saving, setSaving] = useState(false)

    // Initial State
    const [form, setForm] = useState<Partial<AreaData>>({
        title: '',
        ragStatus: 'Green',
        goal: '',
        icon: '🪐'
    })

    const setField = (key: keyof AreaData, value: any) => setForm(prev => ({ ...prev, [key]: value }))

    const handleSave = async () => {
        if (!form.title) return

        setSaving(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const uid = user?.id || 'defaultUser'
        const areaId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
        const now = new Date().toISOString()

        const areaData: AreaData = {
            title: form.title!,
            description: form.description,
            ragStatus: form.ragStatus || 'Green',
            goal: form.goal,
            icon: form.icon
        }

        const areaEntry: Entry = {
            id: areaId,
            userId: uid,
            microappId: 'areas-sb',
            data: areaData,
            createdAt: now,
            updatedAt: now
        }

        await dataStore.saveEntry(areaEntry)

        setSaving(false)
        setOpen(false)
        if (onAreaCreated) onAreaCreated()

        // Reset
        setForm({ title: '', ragStatus: 'Green', goal: '', icon: '🪐' })
        setStep(0)
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button className="bg-[#0A0A0A] border border-white/10 hover:bg-white/5 text-white gap-2">
                        <LayoutGrid className="w-4 h-4 text-purple-500" /> Initialize Area
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="bg-[#050505] border-l border-white/10 w-full sm:max-w-md p-0 flex flex-col z-[100]">
                <SheetHeader className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                        <LayoutGrid className="w-4 h-4 text-purple-500" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">Forge: Area Construct</span>
                    </div>
                    <SheetTitle className={`${playfair.className} text-2xl text-white`}>
                        {form.title || "New Domain Entity"}
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* Step 0: Intro (Skipping Mode Selection as it's just manual for now) */}
                    {step === 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-4 border border-white/10 rounded-lg bg-white/5 mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-500/10 rounded text-purple-500"><Sparkles className="w-5 h-5" /></div>
                                    <div className="font-bold text-white">Domain Forge</div>
                                </div>
                                <p className="text-xs text-white/40">Define a new Area of Responsibility. This will serve as a container for your projects and tasks.</p>
                            </div>

                            <label className="text-xs text-purple-500 uppercase tracking-wider font-bold">Stage 01: Core Identity</label>

                            <div className="space-y-2">
                                <label className="text-[10px] text-white/40 uppercase tracking-widest">Area Title</label>
                                <Input
                                    className="bg-white/5 border-white/10 h-12 text-lg font-medium"
                                    placeholder="Area: Growth"
                                    value={form.title}
                                    onChange={e => setField('title', e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-white/40 uppercase tracking-widest">Icon (Emoji)</label>
                                <Input
                                    className="bg-white/5 border-white/10 w-16 text-center text-xl"
                                    placeholder="🪐"
                                    value={form.icon}
                                    onChange={e => setField('icon', e.target.value)}
                                    maxLength={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-white/40 uppercase tracking-widest">High-Level Goal</label>
                                <Input
                                    className="bg-white/5 border-white/10"
                                    placeholder="What is the ultimate purpose of this Area?"
                                    value={form.goal || ''}
                                    onChange={e => setField('goal', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-[#0A0A0A] flex justify-end items-center">
                    <Button
                        onClick={handleSave}
                        disabled={saving || !form.title}
                        className="bg-purple-500 text-black hover:bg-purple-400 font-bold tracking-wider"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Establish Domain'}
                        {!saving && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                </div>

            </SheetContent>
        </Sheet>
    )
}
