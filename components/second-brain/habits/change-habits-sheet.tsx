'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { Sparkles, Loader2, ArrowRight, Check, Plus, Edit2, Trash2 } from 'lucide-react'
import { Entry, dataStore } from '@/lib/data-store'
import { generateHabitChanges, HabitChangePlan } from '@/app/actions/generate-habit-changes'
import { sileo } from 'sileo'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

interface ChangeHabitsSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentHabits: Entry[]
    userId: string
    onChangeApplied: () => void
}

export function ChangeHabitsSheet({ open, onOpenChange, currentHabits, userId, onChangeApplied }: ChangeHabitsSheetProps) {
    const [intent, setIntent] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [plan, setPlan] = useState<HabitChangePlan | null>(null)
    const [isApplying, setIsApplying] = useState(false)

    const handleGenerate = async () => {
        if (!intent.trim()) return

        setIsGenerating(true)
        setPlan(null)

        try {
            const result = await generateHabitChanges(intent, currentHabits)

            if (result && !result.error) {
                setPlan(result)
            } else if (result && result.error) {
                sileo.error({ description: `Generation Error: ${result.error}` })
            } else {
                sileo.error({ description: 'Failed to generate changes. Please try again.' })
            }
        } catch (error: any) {
            console.error(error)
            sileo.error({ description: error.message || 'An error occurred. Check your API key.' })
        } finally {
            setIsGenerating(false)
        }
    }

    const handleApply = async () => {
        if (!plan) return

        setIsApplying(true)

        try {
            // Process Additions
            for (const habit of plan.add) {
                await dataStore.addEntry(userId, 'atomic-habits', habit)
            }

            // Process Modifications
            for (const mod of plan.modify) {
                const existing = currentHabits.find(h => h.id === mod.id)
                if (existing) {
                    const updatedData = { ...existing.data }
                    if (mod['Habit Name']) updatedData['Habit Name'] = mod['Habit Name']
                    if (mod['Category']) updatedData['Category'] = mod['Category']
                    if (mod['Frequency']) updatedData['Frequency'] = mod['Frequency']
                    if (mod['Time']) updatedData['Time'] = mod['Time']
                    if (mod['Duration (minutes)']) updatedData['Duration (minutes)'] = mod['Duration (minutes)']
                    if (mod['Cue']) updatedData['Cue'] = mod['Cue']
                    if (mod['Craving']) updatedData['Craving'] = mod['Craving']
                    if (mod['Response']) updatedData['Response'] = mod['Response']
                    if (mod['Reward']) updatedData['Reward'] = mod['Reward']

                    await dataStore.updateEntry(mod.id, updatedData)
                }
            }

            // Process Deletions
            for (const deleteId of plan.delete) {
                await dataStore.deleteEntry(deleteId)
            }

            sileo.success({ description: 'Routine permanently updated!' })
            reset()
            onChangeApplied()
        } catch (error) {
            console.error(error)
            sileo.error({ description: 'Failed to apply changes.' })
        } finally {
            setIsApplying(false)
        }
    }

    const reset = () => {
        setIntent('')
        setPlan(null)
        onOpenChange(false)
    }

    const hasNoChanges = plan && plan.add.length === 0 && plan.modify.length === 0 && plan.delete.length === 0;

    return (
        <Sheet open={open} onOpenChange={(isOpen) => {
            if (!isOpen) reset()
            else onOpenChange(isOpen)
        }}>
            <SheetContent className="w-full sm:w-[540px] bg-black border-l border-white/10 p-0 flex flex-col h-full !max-w-none overflow-y-auto">
                <SheetHeader className="p-6 border-b border-white/10 shrink-0 sticky top-0 bg-black/80 backdrop-blur z-10 flex flex-row items-center justify-between">
                    <div>
                        <SheetTitle className={`${playfair.className} text-3xl font-bold text-white flex items-center gap-3`}>
                            <Sparkles className="w-6 h-6 text-yellow-400" />
                            Change Habits
                        </SheetTitle>
                        <SheetDescription className={`${inter.className} text-white/60 mt-2`}>
                            Tell the AI what you want to change, and it will rebuild your routine.
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <div className="p-6 flex-1 flex flex-col gap-8">
                    {/* Step 1: Input */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <label className={`${inter.className} text-sm font-medium text-white/80 uppercase tracking-wider`}>
                            Your Intent
                        </label>
                        <Textarea
                            placeholder="e.g. 'I want to wake up at 5 instead of 6, and add 30 mins to learning French'"
                            value={intent}
                            onChange={(e) => setIntent(e.target.value)}
                            className="bg-white/5 border-white/10 text-white min-h-[120px] resize-none focus-visible:ring-yellow-400/50 mb-4 text-lg p-4"
                        />

                        {!plan && (
                            <Button
                                onClick={handleGenerate}
                                disabled={!intent.trim() || isGenerating}
                                className="w-full bg-yellow-400 text-black hover:bg-yellow-500 font-bold py-6 group"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Analyzing Routine...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Architect Changes
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        )}
                    </motion.div>

                    {/* Step 2: Plan Preview */}
                    <AnimatePresence mode="popLayout">
                        {plan && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-[1px] flex-1 bg-white/10" />
                                    <span className={`${inter.className} text-xs text-yellow-400 uppercase tracking-widest font-bold`}>Proposed Architecture</span>
                                    <div className="h-[1px] flex-1 bg-white/10" />
                                </div>

                                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-5">
                                    <p className={`${inter.className} text-sm text-yellow-200/80 leading-relaxed italic`}>
                                        "{plan.summary}"
                                    </p>
                                </div>

                                {hasNoChanges && (
                                    <p className="text-white/40 text-center py-4 text-sm font-mono">No structural changes detected from intent.</p>
                                )}

                                <div className="space-y-4">
                                    {/* Additions */}
                                    {plan.add.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-xs uppercase tracking-widest text-green-400 font-bold flex items-center gap-2">
                                                <Plus className="w-3 h-3" /> Habits Being Added
                                            </h4>
                                            {plan.add.map((habit, idx) => (
                                                <div key={`add-${idx}`} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-bold text-white text-lg">{habit['Habit Name']}</span>
                                                        <span className="text-xs font-mono text-green-400 bg-green-400/10 px-2 py-1 rounded">{habit['Time']} ({habit['Duration (minutes)']}m)</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-xs text-white/60 mt-2">
                                                        <div><strong className="text-white/40">Cue:</strong> {habit['Cue']}</div>
                                                        <div><strong className="text-white/40">Reward:</strong> {habit['Reward']}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Modifications */}
                                    {plan.modify.length > 0 && (
                                        <div className="space-y-3 pt-4 border-t border-white/10">
                                            <h4 className="text-xs uppercase tracking-widest text-blue-400 font-bold flex items-center gap-2">
                                                <Edit2 className="w-3 h-3" /> Habits Being Modified
                                            </h4>
                                            {plan.modify.map((mod, idx) => {
                                                const originalName = currentHabits.find(h => h.id === mod.id)?.data['Habit Name'] || 'Unknown Habit';
                                                return (
                                                    <div key={`mod-${idx}`} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                                        <div className="flex flex-col gap-1 mb-2">
                                                            <span className="font-bold text-white text-lg">{mod['Habit Name'] || originalName}</span>
                                                            <span className="text-xs text-blue-300/80 italic">{mod.rationale}</span>
                                                        </div>
                                                        <div className="flex gap-2 flex-wrap mt-2">
                                                            {mod['Time'] && <span className="text-xs font-mono text-white/80 bg-white/10 px-2 py-1 rounded">Time ⭢ {mod['Time']}</span>}
                                                            {mod['Duration (minutes)'] && <span className="text-xs font-mono text-white/80 bg-white/10 px-2 py-1 rounded">Duration ⭢ {mod['Duration (minutes)']}m</span>}
                                                            {mod['Cue'] && <span className="text-xs font-mono text-white/80 bg-white/10 px-2 py-1 rounded">Cue Change</span>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Deletions */}
                                    {plan.delete.length > 0 && (
                                        <div className="space-y-3 pt-4 border-t border-white/10">
                                            <h4 className="text-xs uppercase tracking-widest text-red-400 font-bold flex items-center gap-2">
                                                <Trash2 className="w-3 h-3" /> Habits Being Removed
                                            </h4>
                                            {plan.delete.map((delId, idx) => {
                                                const originalName = currentHabits.find(h => h.id === delId)?.data['Habit Name'] || 'Unknown Habit';
                                                return (
                                                    <div key={`del-${idx}`} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                                        <span className="font-bold text-red-200 line-through text-lg">{originalName}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        onClick={() => setPlan(null)}
                                        disabled={isApplying}
                                        className="flex-1 bg-transparent border border-white/20 text-white hover:bg-white/10"
                                    >
                                        Edit Intent
                                    </Button>
                                    <Button
                                        onClick={handleApply}
                                        disabled={hasNoChanges || isApplying}
                                        className="flex-2 bg-yellow-400 text-black hover:bg-yellow-500 font-bold px-8"
                                    >
                                        {isApplying ? (
                                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>
                                        ) : (
                                            <><Check className="w-5 h-5 mr-2" /> Apply Changes</>
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </SheetContent>
        </Sheet>
    )
}
