'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

interface NumberSliderProps {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    label?: string
    unit?: string
    showButtons?: boolean
}

export function NumberSlider({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    label,
    unit,
    showButtons = true
}: NumberSliderProps) {
    const [isFocused, setIsFocused] = useState(false)

    const percentage = ((value - min) / (max - min)) * 100

    const handleIncrement = () => {
        if (value < max) {
            onChange(Math.min(value + step, max))
        }
    }

    const handleDecrement = () => {
        if (value > min) {
            onChange(Math.max(value - step, min))
        }
    }

    return (
        <div className="space-y-3">
            {/* Value display */}
            <div className="flex items-center justify-between">
                {label && (
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {label}
                    </span>
                )}
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
                        {value}
                    </span>
                    {unit && (
                        <span className="text-sm text-slate-500">
                            {unit}
                        </span>
                    )}
                </div>
            </div>

            {/* Slider */}
            <div className="relative">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-200 rounded-full shadow-lg"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                    className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-800 border-4 border-blue-500 rounded-full shadow-lg transition-all duration-200 ${isFocused ? 'scale-125' : ''
                        }`}
                    style={{ left: `calc(${percentage}% - 12px)` }}
                />
            </div>

            {/* Min/Max labels */}
            <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{min}{unit}</span>
                <span>{max}{unit}</span>
            </div>

            {/* Increment/Decrement buttons */}
            {showButtons && (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleDecrement}
                        disabled={value <= min}
                        className="flex-1 py-2 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                        <Minus className="w-4 h-4" />
                        <span>Decrease</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={value >= max}
                        className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium"
                    >
                        <span>Increase</span>
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    )
}
