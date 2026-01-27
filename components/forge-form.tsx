'use client'

import { useState, useMemo, useEffect } from 'react'
import { Microapp, FieldDefinition } from '@/lib/data-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { CustomSelect } from '@/components/ui/custom-select'
import { NumberSlider } from '@/components/ui/number-slider'
import { CheckboxToggle } from '@/components/ui/checkbox-toggle'
import { motion, AnimatePresence } from 'framer-motion'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { ArrowLeft, Sparkles, ChevronRight, Check, Plus } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

interface ForgeFormProps {
    microapp: Microapp
    systemId: string
    initialData?: Record<string, any>
    onSave: (data: Record<string, any>) => void
    onCancel: () => void
    entriesPromise?: Promise<any[]>
    onRequestCreateRelation?: (targetMicroappId: string, fieldName: string) => void
    relationOptions?: Record<string, { value: string, label: string }[]>
    variant?: 'fullscreen' | 'panel'
}

export function ForgeForm({ microapp, systemId, initialData = {}, onSave, onCancel, relationOptions = {}, onRequestCreateRelation, variant = 'fullscreen' }: ForgeFormProps) {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState<Record<string, any>>(initialData)
    const [direction, setDirection] = useState(0)

    // Group fields into stricter steps for focus mode
    const steps = useMemo(() => {
        const fields = microapp.fields
        if (fields.length === 1) return [fields]

        // If specific width fields exist, group them if they fit together in a "slide"
        // Otherwise, break them down more granularly for the "Step by Step" feel
        // The user wants "not all the info at once". So we should be aggressive in splitting.

        const chunks: FieldDefinition[][] = []
        let currentChunk: FieldDefinition[] = []

        fields.forEach((f, idx) => {
            // Rule: If field is 'full' width or 'textarea', it gets its own step usually.
            // If it's small (1/2, 1/3), we can group them.

            // Start of loop
            if (currentChunk.length === 0) {
                currentChunk.push(f)
            } else {
                const prev = currentChunk[currentChunk.length - 1]

                // Breaking conditions:
                // 1. Current or Prev is a Relation (Relations deserve focus)
                // 2. Current or Prev is a TextArea (Textareas deserve focus)
                // 3. Current is Width 'full'
                // 4. Current chunk already has 2 items (limit to 2-3 per screen for focus)

                const isComplex = (field: FieldDefinition) => field.type === 'relation' || field.type === 'textarea' || field.width === 'full'

                if (isComplex(f) || isComplex(prev) || currentChunk.length >= 3) {
                    chunks.push(currentChunk)
                    currentChunk = [f]
                } else {
                    currentChunk.push(f)
                }
            }
        })
        if (currentChunk.length > 0) chunks.push(currentChunk)

        return chunks
    }, [microapp.fields])

    const currentFields = steps[step - 1] || []
    const totalSteps = steps.length

    const handleFieldChange = (fieldName: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }))
    }

    const nextStep = () => {
        if (step < totalSteps) {
            setDirection(1)
            setStep(s => s + 1)
        } else {
            onSave(formData)
        }
    }

    const prevStep = () => {
        if (step > 1) {
            setDirection(-1)
            setStep(s => s - 1)
        } else {
            onCancel()
        }
    }

    const isStepValid = useMemo(() => {
        return currentFields.every(f => {
            if (!f.required) return true
            const val = formData[f.name]
            if (Array.isArray(val)) return val.length > 0
            if (typeof val === 'number') return true // 0 is valid
            return val !== undefined && val !== '' && val !== null
        })
    }, [currentFields, formData])

    // Detect Enter key for quick nav (except textareas)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                // If focusing a textarea, don't submit.
                if (document.activeElement?.tagName === 'TEXTAREA') return
                // Check if step valid
                if (isStepValid) nextStep()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isStepValid, nextStep])


    const renderField = (field: FieldDefinition) => {
        const value = formData[field.name] || ''
        const autoFocus = currentFields.indexOf(field) === 0 // Autofocus first field of step

        // Special UI for Relations in Forge Mode
        if (field.type === 'relation') {
            const hasValue = !!value
            return (
                <div className="space-y-4">
                    {!hasValue ? (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                className="p-8 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition text-left group flex flex-col items-center justify-center text-center gap-2"
                                onClick={() => { }}
                            >
                                <span className="block text-xs uppercase tracking-wider text-white/50">Select Existing</span>
                                <span className="block font-serif text-2xl text-white group-hover:text-amber-200">Connect {field.name}</span>
                            </button>
                            <button
                                type="button"
                                className="p-8 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition text-left group flex flex-col items-center justify-center text-center gap-2"
                                onClick={() => onRequestCreateRelation?.(field.relationMicroappId!, field.name)}
                            >
                                <span className="block text-xs uppercase tracking-wider text-white/50">Create New</span>
                                <span className="block font-serif text-2xl text-white group-hover:text-emerald-200">Forge {field.name}</span>
                            </button>
                        </div>
                    ) : null}

                    {/* Always show select if we want to change or if we just clicked above (logic pending for click above) */}
                    {/* For simplicity in this focus mode, show Select immediately below, looks clean */}
                    <div className="relative">
                        <CustomSelect
                            value={value}
                            onChange={(val) => handleFieldChange(field.name, val)}
                            options={relationOptions[field.name] || []}
                            required={field.required}
                            placeholder={`Select ${field.name}...`}
                        />
                    </div>
                </div>
            )
        }

        // Standard Fields
        const inputClasses = "bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-4 text-2xl md:text-3xl font-serif placeholder:text-white/20 focus-visible:ring-0 focus-visible:border-white transition-colors h-auto"
        const labelClasses = "text-white/50 text-xs uppercase tracking-[0.2em] mb-4 block"

        switch (field.type) {
            case 'textarea':
                return (
                    <div className="space-y-2">
                        <Textarea
                            autoFocus={autoFocus}
                            value={value}
                            onChange={e => handleFieldChange(field.name, e.target.value)}
                            className="bg-white/5 border-white/10 min-h-[200px] text-lg resize-none p-6"
                            placeholder={field.placeholder || "Start typing..."}
                        />
                    </div>
                )
            case 'select':
                return (
                    <CustomSelect
                        value={value}
                        onChange={v => handleFieldChange(field.name, v)}
                        options={field.options || []}
                        placeholder="Select an option"
                    />
                )
            case 'date':
                return (
                    <div className="border border-white/10 rounded-lg p-2 bg-white/5 inline-block">
                        <DatePicker value={value} onChange={v => handleFieldChange(field.name, v)} />
                    </div>
                )
            case 'number':
                if (field.min !== undefined && field.max !== undefined) {
                    return <NumberSlider value={Number(value) || field.min} onChange={v => handleFieldChange(field.name, v)} min={field.min} max={field.max} />
                }
                return <Input type="number" autoFocus={autoFocus} value={value} onChange={e => handleFieldChange(field.name, e.target.value)} className={inputClasses} placeholder="0" />
            case 'checkbox':
                return (
                    <div className="py-4">
                        <CheckboxToggle checked={value === true} onChange={v => handleFieldChange(field.name, v)} label={field.name} />
                    </div>
                )
            default:
                return <Input autoFocus={autoFocus} value={value} onChange={e => handleFieldChange(field.name, e.target.value)} className={inputClasses} placeholder={field.placeholder || "Type here..."} />
        }
    }

    const variants = {
        enter: (d: number) => ({ x: d > 0 ? 50 : -50, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d < 0 ? 50 : -50, opacity: 0 })
    }

    // Styles for Panel vs Fullscreen
    const containerClasses = variant === 'panel'
        ? "fixed inset-y-0 right-0 z-[100] w-full md:w-[600px] bg-[#0A0A0A] border-l border-white/10 flex flex-col shadow-2xl"
        : "fixed inset-0 z-[100] bg-black text-white flex flex-col"

    const backdropClasses = variant === 'panel'
        ? "fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm"
        : "hidden"

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={backdropClasses}
                onClick={onCancel}
            />
            <motion.div
                initial={variant === 'panel' ? { x: '100%' } : { opacity: 0 }}
                animate={variant === 'panel' ? { x: 0 } : { opacity: 1 }}
                exit={variant === 'panel' ? { x: '100%' } : { opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={containerClasses}
            >
                {/* Header / Nav */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="text-white/60 hover:text-white pl-0 hover:bg-transparent" onClick={onCancel}>
                            <ArrowLeft className="w-5 h-5 mr-2" /> {variant === 'panel' ? 'Close' : 'Back'}
                        </Button>
                        <span className="text-white/20">/</span>
                        <span className="text-xs uppercase tracking-[0.2em] text-white/50">Forge {microapp.name}</span>
                    </div>
                </div>

                {/* Segmented Progress Bar */}
                <div className="px-6 flex gap-2 pt-6">
                    {Array.from({ length: totalSteps }).map((_, idx) => {
                        const stepNum = idx + 1
                        const isActive = step === stepNum
                        const isPast = step > stepNum

                        return (
                            <div key={idx} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-white"
                                    initial={{ width: isPast ? "100%" : "0%" }}
                                    animate={{ width: isActive ? "100%" : isPast ? "100%" : "0%" }} // Simple active fill, could be animated over time if needed
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        )
                    })}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col justify-start w-full px-6 pt-12 pb-12 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="w-full space-y-8"
                        >
                            {/* Step Title / Question */}
                            <div className="space-y-4">
                                {/* Infer title from first field if simple */}
                                <h2 className={`${playfair.className} ${variant === 'panel' ? 'text-4xl' : 'text-5xl md:text-7xl'} text-white leading-[1.1]`}>
                                    {currentFields[0].name === 'Task' ? 'What needs to be done?' :
                                        currentFields[0].name === 'Project Name' ? 'What is the project?' :
                                            currentFields[0].name === 'Goal Name' ? 'What is the goal?' :
                                                currentFields[0].name}
                                </h2>
                                {currentFields[0].description ? (
                                    <p className={`${inter.className} ${variant === 'panel' ? 'text-lg' : 'text-xl md:text-2xl'} text-white/60 max-w-2xl`}>{currentFields[0].description}</p>
                                ) : null}
                            </div>

                            {/* Fields Container */}
                            <div className="flex flex-wrap gap-x-8 gap-y-8">
                                {currentFields.map(field => {
                                    let widthClass = 'w-full'
                                    if (field.width === '1/2') widthClass = 'w-full md:w-[calc(50%-1rem)]'
                                    if (field.width === '1/3') widthClass = 'w-full md:w-[calc(33.333%-1.33rem)]'

                                    return (
                                        <div key={field.name} className={`${widthClass}`}>
                                            <div className="space-y-4">
                                                {/* Label only helps if multiple fields, otherwise title covers it */}
                                                {currentFields.length > 1 && (
                                                    <Label className="text-white/50 text-xs uppercase tracking-[0.2em] mb-2 block font-semibold">
                                                        {field.name}
                                                    </Label>
                                                )}
                                                {renderField(field)}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-6 flex justify-between items-center bg-white/5 border-t border-white/10">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        className="text-white/40 hover:text-white uppercase tracking-widest text-xs"
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={nextStep}
                        disabled={!isStepValid}
                        className="bg-white text-black hover:bg-emerald-200 transition-colors rounded-full px-8 py-4 text-sm uppercase tracking-widest font-semibold"
                    >
                        {step === totalSteps ? (
                            <span className="flex items-center gap-2">Complete <Check className="w-4 h-4 ml-1" /></span>
                        ) : (
                            <span className="flex items-center gap-2">Next <ChevronRight className="w-4 h-4 ml-1" /></span>
                        )}
                    </Button>
                </div>
            </motion.div>
        </>
    )
}
