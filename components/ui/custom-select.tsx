'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Search, Plus } from 'lucide-react'

interface SelectOption {
    value: string
    label: string
    icon?: string
}

interface CustomSelectProps {
    value: string
    onChange: (value: string) => void
    options: string[] | SelectOption[]
    required?: boolean
    placeholder?: string
    onCreate?: (value: string) => void
    allowCreate?: boolean
}

export function CustomSelect({ value, onChange, options, required, placeholder = 'Select...', onCreate, allowCreate }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const selectRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setSearchTerm('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const normalizedOptions: SelectOption[] = options.map(opt =>
        typeof opt === 'string' ? { value: opt, label: opt } : opt
    )

    const filteredOptions = normalizedOptions.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedOption = normalizedOptions.find(opt => opt.value === value)

    const handleSelect = (optionValue: string) => {
        onChange(optionValue)
        setIsOpen(false)
        setSearchTerm('')
    }

    const handleCreate = () => {
        if (onCreate && searchTerm) {
            onCreate(searchTerm)
            setIsOpen(false)
            setSearchTerm('')
        }
    }

    return (
        <div className="relative" ref={selectRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 flex items-center justify-between group"
            >
                <span className={`flex items-center gap-2 ${selectedOption ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                    {selectedOption?.icon && <span className="text-xl">{selectedOption.icon}</span>}
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Search */}
                    <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search or create..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Options */}
                    <div className="max-h-64 overflow-y-auto">
                        {filteredOptions.length === 0 && !allowCreate && (
                            <div className="px-4 py-8 text-center text-slate-400">
                                No options found
                            </div>
                        )}

                        {filteredOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={`
                  w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors
                  ${option.value === value ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                `}
                            >
                                <span className="flex items-center gap-3">
                                    {option.icon && <span className="text-xl">{option.icon}</span>}
                                    <span className={`font-medium ${option.value === value ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {option.label}
                                    </span>
                                </span>
                                {option.value === value && (
                                    <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                )}
                            </button>
                        ))}

                        {allowCreate && searchTerm && !filteredOptions.find(o => o.label.toLowerCase() === searchTerm.toLowerCase()) && (
                            <button
                                type="button"
                                onClick={handleCreate}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-blue-600 dark:text-blue-400"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="font-medium">Create "{searchTerm}"</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
