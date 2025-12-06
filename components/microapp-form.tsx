'use client'

import { useState, useEffect } from 'react'
import { Microapp, FieldDefinition, Entry, dataStore } from '@/lib/data-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { CustomSelect } from '@/components/ui/custom-select'
import { NumberSlider } from '@/components/ui/number-slider'
import { CheckboxToggle } from '@/components/ui/checkbox-toggle'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

interface MicroappFormProps {
    microapp: Microapp
    systemId: string
    onSave: (data: Record<string, any>) => void
    onCancel: () => void
    initialData?: Record<string, any>
    externalFieldUpdate?: { fieldName: string, value: any, label?: string } | null
    onRequestCreateRelation?: (targetMicroappId: string, fieldName: string, initialValue?: string) => void
}

export function MicroappForm({ microapp, systemId, onSave, onCancel, initialData = {}, externalFieldUpdate, onRequestCreateRelation }: MicroappFormProps) {
    const [formData, setFormData] = useState<Record<string, any>>(initialData)
    const [relationOptions, setRelationOptions] = useState<Record<string, { value: string, label: string }[]>>({})

    useEffect(() => {
        setFormData(initialData)
    }, [initialData])

    useEffect(() => {
        if (externalFieldUpdate) {
            setFormData(prev => ({ ...prev, [externalFieldUpdate.fieldName]: externalFieldUpdate.value }))

            // If label is provided, inject it into options immediately to avoid wait/race condition
            if (externalFieldUpdate.label) {
                setRelationOptions(prev => {
                    const currentOptions = prev[externalFieldUpdate.fieldName] || []
                    // Check if already exists
                    if (!currentOptions.find(o => o.value === externalFieldUpdate.value)) {
                        return {
                            ...prev,
                            [externalFieldUpdate.fieldName]: [
                                ...currentOptions,
                                { value: externalFieldUpdate.value, label: externalFieldUpdate.label! }
                            ]
                        }
                    }
                    return prev
                })
            }
        }
    }, [externalFieldUpdate])

    useEffect(() => {
        const loadOptions = async () => {
            const newOptions: Record<string, { value: string, label: string }[]> = {}
            for (const field of microapp.fields) {
                if (field.type === 'relation' && field.relationMicroappId) {
                    const entries = await dataStore.getEntries(field.relationMicroappId)
                    newOptions[field.name] = entries.map(e => {
                        const data = e.data
                        return {
                            value: e.id,
                            label: String(data['Name'] || data['Title'] || data['Project Name'] || data['Task'] || data['Goal'] || data['Destination'] || data['Area Name'] || 'Untitled')
                        }
                    })
                }
            }
            setRelationOptions(newOptions)
        }
        loadOptions()
    }, [microapp, externalFieldUpdate]) // Reload options if external update happens (likely a new relation created)

    const handleFieldChange = (fieldName: string, value: any) => {
        const newFormData = { ...formData, [fieldName]: value }

        // Automation: If Status is checked, set Completion Date to today
        if (fieldName === 'Status' && value === true) {
            const completionDateField = microapp.fields.find(f => f.name === 'Completion Date')
            if (completionDateField) {
                newFormData['Completion Date'] = new Date().toISOString().split('T')[0]
            }
        }

        // Automation: If Status is unchecked, clear Completion Date
        if (fieldName === 'Status' && value === false) {
            const completionDateField = microapp.fields.find(f => f.name === 'Completion Date')
            if (completionDateField) {
                newFormData['Completion Date'] = ''
            }
        }

        setFormData(newFormData)
    }

    const renderField = (field: FieldDefinition) => {
        const value = formData[field.name] || ''

        switch (field.type) {
            case 'textarea':
                return (
                    <Textarea
                        value={value}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="min-h-[100px] bg-black/20 border-white/10 text-white placeholder-white/30 focus:border-white/30 focus:ring-white/10"
                    />
                )
            case 'select':
                return (
                    <CustomSelect
                        value={value}
                        onChange={(val) => handleFieldChange(field.name, val)}
                        options={field.options || []}
                        required={field.required}
                        placeholder="Select an option..."
                    />
                )
            case 'checkbox':
                return (
                    <CheckboxToggle
                        checked={value === true}
                        onChange={(checked) => handleFieldChange(field.name, checked)}
                        label={field.name}
                    />
                )
            case 'number':
                if (field.min !== undefined && field.max !== undefined) {
                    return (
                        <NumberSlider
                            value={Number(value) || field.min}
                            onChange={(val) => handleFieldChange(field.name, val)}
                            min={field.min}
                            max={field.max}
                            step={1}
                            showButtons={true}
                        />
                    )
                }
                return (
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        required={field.required}
                        min={field.min}
                        max={field.max}
                        placeholder={field.placeholder}
                        className="bg-black/20 border-white/10 text-white placeholder-white/30 focus:border-white/30 focus:ring-white/10"
                    />
                )
            case 'date':
                return (
                    <DatePicker
                        value={value}
                        onChange={(val) => handleFieldChange(field.name, val)}
                        required={field.required}
                    />
                )
            case 'time':
                return (
                    <Input
                        type="time"
                        value={value}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        required={field.required}
                        className="bg-black/20 border-white/10 text-white placeholder-white/30 focus:border-white/30 focus:ring-white/10"
                    />
                )
            case 'relation':
                return (
                    <CustomSelect
                        value={value}
                        onChange={(val) => handleFieldChange(field.name, val)}
                        options={relationOptions[field.name] || []}
                        required={field.required}
                        placeholder="Select related item..."
                        allowCreate={true}
                        onCreate={(name) => {
                            if (field.relationMicroappId && onRequestCreateRelation) {
                                onRequestCreateRelation(field.relationMicroappId, field.name, name)
                            }
                        }}
                    />
                )
            default:
                return (
                    <Input
                        type={field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : 'text'}
                        value={value}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="bg-black/20 border-white/10 text-white placeholder-white/30 focus:border-white/30 focus:ring-white/10"
                    />
                )
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-wrap gap-4">
                {microapp.fields.map((field, index) => {
                    // Determine width class
                    let widthClass = 'w-full'
                    if (field.width === '1/2') widthClass = 'w-full md:w-[calc(50%-0.5rem)]'
                    if (field.width === '1/3') widthClass = 'w-full md:w-[calc(33.333%-0.67rem)]'
                    if (field.width === '2/3') widthClass = 'w-full md:w-[calc(66.666%-0.33rem)]'
                    if (field.width === '1/4') widthClass = 'w-full md:w-[calc(25%-0.75rem)]'
                    if (field.width === '3/4') widthClass = 'w-full md:w-[calc(75%-0.25rem)]'

                    return (
                        <motion.div
                            key={field.name}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`space-y-2 ${widthClass}`}
                        >
                            <Label className="text-white/80 uppercase tracking-wider text-sm">
                                {field.name}
                                {field.required && <span className="text-white/40 ml-1">*</span>}
                            </Label>
                            {renderField(field)}
                        </motion.div>
                    )
                })}
            </div>
            <div className="flex gap-4 pt-4">
                <Button
                    type="button"
                    onClick={onCancel}
                    variant="outline"
                    className="flex-1 border-white/10 text-white hover:bg-white/10 hover:text-white font-serif uppercase tracking-widest py-6"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="flex-1 bg-white text-black hover:bg-white/90 font-serif uppercase tracking-widest py-6 relative overflow-hidden group"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                    />
                    <span className="relative z-10">Save Entry</span>
                </Button>
            </div>
        </form>
    )
}
